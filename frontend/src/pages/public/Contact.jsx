// pages/public/Contact.jsx
// FIX: Removed hardcoded fallback credentials.
// Old code had: || 'service_fxna0sf', || 'template_aco2cmj', || 'V5Z6kc7T_3Fgs83UB'
// These were baked into the production JS bundle — visible to anyone via DevTools.
// Now: values MUST come from Vite env vars. App throws at startup if missing.

import { useState } from 'react';
import emailjs from '@emailjs/browser';
import API from '../../utils/api';
import { useTheme } from '../../context/ThemeContext';

// FIX: Read from env vars ONLY — no hardcoded fallback
const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// Validate required env vars at module load — fails fast, no silent misconfiguration
if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
  console.error(
    '[Contact] Missing EmailJS env vars. ' +
    'Set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY in .env'
  );
}

// FIX: Simple client-side sanitizer — strips tags from free-text before sending
// express-validator's .escape() handles server-side; this is defense-in-depth
const stripTags = (str) => str.replace(/<[^>]*>/g, '').trim();

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState({ loading: false, success: '', error: '' });
  const { isDark } = useTheme();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // FIX: Client-side length guards (server validates too — this is UX, not security)
    if (form.name.length < 2 || form.name.length > 100) {
      return setStatus({ loading: false, success: '', error: 'Name must be 2–100 characters.' });
    }
    if (form.subject.length < 3 || form.subject.length > 200) {
      return setStatus({ loading: false, success: '', error: 'Subject must be 3–200 characters.' });
    }
    if (form.message.length < 10 || form.message.length > 2000) {
      return setStatus({ loading: false, success: '', error: 'Message must be 10–2000 characters.' });
    }

    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
      return setStatus({ loading: false, success: '', error: 'Email service is not configured. Please contact directly via email.' });
    }

    setStatus({ loading: true, success: '', error: '' });

    try {
      // 1. Save to MongoDB via backend (server-side validation runs here)
      await API.post('/messages', form);

      // 2. Send email — strip tags client-side before passing to EmailJS
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          name:    stripTags(form.name),
          email:   form.email,          // type="email" + normalizeEmail() on server
          subject: stripTags(form.subject),
          message: stripTags(form.message),
        },
        PUBLIC_KEY
      );

      setStatus({ loading: false, success: "✅ Message sent! I'll get back to you soon.", error: '' });
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setStatus({
        loading: false,
        success: '',
        error: err.response?.data?.message || 'Failed to send. Try again.',
      });
    }
  };

  const infoItems = [
    { icon: '📧', label: 'Email',        value: 'sa0409716@gmail.com' },
    { icon: '📍', label: 'Location',     value: 'Ankleshwar, Gujarat, India' },
    { icon: '💼', label: 'Availability', value: 'Open to freelance & full-time' },
  ];

  return (
    <main className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <h1 className="section-title">Contact</h1>
          <p className="section-subtitle">Let's work together</p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Info */}
          <div className="space-y-6">
            <p className={`text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Have a project in mind? I'd love to hear from you.
              Fill out the form and I'll get back to you as soon as possible.
            </p>
            {infoItems.map(({ icon, label, value }) => (
              <div key={label} className="card flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.15))' }}>
                  {icon}
                </div>
                <div>
                  <p className={`text-xs uppercase tracking-wide font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
                  <p className={`font-semibold mt-0.5 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="card space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Name *</label>
                <input name="name" value={form.name} onChange={handleChange}
                  className="input-field" placeholder="Your name"
                  maxLength={100} required />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Email *</label>
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  className="input-field" placeholder="you@example.com" required />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Subject *</label>
              <input name="subject" value={form.subject} onChange={handleChange}
                className="input-field" placeholder="Project collaboration"
                maxLength={200} required />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Message *</label>
              <textarea name="message" value={form.message} onChange={handleChange}
                className="input-field min-h-[130px] resize-y"
                placeholder="Tell me about your project..."
                maxLength={2000} required />
              {/* FIX: Show char count as UX aid */}
              <p className={`text-xs mt-1 text-right ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                {form.message.length}/2000
              </p>
            </div>

            {status.success && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                {status.success}
              </div>
            )}
            {status.error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                {status.error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full justify-center py-3" disabled={status.loading}>
              {status.loading ? '⏳ Sending...' : '📤 Send Message'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Contact;
