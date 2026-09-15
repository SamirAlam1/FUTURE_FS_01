/**
 * loginThrottle.test.js — self-contained verification suite
 *
 * Run: node src/middleware/loginThrottle.test.js
 *
 * No test framework needed — uses plain Node.js assert.
 * Uses the exported _store, _recordFailure, _recordSuccess helpers to drive
 * state without making real HTTP calls.
 */

'use strict'

const assert = require('assert')

// ─── Colour helpers ────────────────────────────────────────────
const G = s => `\x1b[32m${s}\x1b[0m`
const R = s => `\x1b[31m${s}\x1b[0m`
const B = s => `\x1b[1m${s}\x1b[0m`
const Y = s => `\x1b[33m${s}\x1b[0m`

let passed = 0, failed = 0

function test(name, fn) {
  try {
    const r = fn()
    if (r && typeof r.then === 'function') {
      return r.then(() => { console.log(G('  ✓'), name); passed++ })
             .catch(err => { console.log(R('  ✗'), name, '\n   ', err.message); failed++ })
    }
    console.log(G('  ✓'), name); passed++
  } catch (err) {
    console.log(R('  ✗'), name, '\n   ', err.message); failed++
  }
}

// Fresh copy of the module for each section so state doesn't bleed
function freshThrottle() {
  // Clear require cache so each block gets a clean store
  const key = require.resolve('./loginThrottle')
  delete require.cache[key]
  return require('./loginThrottle')
}

// ─── Mock req/res/next ─────────────────────────────────────────
function mockReq(email) {
  return { method: 'POST', body: { email } }
}

function mockRes(statusCode = 200) {
  const listeners = {}
  const res = {
    statusCode,
    _status: null,
    _body: null,
    headers: {},
    set(k, v) { this.headers[k] = v; return this },
    status(code) { this._status = code; this.statusCode = code; return this },
    json(body) { this._body = body; this._emit('finish'); return this },
    on(event, fn) { listeners[event] = fn },
    _emit(event) { if (listeners[event]) listeners[event]() },
  }
  return res
}

// ─── SECTION 1: Unit tests on store helpers ────────────────────
async function section1() {
  console.log(B('\n1. Store helpers — recordFailure / recordSuccess'))

  const throttle = freshThrottle()

  test('store is empty initially', () => {
    assert.strictEqual(throttle._store.size, 0)
  })

  test('recordFailure creates entry with consecutiveFails=1', () => {
    throttle._recordFailure('user@test.com')
    const e = throttle._store.get('user@test.com')
    assert.strictEqual(e.consecutiveFails, 1)
    assert.strictEqual(e.lockedUntil, null)
  })

  test('recordFailure increments on repeated calls', () => {
    throttle._recordFailure('user@test.com')
    throttle._recordFailure('user@test.com')
    assert.strictEqual(throttle._store.get('user@test.com').consecutiveFails, 3)
  })

  test('recordSuccess deletes entry', () => {
    throttle._recordSuccess('user@test.com')
    assert.strictEqual(throttle._store.has('user@test.com'), false)
  })

  test('separate emails tracked independently', () => {
    throttle._recordFailure('a@test.com')
    throttle._recordFailure('a@test.com')
    throttle._recordFailure('b@test.com')
    assert.strictEqual(throttle._store.get('a@test.com').consecutiveFails, 2)
    assert.strictEqual(throttle._store.get('b@test.com').consecutiveFails, 1)
  })

  test('lockedUntil set after MAX_FAILURES (10)', () => {
    const throttle2 = freshThrottle()
    for (let i = 0; i < 10; i++) throttle2._recordFailure('lock@test.com')
    const e = throttle2._store.get('lock@test.com')
    assert.ok(e.lockedUntil instanceof Date, 'lockedUntil should be a Date')
    assert.ok(e.lockedUntil > new Date(), 'lockedUntil should be in the future')
  })
}

