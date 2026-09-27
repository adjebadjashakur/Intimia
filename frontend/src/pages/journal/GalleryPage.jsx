import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { get, post, put, del } from '../../services/api';
import { FadeIn } from '../../components/animations';
import Modal from '../../components/common/Modal';
import {
  Upload,
  Trash2,
  X,
  Image as ImageIcon,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react';

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />
      ))}
    </div>
  );
}

function UploadModal({ isOpen, onClose, onUpload }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) { setFile(null); setPreview(null); setCaption(''); setProgress(0); }
  }, [isOpen]);

  function handleFileChange(e) {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selected);
    }
  }

  function handleDrop(e) {
    e.preventDefault(); setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(droppedFile);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return;
    setUploading(true); setProgress(0);
    const formData = new FormData();
    formData.append('photo', file);
    if (caption.trim()) formData.append('caption', caption.trim());
    try { await onUpload(formData, (percent) => setProgress(percent)); onClose(); }
    catch (error) { /* handled by parent */ }
    finally { setUploading(false); }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 font-display">Ajouter une photo</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              dragOver ? 'border-rose-400 bg-rose-50' : 'border-gray-300 hover:border-rose-300 hover:bg-rose-50/50'
            }`}>
            {preview ? (
              <img src={preview} alt="Aperçu" className="max-h-48 mx-auto rounded-xl" />
            ) : (
              <>
                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">Glisse une photo ici</p>
                <p className="text-sm text-gray-400 mt-1">ou clique pour sélectionner</p>
              </>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Légende</label>
            <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)}
              placeholder="Décris ta photo..." className="input-field" />
          </div>
          {uploading && (
            <div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="h-2 bg-rose-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">{progress}%</p>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={!file || uploading} className="btn-primary disabled:opacity-50">
              <Upload className="h-4 w-4" /> {uploading ? 'Envoi...' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Lightbox({ photo, onClose, onPrev, onNext, hasPrev, hasNext }) {
  if (!photo) return null;
  const imageUrl = photo.url || photo.photo_url || photo.image || '';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 p-2 text-white/80 hover:text-white z-10" aria-label="Fermer">
        <X className="h-6 w-6" />
      </button>
      {hasPrev && (
        <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-4 p-2 text-white/80 hover:text-white z-10" aria-label="Photo précédente">
          <ChevronLeft className="h-8 w-8" />
        </button>
      )}
      {hasNext && (
        <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-4 p-2 text-white/80 hover:text-white z-10" aria-label="Photo suivante">
          <ChevronRight className="h-8 w-8" />
        </button>
      )}
      <div className="max-w-4xl max-h-[85vh] mx-4" onClick={(e) => e.stopPropagation()}>
        <img src={imageUrl} alt={photo.caption || 'Photo'} className="max-h-[75vh] max-w-full mx-auto rounded-xl object-contain" />
        {photo.caption && <p className="text-white text-center mt-4 text-lg">{photo.caption}</p>}
      </div>
    </div>
  );
}

export default function GalleryPage() {
  const { showToast } = useToast();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [editCaptionPhoto, setEditCaptionPhoto] = useState(null);

  const fetchPhotos = useCallback(async () => {
    try {
      const response = await get('/gallery');
      const data = response.data.data || response.data;
      setPhotos(Array.isArray(data) ? data : data.photos || []);
    } catch (error) { showToast('Erreur lors du chargement de la galerie', 'error'); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { fetchPhotos(); }, [fetchPhotos]);

  async function handleUpload(formData, onProgress) {
    try {
      const response = await post('/gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => { if (e.total && onProgress) onProgress(Math.round((e.loaded * 100) / e.total)); },
      });
      const created = response.data.data || response.data;
      setPhotos((prev) => [created, ...prev]);
      showToast('Photo ajoutée !', 'success');
    } catch (error) { showToast("Erreur lors de l'envoi", 'error'); throw error; }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await del(`/gallery/${deleteTarget}`);
      setPhotos((prev) => prev.filter((p) => p.id !== deleteTarget));
      if (lightboxIndex !== null) setLightboxIndex(null);
      showToast('Photo supprimée', 'success');
    } catch (error) { showToast('Erreur lors de la suppression', 'error'); }
    finally { setShowDeleteModal(false); setDeleteTarget(null); }
  }

  async function handleSaveCaption(newCaption) {
    if (!editCaptionPhoto) return;
    try {
      const response = await put(`/gallery/${editCaptionPhoto.id}`, { caption: newCaption });
      const updated = response.data.data || response.data;
      setPhotos((prev) => prev.map((p) => (p.id === editCaptionPhoto.id ? { ...p, caption: updated.caption || newCaption } : p)));
      showToast('Légende mise à jour', 'success');
    } catch (error) { showToast('Erreur lors de la mise à jour', 'error'); }
    finally { setEditCaptionPhoto(null); }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="section-title">Ma Galerie</h1>
            <p className="section-subtitle">{photos.length} photo{photos.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setShowUploadModal(true)} className="btn-primary">
            <Upload className="h-4 w-4" /> Ajouter une photo
          </button>
        </div>
      </FadeIn>

      {loading ? <SkeletonGrid /> : photos.length === 0 ? (
        <FadeIn delay={100}>
          <div className="card text-center py-16">
            <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">Ta galerie est vide</p>
            <p className="text-gray-400 mt-1">Ajoute ta première photo pour commencer !</p>
            <button onClick={() => setShowUploadModal(true)} className="btn-primary mt-6">
              <Upload className="h-4 w-4" /> Ajouter une photo
            </button>
          </div>
        </FadeIn>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo, index) => {
            const imageUrl = photo.url || photo.photo_url || photo.image || '';
            return (
              <FadeIn key={photo.id} delay={index * 50}>
                <div className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100 cursor-pointer"
                  onClick={() => setLightboxIndex(index)}>
                  <img src={imageUrl} alt={photo.caption || 'Photo'}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-sm truncate">{photo.caption || 'Sans légende'}</p>
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button onClick={(e) => { e.stopPropagation(); setEditCaptionPhoto(photo); }}
                      className="p-1.5 bg-white/90 rounded-lg hover:bg-white text-gray-600 hover:text-rose-600 transition-colors" title="Modifier la légende">
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(photo.id); setShowDeleteModal(true); }}
                      className="p-1.5 bg-white/90 rounded-lg hover:bg-white text-gray-600 hover:text-red-600 transition-colors" title="Supprimer">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      )}

      <UploadModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} onUpload={handleUpload} />

      <Modal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDeleteTarget(null); }} title="Supprimer cette photo ?">
        <p className="text-gray-600 mb-6">Cette action est irréversible. La photo sera définitivement supprimée.</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }} className="btn-secondary">Annuler</button>
          <button onClick={confirmDelete} className="btn-danger">Supprimer</button>
        </div>
      </Modal>

      {editCaptionPhoto && (
        <Modal isOpen={true} onClose={() => setEditCaptionPhoto(null)} title="Modifier la légende">
          <CaptionEditForm photo={editCaptionPhoto} onSave={handleSaveCaption} onCancel={() => setEditCaptionPhoto(null)} />
        </Modal>
      )}

      {lightboxIndex !== null && photos[lightboxIndex] && (
        <Lightbox photo={photos[lightboxIndex]} onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((prev) => (prev > 0 ? prev - 1 : prev))}
          onNext={() => setLightboxIndex((prev) => (prev < photos.length - 1 ? prev + 1 : prev))}
          hasPrev={lightboxIndex > 0} hasNext={lightboxIndex < photos.length - 1} />
      )}
    </div>
  );
}

function CaptionEditForm({ photo, onSave, onCancel }) {
  const [caption, setCaption] = useState(photo?.caption || '');
  return (
    <>
      <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)}
        placeholder="Nouvelle légende..." className="input-field mb-4" autoFocus />
      <div className="flex justify-end gap-3">
        <button onClick={onCancel} className="btn-secondary">Annuler</button>
        <button onClick={() => onSave(caption)} className="btn-primary">
          <Check className="h-4 w-4" /> Enregistrer
        </button>
      </div>
    </>
  );
}
