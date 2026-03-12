import { useState } from 'react';
import emailjs from '@emailjs/browser';
import API from '../../utils/api';
import { useTheme } from '../../context/ThemeContext';

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID  || 'service_fxna0sf';
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_aco2cmj';
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  || 'V5Z6kc7T_3Fgs83UB';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState({ loading: false, success: '', error: '' });
  const { isDark } = useTheme();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: '', error: '' });
    try {
      // 1. Save to MongoDB (admin panel me dikhega)
      await API.post('/messages', form);

      // 2. Send email via EmailJS (Gmail pe jayega)
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          name:    form.name,
          email:   form.email,
          subject: form.subject,
          message: form.message,
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
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.15))' }}
                >
                  {icon}
                </div>
                <div>
                  <p className={`text-xs uppercase tracking-wide font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {label}
                  </p>
                  <p className={`font-semibold mt-0.5 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="card space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Name *
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="xxxxxx@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Subject *
              </label>
              <input
                name="subject"
                value={form.subject}
                onChange={handleChange}
                className="input-field"
                placeholder="Project collaboration"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Message *
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                className="input-field min-h-[130px] resize-y"
                placeholder="Tell me about your project..."
                required
              />
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

            <button
              type="submit"
              className="btn-primary w-full justify-center py-3"
              disabled={status.loading}
            >
              {status.loading ? '⏳ Sending...' : '📤 Send Message'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Contact;