// ─── SECTION 2: Middleware pass-through tests ──────────────────
async function section2() {
  console.log(B('\n2. Middleware — pass-through and 429 blocking'))
  const throttle = freshThrottle()

  await test('allows request with no failures (next called)', async () => {
    let nextCalled = false
    const req = mockReq('clean@test.com')
    const res = mockRes()
    await throttle(req, res, () => { nextCalled = true })
    assert.ok(nextCalled, 'next() should be called')
    assert.strictEqual(res._status, null, 'should not set status')
  })

  await test('allows request when email missing in body (next called)', async () => {
    let nextCalled = false
    const req = { method: 'POST', body: {} }
    const res = mockRes()
    await throttle(req, res, () => { nextCalled = true })
    assert.ok(nextCalled)
  })

  await test('allows non-POST through without checking store', async () => {
    let nextCalled = false
    const req = { method: 'GET', body: {} }
    const res = mockRes()
    await throttle(req, res, () => { nextCalled = true })
    assert.ok(nextCalled)
  })

  await test('returns 429 when account is locked (next NOT called)', async () => {
    const throttle2 = freshThrottle()
    // Manually lock the account
    for (let i = 0; i < 10; i++) throttle2._recordFailure('locked@test.com')

    let nextCalled = false
    const req = mockReq('locked@test.com')
    const res = mockRes()
    await throttle2(req, res, () => { nextCalled = true })

    assert.ok(!nextCalled, 'next() should NOT be called when locked')
    assert.strictEqual(res._status, 429, 'status should be 429')
    assert.ok(res._body.message.includes('locked'), 'message should mention locked')
    assert.ok(res.headers['Retry-After'], 'Retry-After header should be set')
  })

  await test('Retry-After header is a positive integer (seconds)', async () => {
    const throttle2 = freshThrottle()
    for (let i = 0; i < 10; i++) throttle2._recordFailure('retry@test.com')
    const req = mockReq('retry@test.com')
    const res = mockRes()
    await throttle2(req, res, () => {})
    const retryAfter = parseInt(res.headers['Retry-After'], 10)
    assert.ok(retryAfter > 0 && retryAfter <= 900, `Retry-After=${retryAfter} should be 1–900 s`)
  })
}

// ─── SECTION 3: res.on('finish') hooks ────────────────────────
async function section3() {
  console.log(B('\n3. Finish hook — failure counting and success reset'))
  const throttle = freshThrottle()

  await test('401 response increments failure count via finish hook', async () => {
    const req  = mockReq('hook401@test.com')
    const res  = mockRes()
    await throttle(req, res, () => {})
    // Simulate the login handler returning 401
    res.status(401).json({ success: false, message: 'Invalid credentials' })
    const e = throttle._store.get('hook401@test.com')
    assert.ok(e, 'entry should exist')
    assert.strictEqual(e.consecutiveFails, 1)
  })

  await test('200 response clears failure count via finish hook', async () => {
    // Pre-load 3 failures
    throttle._recordFailure('hook200@test.com')
    throttle._recordFailure('hook200@test.com')
    throttle._recordFailure('hook200@test.com')
    assert.strictEqual(throttle._store.get('hook200@test.com').consecutiveFails, 3)

    const req = mockReq('hook200@test.com')
    const res = mockRes()
    await throttle(req, res, () => {})
    // Simulate successful login
    res.status(200).json({ success: true })
    assert.ok(!throttle._store.has('hook200@test.com'), 'entry should be deleted on success')
  })

  await test('400 response does NOT increment failure count', async () => {
    const req = mockReq('hook400@test.com')
    const res = mockRes()
    await throttle(req, res, () => {})
    res.status(400).json({ success: false, message: 'Invalid email format' })
    // 400 = bad input, not wrong password — should not count
    assert.ok(!throttle._store.has('hook400@test.com'), 'entry should NOT exist for 400')
  })

  await test('10 consecutive 401s trigger lockout', async () => {
    const throttle2 = freshThrottle()
    for (let i = 0; i < 10; i++) {
      const req = mockReq('locktest@test.com')
      const res = mockRes()
      await throttle2(req, res, () => {})
      res.status(401).json({ success: false })
    }
    const e = throttle2._store.get('locktest@test.com')
    assert.ok(e?.lockedUntil instanceof Date, 'account should be locked after 10 failures')
    assert.ok(e.lockedUntil > new Date(), 'lock should be in the future')
  })

  await test('11th attempt after 10 failures is blocked (429)', async () => {
    const throttle2 = freshThrottle()
    // Drive 10 failures through the hook
    for (let i = 0; i < 10; i++) {
      const req = mockReq('block11@test.com')
      const res = mockRes()
      await throttle2(req, res, () => {})
      res.status(401).json({ success: false })
    }
    // 11th attempt
    let nextCalled = false
    const req = mockReq('block11@test.com')
    const res = mockRes()
    await throttle2(req, res, () => { nextCalled = true })
    assert.ok(!nextCalled, '11th attempt must be blocked')
    assert.strictEqual(res._status, 429)
  })
}

// ─── SECTION 4: Email normalisation ───────────────────────────
async function section4() {
  console.log(B('\n4. Email normalisation — case/whitespace bypass prevention'))
  const throttle = freshThrottle()

  await test('UPPER@CASE.COM and upper@case.com map to same counter via middleware', async () => {
    // _recordFailure is an internal fn and takes pre-normalised keys.
    // Normalisation happens in the middleware itself. Test that here.
    const req1 = { method: 'POST', body: { email: 'MIXEDCASE@TEST.COM' } }
    const res1 = mockRes()
    await throttle(req1, res1, () => {})
    res1.status(401).json({ success: false })

    const req2 = { method: 'POST', body: { email: 'mixedcase@test.com' } }
    const res2 = mockRes()
    await throttle(req2, res2, () => {})
    res2.status(401).json({ success: false })

    // Both should map to 'mixedcase@test.com'
    const e = throttle._store.get('mixedcase@test.com')
    assert.ok(e, 'normalised entry should exist')
    assert.ok(!throttle._store.has('MIXEDCASE@TEST.COM'), 'un-normalised key should not be present')
    assert.strictEqual(e.consecutiveFails, 2, 'both attempts should count against same account')
  })

  await test('email with leading/trailing spaces normalises correctly', async () => {
    let nextCalled = false
    const req = { method: 'POST', body: { email: '  spaces@test.com  ' } }
    const res = mockRes()
    await throttle(req, res, () => { nextCalled = true })
    res.status(401).json({ success: false })
    // Check under the normalised key
    const e = throttle._store.get('spaces@test.com')
    assert.ok(e, 'trimmed key should exist')
    assert.strictEqual(e.consecutiveFails, 1)
    assert.ok(nextCalled, 'next should still be called (not locked yet)')
  })
}

