# Deployment Guide

## Frontend → Vercel

1. Push the `Front-end/` folder to a GitHub repo
2. Import the repo in Vercel
3. Set environment variables in Vercel dashboard:
   ```
   VITE_API_URL=https://api.samiralam.dev/api
   ```
4. Build command: `npm run build`
5. Output directory: `dist`
6. `vercel.json` is already included — handles SPA routing and security headers

---

## Backend → Render

1. Push the `Back-end/` folder to a GitHub repo
2. Create a new **Web Service** in Render
3. Set start command: `node src/server.js`
4. Set environment variables:
   ```
   PORT=5000
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/portfolio
   JWT_SECRET=<output of: openssl rand -base64 64>
   JWT_EXPIRES_IN=1d
   FRONTEND_URL=https://samiralam.dev
   ```
   > **JWT_SECRET must be at least 32 characters.** The server refuses to start with a shorter secret.
   > Use `openssl rand -base64 64` to generate a strong one.

5. After deploy, run the seed script once from the Render Shell:
   ```bash
   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=YourStrongPass1 node src/seed.js
   ```
   The seed script enforces password complexity (min 8 chars, 1 uppercase, 1 lowercase, 1 digit).

---

## MongoDB Atlas

1. Create a free cluster at https://cloud.mongodb.com
2. Add your Render server IP to Network Access (or allow `0.0.0.0/0` temporarily)
3. Create a database user with `readWrite` on the `portfolio` database
4. Copy the `mongodb+srv://` connection string → `MONGODB_URI`

---

## Cookie / CORS Notes

The admin panel uses **httpOnly cookies** for authentication. Because the frontend (Vercel)
and backend (Render) are on different origins, the following is required and already configured:

| Setting | Value | Why |
|---------|-------|-----|
| `SameSite=None` | Cookie attribute | Cross-origin requests don't send `SameSite=Strict/Lax` cookies |
| `Secure=true` | Cookie attribute | `SameSite=None` is rejected by browsers without `Secure` |
| `credentials: true` | CORS header | Server must echo `Access-Control-Allow-Credentials: true` |
| `FRONTEND_URL` env var | Backend config | Must exactly match the deployed frontend URL — used as the CORS allowed origin |

If you change the frontend URL, update `FRONTEND_URL` on the backend and redeploy.

---

## Alternative Platforms

| Service | Notes |
|---------|-------|
| Railway | Auto-detects Node.js, easy env vars |
| Fly.io | Good for latency-sensitive apps |
| Netlify | Frontend only (use Netlify Functions for API) |
| DigitalOcean App Platform | Full-stack, managed MongoDB |

---

## Production Checklist

- [ ] `NODE_ENV=production` set on backend
- [ ] `JWT_SECRET` ≥ 32 chars (generated with `openssl rand -base64 64`)
- [ ] `JWT_EXPIRES_IN=1d` (default; adjust if needed)
- [ ] `FRONTEND_URL` matches deployed frontend URL exactly (no trailing slash)
- [ ] MongoDB Atlas IP allowlist configured (restrict to Render server IPs)
- [ ] Seed script run; admin password meets complexity requirements
- [ ] HTTPS enabled on both frontend and backend (automatic on Vercel/Render)
- [ ] `robots.txt` reviewed — currently disallows `/admin` and `/admin/`
- [ ] Verify `dist/assets/index-*.js` contains no secrets: `grep -r "JWT\|SECRET\|MONGO" dist/`
- [ ] Run `npm audit` on both `Front-end/` and `Back-end/` after install
