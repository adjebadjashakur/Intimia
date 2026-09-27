import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { get, put, post } from '../../services/api';
import { FadeIn } from '../../components/animations';
import { Camera, Upload, Check, User } from 'lucide-react';

const PREDEFINED_AVATARS = Array.from({ length: 10 }, (_, i) => `/avatars/av${i + 1}.svg`);

export default function AvatarsPage() {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const [selected, setSelected] = useState(user?.avatar || PREDEFINED_AVATARS[0]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function fetchAvatar() {
      try {
        const response = await get('/avatars');
        const data = response.data.data || response.data;
        const current = data.current || user?.avatar;
        if (current) setSelected(current);
      } catch { /* use default */ }
      finally { setLoading(false); }
    }
    fetchAvatar();
  }, [user]);

  const handleSelect = async (avatarUrl) => {
    setSelected(avatarUrl);
    try { await put('/avatars/select', { avatar: avatarUrl }); setUser((prev) => ({ ...prev, avatar: avatarUrl })); showToast('Avatar mis à jour', 'success'); }
    catch { showToast('Erreur lors de la mise à jour', 'error'); }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const formData = new FormData(); formData.append('avatar', file);
    try {
      const response = await post('/avatars/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const data = response.data.data || response.data;
      const avatarUrl = data.avatar || data.avatar_url;
      setSelected(avatarUrl); setUser((prev) => ({ ...prev, avatar: avatarUrl }));
      showToast('Avatar uploadé avec succès', 'success');
    } catch { showToast("Erreur lors de l'upload", 'error'); }
    finally { setUploading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <FadeIn>
        <div>
          <h1 className="section-title">Mon Avatar</h1>
          <p className="section-subtitle">Personnalisez votre apparence dans l'application</p>
        </div>
      </FadeIn>

      <FadeIn delay={100}>
        <div className="card">
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-rose-200 bg-rose-50 flex items-center justify-center shadow-soft">
                {selected ? (
                  <img src={selected} alt="Avatar actuel" className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                  <User className="h-12 w-12 text-rose-300" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 p-1.5 bg-rose-500 rounded-full text-white shadow-soft">
                <Camera className="h-3.5 w-3.5" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 font-display">{user?.name || 'Utilisateur'}</h2>
              <p className="text-sm text-gray-500">{user?.email || ''}</p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Avatars prédéfinis</h3>
            {loading ? (
              <div className="grid grid-cols-5 gap-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-2xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-3">
                {PREDEFINED_AVATARS.map((avatar) => (
                  <button key={avatar} type="button" onClick={() => handleSelect(avatar)}
                    className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all hover:scale-105 ${
                      selected === avatar ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <img src={avatar} alt={`Avatar ${avatar}`} className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }} />
                    {selected === avatar && (
                      <div className="absolute inset-0 bg-rose-500/20 flex items-center justify-center">
                        <Check className="h-6 w-6 text-rose-600" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 pt-6 mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Ou uploadez votre propre image</h3>
            <p className="text-xs text-gray-400 mb-3">Formats acceptés : jpg, jpeg, png, webp. Taille max : 2 Mo.</p>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="btn-secondary disabled:opacity-50">
              <Upload size={16} /> {uploading ? 'Envoi en cours...' : 'Uploader une image'}
            </button>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