// ─── SECTION 5: Integration — full login simulation ────────────
async function section5() {
  console.log(B('\n5. Integration — simulated login sequence'))
  const throttle = freshThrottle()

  await test('first 3 wrong passwords: no delay, all pass through', async () => {
    for (let i = 1; i <= 3; i++) {
      let nextCalled = false
      const req = mockReq('integ@test.com')
      const res = mockRes()
      const t0 = Date.now()
      await throttle(req, res, () => { nextCalled = true })
      res.status(401).json({ success: false })
      const elapsed = Date.now() - t0
      assert.ok(nextCalled, `attempt ${i}: next should be called`)
      assert.ok(elapsed < 200, `attempt ${i}: should have no delay (elapsed=${elapsed}ms)`)
    }
    assert.strictEqual(throttle._store.get('integ@test.com').consecutiveFails, 3)
  })

  await test('4th wrong password: delay applied (≥ 400 ms)', async () => {
    const req = mockReq('integ@test.com')
    const res = mockRes()
    const t0 = Date.now()
    await throttle(req, res, () => {})
    res.status(401).json({ success: false })
    const elapsed = Date.now() - t0
    // Delay schedule: 500ms ± 10% → min 450ms. Allow generous 400ms lower bound.
    assert.ok(elapsed >= 400, `delay should be applied (elapsed=${elapsed}ms, expected ≥400ms)`)
  })

  await test('correct login after failures resets counter', async () => {
    const req = mockReq('integ@test.com')
    const res = mockRes()
    await throttle(req, res, () => {})
    res.status(200).json({ success: true })  // success
    assert.ok(!throttle._store.has('integ@test.com'), 'counter should be cleared after success')
  })

  await test('after reset, next failure starts count from 1 again', async () => {
    const req = mockReq('integ@test.com')
    const res = mockRes()
    await throttle(req, res, () => {})
    res.status(401).json({ success: false })
    assert.strictEqual(throttle._store.get('integ@test.com').consecutiveFails, 1)
  })
}

// ─── SECTION 6: Timing sanity ──────────────────────────────────
async function section6() {
  console.log(B('\n6. Timing sanity — delay schedule is monotonically increasing'))

  test('DELAY_SCHEDULE values are strictly ascending', () => {
    // Re-read the raw module values via a fresh require
    const src = require('fs').readFileSync(
      require('path').join(__dirname, 'loginThrottle.js'), 'utf8')
    const match = src.match(/const DELAY_SCHEDULE = \[([^\]]+)\]/)
    assert.ok(match, 'DELAY_SCHEDULE must be defined')
    const values = match[1].split(',').map(s => parseInt(s.trim(), 10))
    for (let i = 1; i < values.length; i++) {
      assert.ok(values[i] > values[i-1],
        `DELAY_SCHEDULE[${i}]=${values[i]} must be > DELAY_SCHEDULE[${i-1}]=${values[i-1]}`)
    }
  })

  await test('blocked locked account responds in < 1 s (fast-fail, not real-delay)', async () => {
    const throttle = freshThrottle()
    for (let i = 0; i < 10; i++) throttle._recordFailure('timing@test.com')
    const req = mockReq('timing@test.com')
    const res = mockRes()
    const t0 = Date.now()
    await throttle(req, res, () => {})
    const elapsed = Date.now() - t0
    // Jitter on 200ms base → max ~220ms; well under 1s
    assert.ok(elapsed < 1000, `locked response should be fast (elapsed=${elapsed}ms)`)
    assert.strictEqual(res._status, 429)
  })
}

// ─── Runner ────────────────────────────────────────────────────
;(async () => {
  console.log(B('\n=== loginThrottle — test suite ==='))
  await section1()
  await section2()
  await section3()
  await section4()
  await section5()
  await section6()

  console.log(`\n${B('Results:')} ${G(passed + ' passed')}  ${failed > 0 ? R(failed + ' failed') : Y('0 failed')}`)

  if (failed > 0) {
    console.log(R('\nSome tests failed — review output above.'))
    process.exit(1)
  } else {
    console.log(G('\nAll tests passed.'))
    process.exit(0)
  }
})()
