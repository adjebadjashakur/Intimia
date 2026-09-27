import { Link } from 'react-router-dom';
import { FadeIn, Reveal } from '../components/animations';
import {
  PenTool,
  Sparkles,
  Calendar,
  CheckSquare,
  Image,
  Shield,
  Heart,
  Star,
  ArrowRight,
} from 'lucide-react';

const FEATURES = [
  {
    icon: PenTool,
    title: 'Écrire',
    description: 'Capturez vos pensées quotidiennes avec un éditeur riche et élégant',
    color: 'bg-rose-100 text-rose-600',
  },
  {
    icon: Sparkles,
    title: 'Humeur',
    description: "Suivez votre état d'esprit au fil des jours",
    color: 'bg-amber-100 text-amber-600',
  },
  {
    icon: Calendar,
    title: 'Planning',
    description: 'Organisez votre semaine avec un planner intuitif',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: CheckSquare,
    title: 'Routine',
    description: 'Créez des habitudes saines pour votre matin et votre soir',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: Image,
    title: 'Galerie',
    description: 'Préservez vos souvenirs dans une galerie photos personalisée',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Shield,
    title: 'Confidentialité',
    description: 'Vos données restent privées et sécurisées, toujours',
    color: 'bg-rose-100 text-rose-600',
  },
];

const TESTIMONIALS = [
  {
    name: 'Sarah',
    text: 'Intimia a transformé ma routine matinale. Je me sens plus organisée et sereine.',
    rating: 5,
  },
  {
    name: 'Emma',
    text: 'Enfin un journal personnel qui respecte ma vie privée. Design magnifique !',
    rating: 5,
  },
  {
    name: 'Claire',
    text: "La fonction humeur m'aide à mieux comprendre mes émotions au quotidien.",
    rating: 5,
  },
];

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-rose-100 rounded-full blur-3xl opacity-60 animate-float" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-rose-50 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-pink-50 rounded-full blur-3xl opacity-40" />
        <div className="absolute top-20 left-1/3 w-2 h-2 bg-rose-300 rounded-full opacity-60 animate-pulse-soft" />
        <div className="absolute top-40 right-1/3 w-1.5 h-1.5 bg-rose-200 rounded-full opacity-50 animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-32 left-1/4 w-1 h-1 bg-rose-300 rounded-full opacity-40 animate-pulse-soft" style={{ animationDelay: '2s' }} />
      </div>

      <nav className="relative z-10 max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <FadeIn delay={0} direction="none">
          <span className="text-2xl font-bold text-gray-900 font-display">
            Intimia
          </span>
        </FadeIn>
        <FadeIn delay={100} direction="none">
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="btn-ghost text-sm"
            >
              Se connecter
            </Link>
            <Link
              to="/register"
              className="btn-primary text-sm"
            >
              S'inscrire
            </Link>
          </div>
        </FadeIn>
      </nav>

      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-32 text-center">
        <FadeIn delay={200}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 rounded-full mb-8 border border-rose-100">
            <Heart size={14} className="text-rose-500" fill="currentColor" />
            <span className="text-xs font-medium text-rose-600">Votre espace personnel</span>
          </div>
        </FadeIn>

        <FadeIn delay={300}>
          <h1 className="text-5xl sm:text-7xl font-bold text-gray-900 mb-6 leading-tight font-display">
            Intimia
          </h1>
        </FadeIn>

        <FadeIn delay={400}>
          <p className="text-xl sm:text-2xl text-gray-500 mb-10 max-w-lg mx-auto">
            Votre journal intime personnel — écrivez, réfléchissez, grandissez.
          </p>
        </FadeIn>

        <FadeIn delay={500}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto btn-primary px-8 py-3.5 text-base group"
            >
              Commencer gratuitement
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto btn-secondary px-8 py-3.5 text-base text-center"
            >
              Déjà inscrite ? Se connecter
            </Link>
          </div>
        </FadeIn>
      </section>

      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <Reveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 font-display mb-3">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Des outils pensés pour vous accompagner dans votre quotidien
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, description, color }, index) => (
            <Reveal key={title} delay={index * 80}>
              <div className="group p-6 bg-white rounded-2xl border border-gray-100 hover:border-rose-200 hover:shadow-soft-lg hover:-translate-y-0.5 transition-all duration-300">
                <div className={`mb-4 p-3 rounded-xl w-fit ${color} transition-transform group-hover:scale-110`}>
                  <Icon size={22} strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1 font-display">{title}</h3>
                <p className="text-sm text-gray-500">{description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="relative z-10 bg-gray-50 border-y border-gray-100 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 font-display mb-3">
                Ce qu'en disent nos utilisatrices
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, index) => (
              <Reveal key={t.name} delay={index * 100}>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft hover:shadow-soft-lg transition-all duration-300">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm mb-4 italic">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-sm font-semibold text-white">
                      {t.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{t.name}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-20">
        <Reveal>
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900 font-display mb-4">
              Prête à commencer ?
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Rejoignez des milliers de femmes qui ont fait d'Intimia leur compagnon quotidien.
            </p>
            <Link
              to="/register"
              className="btn-primary px-10 py-3.5 text-base inline-flex items-center gap-2 group shadow-glow hover:shadow-glow-lg"
            >
              Créer mon compte gratuit
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </Reveal>
      </section>

      <footer className="relative z-10 border-t border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-lg font-bold text-gray-900 font-display">
            Intimia
          </span>
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Intimia. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
