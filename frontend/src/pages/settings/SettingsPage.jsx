import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { get, post, put, del } from '../../services/api';
import { FadeIn } from '../../components/animations';
import Modal from '../../components/common/Modal';
import { User, Shield, Bell, Image, AlertTriangle, Save, Upload, Trash2, Check, Camera } from 'lucide-react';

const TABS = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'security', label: 'Sécurité', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'avatar', label: 'Avatar', icon: Image },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
];

function ProfileTab() {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (user) setForm({ name: user.name || '', email: user.email || '' }); }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const response = await put('/settings/profile', form);
      const updated = response.data.data || response.data;
      setUser((prev) => ({ ...prev, ...updated }));
      showToast('Profil mis à jour avec succès', 'success');
    } catch (err) { showToast(err.response?.data?.error || 'Une erreur est survenue', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
        <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
      </div>
      {user?.created_at && (
        <p className="text-xs text-gray-400">
          Membre depuis le {new Date(user.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      )}
      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary">
          <Save size={16} /> {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
}

function SecurityTab() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ current_password: '', new_password: '', new_password_confirmation: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await put('/settings/password', { currentPassword: form.current_password, newPassword: form.new_password });
      showToast('Mot de passe modifié avec succès', 'success');
      setForm({ current_password: '', new_password: '', new_password_confirmation: '' });
    } catch (err) { showToast(err.response?.data?.error || 'Le mot de passe actuel est incorrect', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
        <input type="password" value={form.current_password} onChange={(e) => setForm({ ...form, current_password: e.target.value })} className="input-field" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
        <input type="password" value={form.new_password} onChange={(e) => setForm({ ...form, new_password: e.target.value })} className="input-field" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
        <input type="password" value={form.new_password_confirmation} onChange={(e) => setForm({ ...form, new_password_confirmation: e.target.value })} className="input-field" required />
      </div>
      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary">
          <Save size={16} /> {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
}

function NotificationsTab() {
  const { showToast } = useToast();
  const [prefs, setPrefs] = useState({ email_notifications: true, journal_reminders: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadPrefs() {
      try {
        const response = await get('/settings');
        const data = response.data.data || response.data;
        if (data.notifications) {
          setPrefs({
            email_notifications: data.notifications.email_notifications !== 'false',
            journal_reminders: data.notifications.journal_reminders === 'true',
          });
        }
      } catch { /* use defaults */ }
    }
    loadPrefs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await put('/settings/notifications', prefs);
      showToast('Préférences enregistrées', 'success');
    } catch (err) { showToast(err.response?.data?.error || 'Une erreur est survenue', 'error'); }
    finally { setSaving(false); }
  };

  const Toggle = ({ label, checked, onChange }) => (
    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer group hover:bg-gray-100 transition-colors">
      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{label}</span>
      <button type="button" onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-rose-500' : 'bg-gray-300'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </label>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Toggle label="Notifications par email" checked={prefs.email_notifications}
        onChange={() => setPrefs({ ...prefs, email_notifications: !prefs.email_notifications })} />
      <Toggle label="Rappels de journal" checked={prefs.journal_reminders}
        onChange={() => setPrefs({ ...prefs, journal_reminders: !prefs.journal_reminders })} />
      <div className="flex items-center gap-3 pt-3">
        <button type="submit" disabled={saving} className="btn-primary">
          <Save size={16} /> {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
}

const AVATARS = Array.from({ length: 10 }, (_, i) => `/avatars/av${i + 1}.svg`);

function AvatarTab() {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const [selected, setSelected] = useState(user?.avatar || AVATARS[0]);
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

  useEffect(() => { if (user?.avatar) setSelected(user.avatar); }, [user]);

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
    <div className="space-y-6">
      <div className="flex items-center gap-6 mb-6">
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
          <h3 className="text-lg font-semibold text-gray-900 font-display">{user?.name || 'Utilisateur'}</h3>
          <p className="text-sm text-gray-500">{user?.email || ''}</p>
        </div>
      </div>

      <div>
        <p className="text-sm text-gray-500 mb-4">Avatars prédéfinis</p>
        {loading ? (
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-3">
            {AVATARS.map((avatar) => (
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

      <div className="border-t border-gray-100 pt-6">
        <p className="text-sm text-gray-500 mb-3">Ou uploadez votre propre image</p>
        <p className="text-xs text-gray-400 mb-3">Formats acceptés : jpg, jpeg, png, webp. Taille max : 2 Mo.</p>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="btn-secondary disabled:opacity-50">
          <Upload size={16} /> {uploading ? 'Envoi en cours...' : 'Uploader une image'}
        </button>
      </div>
    </div>
  );
}

function DangerZone() {
  const { logout } = useAuth();
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.preventDefault(); setDeleting(true);
    try {
      await del('/settings', { data: { password } });
      showToast('Compte supprimé', 'success'); await logout();
    } catch (err) { showToast(err.response?.data?.error || 'Erreur lors de la suppression', 'error'); }
    finally { setDeleting(false); setShowModal(false); setPassword(''); }
  };

  return (
    <>
      <div className="border border-red-200 rounded-2xl p-6 bg-red-50/50">
        <h3 className="text-sm font-semibold text-red-800 mb-1">Supprimer mon compte</h3>
        <p className="text-sm text-red-600/80 mb-4">Cette action est irréversible. Toutes vos données seront définitivement supprimées.</p>
        <button type="button" onClick={() => setShowModal(true)} className="btn-danger">
          <Trash2 size={16} /> Supprimer mon compte
        </button>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Confirmer la suppression">
        <form onSubmit={handleDelete} className="space-y-4">
          <p className="text-sm text-gray-600">Entrez votre mot de passe pour confirmer la suppression de votre compte.</p>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe" className="input-field" required />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={deleting || !password} className="btn-danger disabled:opacity-50">
              <Trash2 size={16} /> {deleting ? 'Suppression...' : 'Supprimer'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  const renderTab = () => {
    switch (activeTab) {
      case 'profile': return <ProfileTab />;
      case 'security': return <SecurityTab />;
      case 'notifications': return <NotificationsTab />;
      case 'avatar': return <AvatarTab />;
      case 'danger': return <DangerZone />;
      default: return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <FadeIn><h1 className="section-title mb-8">Paramètres</h1></FadeIn>
      <div className="flex flex-col md:flex-row gap-6">
        <FadeIn delay={100}>
          <nav className="w-full md:w-52 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-2 space-y-1 shadow-soft">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeTab === id ? 'bg-rose-50 text-rose-600 shadow-soft' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}>
                  <Icon size={18} /> {label}
                </button>
              ))}
            </div>
          </nav>
        </FadeIn>

        <FadeIn delay={200}>
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-soft">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 font-display">
                {TABS.find((t) => t.id === activeTab)?.label}
              </h2>
              {renderTab()}
            </div>
          </main>
        </FadeIn>
      </div>
    </div>
  );
}
