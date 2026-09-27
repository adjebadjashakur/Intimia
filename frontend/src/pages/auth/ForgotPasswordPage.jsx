import { useState } from 'react';
import { Link } from 'react-router-dom';
import { post } from '../../services/api';
import { FadeIn } from '../../components/animations';
import { Loader2, Heart, CheckCircle, ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

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
            {submitted ? (
              <div className="text-center py-4">
                <div className="mx-auto mb-4 p-3 bg-emerald-50 rounded-full w-fit">
                  <CheckCircle size={32} className="text-emerald-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2 font-display">Email envoyé</h2>
                <p className="text-gray-500 text-sm mb-6">
                  Si un compte existe avec l'adresse <strong>{email}</strong>, vous recevrez un lien
                  de réinitialisation de mot de passe.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Retour à la connexion
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="mx-auto mb-4 p-3 bg-rose-50 rounded-full w-fit">
                    <Mail size={24} className="text-rose-500" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1 font-display">Mot de passe oublié</h2>
                  <p className="text-gray-500 text-sm">
                    Entrez votre email pour recevoir un lien de réinitialisation
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      className="input-field" placeholder="vous@exemple.com" required autoComplete="email" />
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
                    {loading ? (
                      <><Loader2 size={18} className="animate-spin" /> Envoi...</>
                    ) : 'Envoyer le lien'}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <ArrowLeft size={16} />
                    Retour à la connexion
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
