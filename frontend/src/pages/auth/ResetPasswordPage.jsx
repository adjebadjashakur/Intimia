import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { post } from '../../services/api';
import { FadeIn } from '../../components/animations';
import { Eye, EyeOff, Loader2, CheckCircle, ArrowLeft, Lock } from 'lucide-react';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const errs = {};
    if (password.length < 8) errs.password = ['Le mot de passe doit contenir au moins 8 caractères.'];
    if (password !== confirmPassword) errs.confirmPassword = ['Les mots de passe ne correspondent pas.'];
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) { setErrors(clientErrors); return; }
    setLoading(true);
    try {
      await post('/auth/reset-password', { token, email, password, password_confirmation: confirmPassword });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
      } else {
        setErrors({ general: err.response?.data?.error || 'Une erreur est survenue.' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="card text-center py-8">
            <p className="text-gray-500 mb-4">Lien de réinitialisation invalide.</p>
            <Link to="/forgot-password" className="text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors">
              Demander un nouveau lien
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <FadeIn delay={100}>
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <h1 className="text-3xl font-bold text-gray-900 font-display">Intimia</h1>
            </Link>
          </div>
        </FadeIn>

        <FadeIn delay={200}>
          <div className="card">
            {success ? (
              <div className="text-center py-4">
                <div className="mx-auto mb-4 p-3 bg-emerald-50 rounded-full w-fit">
                  <CheckCircle size={32} className="text-emerald-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2 font-display">Mot de passe réinitialisé</h2>
                <p className="text-gray-500 text-sm">Votre mot de passe a été réinitialisé. Vous allez être redirigé...</p>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="mx-auto mb-4 p-3 bg-rose-50 rounded-full w-fit">
                    <Lock size={24} className="text-rose-500" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1 font-display">Nouveau mot de passe</h2>
                  <p className="text-gray-500 text-sm">Choisissez un nouveau mot de passe pour votre compte</p>
                </div>

                {errors.general && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{errors.general}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      className="input-field" placeholder="vous@exemple.com" required autoComplete="email" />
                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email[0]}</p>}
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                    <div className="relative">
                      <input id="password" type={showPassword ? 'text' : 'password'} value={password}
                        onChange={(e) => setPassword(e.target.value)} className="input-field pr-10"
                        placeholder="Min. 8 caractères" required autoComplete="new-password" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        tabIndex={-1} aria-label={showPassword ? 'Masquer' : 'Afficher'}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password[0]}</p>}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
                    <div className="relative">
                      <input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)} className="input-field pr-10"
                        placeholder="Confirmez votre mot de passe" required autoComplete="new-password" />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        tabIndex={-1} aria-label={showConfirmPassword ? 'Masquer' : 'Afficher'}>
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword[0]}</p>}
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
                    {loading ? (
                      <><Loader2 size={18} className="animate-spin" /> Réinitialisation...</>
                    ) : 'Réinitialiser'}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
                    <ArrowLeft size={16} /> Retour à la connexion
                  </Link>
                </div>
              </>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
