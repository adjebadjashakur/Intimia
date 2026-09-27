import { useState, useEffect, useCallback } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useToast } from '../../contexts/ToastContext';
import { get, post, put, del } from '../../services/api';
import { MOODS, FONTS, COLORS } from '../../constants';
import { formatDate, truncate } from '../../utils/helpers';
import { FadeIn } from '../../components/animations';
import Modal from '../../components/common/Modal';
import { Plus, Trash2, Save, FileText, Sparkles } from 'lucide-react';

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'code-block'],
    ['link'],
    ['clean'],
  ],
};

const QUILL_FORMATS = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'color', 'background', 'list', 'bullet', 'blockquote', 'code-block', 'link',
];

function EntrySkeleton() {
  return <div className="p-4 animate-pulse space-y-2"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-3 bg-gray-200 rounded w-1/2" /></div>;
}

function EditorSkeleton() {
  return <div className="space-y-4 animate-pulse p-6"><div className="h-10 bg-gray-200 rounded w-2/3" /><div className="h-10 bg-gray-200 rounded w-1/3" /><div className="h-64 bg-gray-200 rounded" /></div>;
}

export default function JournalWritePage() {
  const { showToast } = useToast();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [mood, setMood] = useState(null);
  const [fontFamily, setFontFamily] = useState(FONTS[0]);
  const [fontSize, setFontSize] = useState('16');
  const [textColor, setTextColor] = useState(COLORS[0]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchEntries = useCallback(async () => {
    try {
      const response = await get('/journal');
      const data = response.data.data || response.data;
      const list = Array.isArray(data) ? data : data.entries || [];
      setEntries(list.sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at)));
    } catch (error) { showToast('Erreur lors du chargement des entrées', 'error'); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  function handleNewEntry() {
    setSelectedId(null); setTitle(''); setContent('');
    setDate(new Date().toISOString().split('T')[0]); setMood(null);
    setFontFamily(FONTS[0]); setFontSize('16'); setTextColor(COLORS[0]);
  }

  function handleSelectEntry(entry) {
    setSelectedId(entry.id); setTitle(entry.title || ''); setContent(entry.content || '');
    setDate(entry.date ? entry.date.split('T')[0] : new Date().toISOString().split('T')[0]);
    setMood(entry.mood || null); setFontFamily(entry.font_family || entry.fontFamily || FONTS[0]);
    setFontSize(String(entry.font_size || entry.fontSize || 16));
    setTextColor(entry.text_color || entry.textColor || COLORS[0]);
  }

  async function handleSave() {
    if (!title.trim()) { showToast('Le titre est requis', 'error'); return; }
    setSaving(true);
    try {
      const payload = { title: title.trim(), content, date, mood, font_family: fontFamily, font_size: parseInt(fontSize, 10), text_color: textColor };
      if (selectedId) {
        const response = await put(`/journal/${selectedId}`, payload);
        const updated = response.data.data || response.data;
        setEntries((prev) => prev.map((e) => (e.id === selectedId ? { ...e, ...updated } : e)));
        showToast('Entrée mise à jour !', 'success');
      } else {
        const response = await post('/journal', payload);
        const created = response.data.data || response.data;
        setEntries((prev) => [created, ...prev]);
        setSelectedId(created.id);
        showToast('Entrée créée !', 'success');
      }
    } catch (error) { showToast("Erreur lors de l'enregistrement", 'error'); }
    finally { setSaving(false); }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await del(`/journal/${deleteTarget}`);
      setEntries((prev) => prev.filter((e) => e.id !== deleteTarget));
      if (selectedId === deleteTarget) handleNewEntry();
      showToast('Entrée supprimée', 'success');
    } catch (error) { showToast('Erreur lors de la suppression', 'error'); }
    finally { setShowDeleteModal(false); setDeleteTarget(null); }
  }

  const editorStyle = { fontFamily, fontSize: `${fontSize}px`, color: textColor };

  return (
    <div className="max-w-6xl mx-auto">
      <FadeIn>
        <h1 className="section-title mb-6">Écrire dans mon journal</h1>
      </FadeIn>

      <div className="flex flex-col lg:flex-row gap-6 min-w-0">
        <div className="w-full lg:w-64 flex-shrink-0">
          <FadeIn delay={100}>
            <div className="card p-0 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <button onClick={handleNewEntry} className="btn-primary w-full">
                  <Plus className="h-4 w-4" /> Nouvelle entrée
                </button>
              </div>
              <div className="max-h-[600px] overflow-y-auto divide-y divide-gray-50">
                {loading ? <><EntrySkeleton /><EntrySkeleton /><EntrySkeleton /></>
                : entries.length === 0 ? (
                  <div className="p-6 text-center">
                    <FileText className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Aucune entrée</p>
                  </div>
                ) : entries.map((entry) => (
                  <div key={entry.id} onClick={() => handleSelectEntry(entry)}
                    className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                      selectedId === entry.id ? 'bg-rose-50 border-l-4 border-rose-500' : ''
                    }`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {entry.mood && <Sparkles className="h-3 w-3 text-rose-400" />}
                          <p className="font-medium text-gray-900 truncate text-sm">{entry.title || 'Sans titre'}</p>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(entry.date || entry.created_at)}</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(entry.id); setShowDeleteModal(true); }}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>

        <div className="flex-1 min-w-0">
          <FadeIn delay={200}>
            <div className="card">
              {loading ? <EditorSkeleton /> : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                        placeholder="Mon titre..." className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Humeur</label>
                    <div className="flex flex-wrap gap-2">
                      {MOODS.map((m) => (
                        <button key={m.label} onClick={() => setMood(mood === m.label ? null : m.label)}
                          className={`h-9 px-3 rounded-xl flex items-center gap-1.5 text-sm border transition-all duration-200 ${
                            mood === m.label ? 'border-rose-500 bg-rose-50 scale-[1.02]' : 'border-gray-200 bg-gray-50 hover:bg-rose-50'
                          }`} title={m.label}>
                          <m.icon className={`h-3.5 w-3.5 ${m.color}`} />
                          <span className="text-gray-600">{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Police</label>
                      <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="input-field">
                        {FONTS.map((f) => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Taille</label>
                      <select value={fontSize} onChange={(e) => setFontSize(e.target.value)} className="input-field">
                        {[12, 14, 16, 18, 20, 24, 28, 32].map((s) => <option key={s} value={s}>{s}px</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Couleur</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {COLORS.map((c) => (
                          <button key={c} onClick={() => setTextColor(c)}
                            className={`h-7 w-7 rounded-full border-2 transition-all ${
                              textColor === c ? 'border-gray-900 scale-110' : 'border-gray-200 hover:border-gray-400'
                            }`} style={{ backgroundColor: c }} title={c} />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
                    <div className="border border-gray-200 rounded-xl overflow-hidden min-w-0">
                      <ReactQuill theme="snow" value={content} onChange={setContent}
                        modules={QUILL_MODULES} formats={QUILL_FORMATS} placeholder="Écris ici..." style={editorStyle} />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button onClick={handleSave} disabled={saving} className="btn-primary">
                      <Save className="h-4 w-4" /> {saving ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                    {selectedId && (
                      <button onClick={() => { setDeleteTarget(selectedId); setShowDeleteModal(true); }} className="btn-danger">
                        <Trash2 className="h-4 w-4" /> Supprimer
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </FadeIn>
        </div>
      </div>

      <Modal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDeleteTarget(null); }} title="Confirmer la suppression">
        <p className="text-gray-600 mb-6">Es-tu sûre de vouloir supprimer cette entrée ? Cette action est irréversible.</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }} className="btn-secondary">Annuler</button>
          <button onClick={confirmDelete} className="btn-danger">Supprimer</button>
        </div>
      </Modal>
    </div>
  );
}
