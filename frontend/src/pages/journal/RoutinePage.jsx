import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { get, post, patch, del } from '../../services/api';
import { FadeIn } from '../../components/animations';
import Modal from '../../components/common/Modal';
import {
  Sun,
  Moon,
  Plus,
  Trash2,
  Check,
  CheckCircle2,
  Circle,
  AlertTriangle,
} from 'lucide-react';

function SkeletonItem() {
  return (
    <div className="flex items-center gap-3 p-3 animate-pulse">
      <div className="h-5 w-5 rounded-full bg-gray-200" />
      <div className="h-4 bg-gray-200 rounded flex-1" />
    </div>
  );
}

function RoutineSection({ title, icon: Icon, color, items, onToggle, onAdd, onDelete, loading }) {
  const [newItem, setNewItem] = useState('');
  const [adding, setAdding] = useState(false);

  const completedCount = items.filter((item) => item.completed || item.is_completed).length;
  const total = items.length;
  const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  async function handleAdd(e) {
    e.preventDefault();
    if (!newItem.trim()) return;
    setAdding(true);
    await onAdd(newItem.trim(), title === 'Matin' ? 'matin' : 'soir');
    setNewItem('');
    setAdding(false);
  }

  return (
    <div className="card flex-1">
      <div className="flex items-center gap-3 mb-4">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 font-display">{title}</h2>
          <p className="text-sm text-gray-500">{completedCount}/{total} terminé{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${percentage === 100 ? 'bg-emerald-500' : 'bg-rose-500'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="space-y-1 mb-4">
        {loading ? (
          <><SkeletonItem /><SkeletonItem /><SkeletonItem /></>
        ) : items.length === 0 ? (
          <div className="text-center py-6">
            <Icon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Aucun élément pour l'instant</p>
          </div>
        ) : (
          items.map((item) => {
            const isCompleted = item.completed || item.is_completed;
            return (
              <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isCompleted ? 'bg-emerald-50' : 'hover:bg-gray-50'}`}>
                <button onClick={() => onToggle(item.id)} className="flex-shrink-0 transition-colors">
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-300 hover:text-rose-400" />
                  )}
                </button>
                <span className={`flex-1 text-sm ${isCompleted ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                  {item.name || item.title || item.text}
                </span>
                <button onClick={() => onDelete(item.id, item.name || item.title || item.text)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)}
          placeholder="Ajouter un élément" className="input-field text-sm" />
        <button type="submit" disabled={adding || !newItem.trim()}
          className="btn-secondary p-2 flex-shrink-0 disabled:opacity-50">
          <Plus className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

export default function RoutinePage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [matinItems, setMatinItems] = useState([]);
  const [soirItems, setSoirItems] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteName, setDeleteName] = useState('');

  const totalItems = matinItems.length + soirItems.length;
  const completedItems =
    matinItems.filter((i) => i.completed || i.is_completed).length +
    soirItems.filter((i) => i.completed || i.is_completed).length;
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const fetchRoutine = useCallback(async () => {
    setLoading(true);
    try {
      const response = await get('/routine');
      const data = response.data.data || response.data;
      const items = Array.isArray(data) ? data : data.items || [];
      setMatinItems(items.filter((i) => i.period === 'matin' || i.type === 'matin'));
      setSoirItems(items.filter((i) => i.period === 'soir' || i.type === 'soir'));
    } catch (error) {
      showToast('Erreur lors du chargement de la routine', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchRoutine(); }, [fetchRoutine]);

  async function handleToggle(id) {
    try {
      const response = await patch(`/routine/${id}/toggle`);
      const updated = response.data.data || response.data;
      const isNowCompleted = updated.completed ?? updated.is_completed;
      const updater = (prev) => prev.map((item) =>
        item.id === id ? { ...item, completed: isNowCompleted, is_completed: isNowCompleted } : item
      );
      setMatinItems(updater);
      setSoirItems(updater);
    } catch (error) {
      showToast('Erreur lors de la mise à jour', 'error');
    }
  }

  async function handleAdd(name, period) {
    try {
      const response = await post('/routine', { name, period });
      const created = response.data.data || response.data;
      if (period === 'matin') setMatinItems((prev) => [...prev, created]);
      else setSoirItems((prev) => [...prev, created]);
      showToast('Élément ajouté !', 'success');
    } catch (error) {
      showToast("Erreur lors de l'ajout", 'error');
    }
  }

  function handleDeleteClick(id, name) { setDeleteTarget(id); setDeleteName(name); setShowDeleteModal(true); }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await del(`/routine/${deleteTarget}`);
      setMatinItems((prev) => prev.filter((i) => i.id !== deleteTarget));
      setSoirItems((prev) => prev.filter((i) => i.id !== deleteTarget));
      showToast('Élément supprimé', 'success');
    } catch (error) {
      showToast('Erreur lors de la suppression', 'error');
    } finally {
      setShowDeleteModal(false); setDeleteTarget(null); setDeleteName('');
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <FadeIn>
        <div>
          <h1 className="section-title">Ma Routine</h1>
          <p className="section-subtitle">Objectif du jour : {completedItems}/{totalItems} ({progress}%)</p>
        </div>
      </FadeIn>

      <FadeIn delay={100}>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div className={`h-3 rounded-full transition-all duration-500 ${progress === 100 ? 'bg-emerald-500' : 'bg-rose-500'}`}
            style={{ width: `${progress}%` }} />
        </div>
      </FadeIn>

      {progress === 100 && totalItems > 0 && (
        <FadeIn delay={200}>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
            <Check className="h-5 w-5 text-emerald-600" />
            <p className="text-emerald-700 font-medium">Terminé ! Bravo, ta routine du jour est complète !</p>
          </div>
        </FadeIn>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        <RoutineSection title="Matin" icon={Sun} color="bg-amber-100 text-amber-600"
          items={matinItems} onToggle={handleToggle} onAdd={handleAdd} onDelete={handleDeleteClick} loading={loading} />
        <RoutineSection title="Soir" icon={Moon} color="bg-indigo-100 text-indigo-600"
          items={soirItems} onToggle={handleToggle} onAdd={handleAdd} onDelete={handleDeleteClick} loading={loading} />
      </div>

      <Modal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDeleteTarget(null); setDeleteName(''); }}
        title="Confirmer la suppression">
        <p className="text-gray-600 mb-6">
          Supprimer l'élément <strong>"{deleteName}"</strong> de ta routine ?
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); setDeleteName(''); }} className="btn-secondary">Annuler</button>
          <button onClick={confirmDelete} className="btn-danger">Supprimer</button>
        </div>
      </Modal>
    </div>
  );
}
