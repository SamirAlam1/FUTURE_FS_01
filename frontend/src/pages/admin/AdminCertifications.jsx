import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import API from '../../utils/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import Toast from '../../components/shared/Toast';
import { useTheme } from '../../context/ThemeContext';

const CATEGORIES = ['Coursera', 'Cisco NetAcad', 'Internship', 'Workshop', 'Other'];

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
};

const toInputDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toISOString().split('T')[0];
};

// ═══════════════════════════════════════════
// LIST VIEW
// ═══════════════════════════════════════════
export const AdminCertificationsList = () => {
  const [items, setItems]         = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [toast, setToast]         = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState('All');
  const { isDark } = useTheme();

  const fetchItems = () => {
    setLoading(true);
    API.get('/certifications')
      .then(({ data }) => { setItems(data.data); setFiltered(data.data); })
      .catch(() => setToast({ message: 'Failed to load certifications', type: 'error' }))
      .finally(() => setLoading(false));
  };
  useEffect(fetchItems, []);

  useEffect(() => {
    let result = [...items];
    if (category !== 'All') result = result.filter(c => c.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.title.toLowerCase().includes(q) || c.organization.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, category, items]);

  const handleDelete = async () => {
    try {
      await API.delete(`/certifications/${confirmId}`);
      setToast({ message: 'Certification deleted!', type: 'success' });
      fetchItems();
    } catch {
      setToast({ message: 'Failed to delete', type: 'error' });
    } finally { setConfirmId(null); }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Certifications
          </h1>
          <p className={`mt-1 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {items.length} total
          </p>
        </div>
        <Link to="/admin/certifications/new" className="btn-primary">+ Add Certification</Link>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by title or organization..."
          className="input-field sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          {['All', ...CATEGORIES].map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                category === cat
                  ? isDark
                    ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                    : 'bg-violet-100 border-violet-300 text-violet-700'
                  : isDark
                    ? 'border-violet-500/15 text-gray-400 hover:border-violet-500/30 hover:text-violet-300'
                    : 'border-gray-200 text-gray-500 hover:border-violet-300 hover:text-violet-600'
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? <LoadingSpinner size="lg" className="py-20" /> :
       filtered.length === 0 ? (
        <div className={`card text-center py-20 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          <p className="text-4xl mb-4">🏅</p>
          {items.length === 0
            ? <><p>No certifications yet.</p>{' '}<Link to="/admin/certifications/new" className="text-violet-500 hover:underline">Add one!</Link></>
            : <p>No results for current filter.</p>
          }
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(cert => (
            <div key={cert._id} className="card flex items-start gap-4">
              {/* Image thumbnail */}
              {cert.certificateImage ? (
                <img src={cert.certificateImage} alt=""
                  className={`w-14 h-14 rounded-xl object-cover flex-shrink-0 ${isDark ? 'bg-[#0a0a1a]' : 'bg-gray-100'}`}
                  onError={e => e.target.style.display = 'none'} />
              ) : (
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.15))' }}>
                  🏅
                </div>
              )}

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{cert.title}</h3>
                  {cert.featured && <span className="badge text-xs">⭐ Featured</span>}
                </div>
                <p className="gradient-text font-medium text-sm">{cert.organization}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${
                    isDark ? 'bg-violet-500/10 text-violet-400' : 'bg-violet-50 text-violet-600'
                  }`}>{cert.category}</span>
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {formatDate(cert.issueDate)}
                  </span>
                </div>
                {cert.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {cert.skills.slice(0, 4).map(s => <span key={s} className="tag text-[10px]">{s}</span>)}
                    {cert.skills.length > 4 && <span className="tag text-[10px]">+{cert.skills.length - 4}</span>}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-shrink-0">
                <Link to={`/admin/certifications/edit/${cert._id}`} className="btn-secondary text-sm py-1.5 px-3">
                  Edit
                </Link>
                <button onClick={() => setConfirmId(cert._id)} className="btn-danger text-sm py-1.5 px-3">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirmId}
        title="Delete Certification"
        message="Are you sure? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setConfirmId(null)}
      />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

// ═══════════════════════════════════════════
// FORM VIEW (Create + Edit)
// ═══════════════════════════════════════════
const EMPTY_FORM = {
  title: '', organization: '', category: 'Other',
  issueDate: '', expiryDate: '', credentialId: '',
  credentialUrl: '', certificateImage: '', skills: '',
  description: '', featured: false, order: 0,
};

export const AdminCertificationForm = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { isDark } = useTheme();
  const isEdit     = Boolean(id);

  const [form, setForm]       = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [toast, setToast]     = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    API.get(`/certifications/${id}`)
      .then(({ data }) => {
        const c = data.data;
        setForm({
          title:            c.title            || '',
          organization:     c.organization     || '',
          category:         c.category         || 'Other',
          issueDate:        toInputDate(c.issueDate),
          expiryDate:       toInputDate(c.expiryDate),
          credentialId:     c.credentialId     || '',
          credentialUrl:    c.credentialUrl    || '',
          certificateImage: c.certificateImage || '',
          skills:           (c.skills || []).join(', '),
          description:      c.description      || '',
          featured:         c.featured         || false,
          order:            c.order            || 0,
        });
      })
      .catch(() => setToast({ message: 'Failed to load certification', type: 'error' }))
      .finally(() => setFetching(false));
  }, [id, isEdit]);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        expiryDate: form.expiryDate || null,
        order: Number(form.order) || 0,
      };
      if (isEdit) {
        await API.put(`/certifications/${id}`, payload);
        setToast({ message: 'Certification updated!', type: 'success' });
      } else {
        await API.post('/certifications', payload);
        setToast({ message: 'Certification created!', type: 'success' });
      }
      setTimeout(() => navigate('/admin/certifications'), 1000);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to save', type: 'error' });
    } finally { setLoading(false); }
  };

  if (fetching) return <LoadingSpinner size="lg" className="py-20" />;

  const label = `block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`;

  return (
    <div className="animate-fade-in max-w-4xl">
      {/* Back + Title */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/admin/certifications')}
          className={`p-2 rounded-xl border transition-colors ${
            isDark
              ? 'border-violet-500/20 text-gray-400 hover:text-white hover:bg-violet-500/10'
              : 'border-violet-200 text-gray-500 hover:text-gray-900 hover:bg-violet-50'
          }`}>←
        </button>
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {isEdit ? 'Edit Certification' : 'New Certification'}
          </h1>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {isEdit ? 'Update certification details' : 'Add a new certification'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">

        {/* Title + Organization */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)}
              className="input-field" placeholder="e.g. Python for Everybody" required />
          </div>
          <div>
            <label className={label}>Organization *</label>
            <input value={form.organization} onChange={e => set('organization', e.target.value)}
              className="input-field" placeholder="e.g. Coursera / University of Michigan" required />
          </div>
        </div>

        {/* Category + Featured */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>Category *</label>
            <select value={form.category} onChange={e => set('category', e.target.value)} className="input-field">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex items-end pb-1">
            <label className={`flex items-center gap-3 cursor-pointer ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={form.featured}
                  onChange={e => set('featured', e.target.checked)} />
                <div className={`w-10 h-6 rounded-full transition-colors ${form.featured ? 'bg-violet-500' : isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.featured ? 'translate-x-5' : 'translate-x-1'}`} />
              </div>
              <span className="text-sm font-medium">Featured on public page</span>
            </label>
          </div>
        </div>

        {/* Issue Date + Expiry Date */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>Issue Date *</label>
            <input type="date" value={form.issueDate} onChange={e => set('issueDate', e.target.value)}
              className="input-field" required />
          </div>
          <div>
            <label className={label}>Expiry Date <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>(leave blank if no expiry)</span></label>
            <input type="date" value={form.expiryDate} onChange={e => set('expiryDate', e.target.value)}
              className="input-field" />
          </div>
        </div>

        {/* Credential ID + URL */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>Credential ID</label>
            <input value={form.credentialId} onChange={e => set('credentialId', e.target.value)}
              className="input-field" placeholder="e.g. ABC123XYZ" />
          </div>
          <div>
            <label className={label}>Credential URL</label>
            <input type="url" value={form.credentialUrl} onChange={e => set('credentialUrl', e.target.value)}
              className="input-field" placeholder="https://coursera.org/verify/..." />
          </div>
        </div>

        {/* Certificate Image URL */}
        <div>
          <label className={label}>Certificate Image URL</label>
          <input type="url" value={form.certificateImage} onChange={e => set('certificateImage', e.target.value)}
            className="input-field" placeholder="https://..." />
          {form.certificateImage && (
            <div className="mt-2 rounded-xl overflow-hidden w-40 h-24 bg-gray-100">
              <img src={form.certificateImage} alt="Preview"
                className="w-full h-full object-cover"
                onError={e => e.target.parentElement.style.display = 'none'} />
            </div>
          )}
        </div>

        {/* Skills */}
        <div>
          <label className={label}>Skills <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>(comma-separated)</span></label>
          <input value={form.skills} onChange={e => set('skills', e.target.value)}
            className="input-field" placeholder="Python, Data Science, Machine Learning" />
          {form.skills && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {form.skills.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                <span key={s} className="tag text-xs">{s}</span>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className={label}>Description</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            className="input-field min-h-[90px] resize-y"
            placeholder="Brief description of what this certification covers..." />
        </div>

        {/* Order */}
        <div className="w-32">
          <label className={label}>Display Order</label>
          <input type="number" value={form.order} onChange={e => set('order', e.target.value)}
            className="input-field" min="0" placeholder="0" />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '⏳ Saving...' : '💾 Save'}
          </button>
          <button type="button" onClick={() => navigate('/admin/certifications')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
