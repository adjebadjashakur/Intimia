import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FadeIn } from '../../components/animations';
import { Eye, EyeOff, Loader2, Heart } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (password.length < 8) {
      errs.password = ['Le mot de passe doit contenir au moins 8 caractères.'];
    }
    if (password !== confirmPassword) {
      errs.confirmPassword = ['Les mots de passe ne correspondent pas.'];
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
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

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-rose-400 via-rose-500 to-pink-600 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
        </div>
        <div className="relative z-10 text-center px-12">
          <FadeIn delay={200} direction="none">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-8 backdrop-blur-sm">
              <Heart size={16} className="text-white" fill="currentColor" />
              <span className="text-sm font-medium text-white/90">Rejoignez-nous</span>
            </div>
          </FadeIn>
          <FadeIn delay={300} direction="none">
            <h1 className="text-5xl font-bold text-white mb-4 font-display">Intimia</h1>
          </FadeIn>
          <FadeIn delay={400} direction="none">
            <p className="text-xl text-white/80 max-w-sm mx-auto">
              Créez votre espace intime en quelques secondes
            </p>
          </FadeIn>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          <FadeIn delay={100}>
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 font-display">Intimia</h1>
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 font-display">Inscription</h2>
              <p className="text-gray-500 mt-1">Créez votre compte gratuit</p>
            </div>
          </FadeIn>

          <FadeIn delay={300}>
            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="input-field" placeholder="Votre nom" required autoComplete="name" />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name[0]}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="input-field" placeholder="vous@exemple.com" required autoComplete="email" />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email[0]}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
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
                  <><Loader2 size={18} className="animate-spin" /> Inscription...</>
                ) : "S'inscrire"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-rose-500 hover:text-rose-600 font-medium transition-colors">
                Se connecter
              </Link>
            </p>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
