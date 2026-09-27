import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { get, post } from '../../services/api';
import { MOODS } from '../../constants';
import { formatDate, truncate } from '../../utils/helpers';
import { FadeIn, CountUp } from '../../components/animations';
import {
  BookOpen,
  Camera,
  TrendingUp,
  PenLine,
  Calendar,
  Zap,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-gray-200" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-6 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}

function SkeletonEntry() {
  return (
    <div className="flex items-center gap-4 p-4 animate-pulse">
      <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0" />
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-3/4" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todayMood, setTodayMood] = useState(null);
  const [recentEntries, setRecentEntries] = useState([]);
  const [savingMood, setSavingMood] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await get('/dashboard/stats');
        const data = response.data.data || response.data;
        setStats(data.stats || data);
        setTodayMood(data.today_mood || data.todayMood || null);
        setRecentEntries(data.recent_entries || data.recentEntries || []);
      } catch (error) {
        showToast('Erreur lors du chargement des données', 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [showToast]);

  async function handleMoodSelect(mood) {
    setSavingMood(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await post('/moods', { mood: mood.label, date: today });
      setTodayMood(mood);
      showToast('Humeur enregistrée !', 'success');
    } catch (error) {
      showToast("Erreur lors de l'enregistrement de l'humeur", 'error');
    } finally {
      setSavingMood(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <FadeIn delay={0}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-display">
              Bonjour, {user?.name || 'Utilisatrice'}
            </h1>
            <p className="text-gray-500 mt-1">{formatDate(new Date())}</p>
          </div>
        </div>
      </FadeIn>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <FadeIn delay={100}>
            <div className="card-hover">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-rose-100 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-rose-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Entrées</p>
                  <p className="text-2xl font-bold text-gray-900">
                    <CountUp end={stats?.entries_count ?? stats?.entriesCount ?? 0} />
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <div className="card-hover">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Camera className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Photos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    <CountUp end={stats?.photos_count ?? stats?.photosCount ?? 0} />
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={300}>
            <div className="card-hover">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Routine</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(() => {
                      const rp = stats?.routine_progress ?? stats?.routineProgress;
                      if (rp && typeof rp === 'object') {
                        const pct = rp.total > 0 ? Math.round((rp.checked / rp.total) * 100) : 0;
                        return pct;
                      }
                      return rp ?? 0;
                    })()}%
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      )}

      <FadeIn delay={200}>
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 font-display">
            <Sparkles className="h-5 w-5 text-rose-500" />
            Humeur du jour
          </h2>
          {todayMood ? (
            <div className="flex items-center gap-4 p-4 bg-rose-50 rounded-xl border border-rose-100">
              <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-rose-500" />
              </div>
              <div>
                <span className="text-gray-700 font-medium">{todayMood.label || todayMood.name || 'Enregistrée'}</span>
                <p className="text-sm text-gray-500">Humeur du jour enregistrée</p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-500 mb-3">Comment te sens-tu aujourd'hui ?</p>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((mood) => (
                  <button
                    key={mood.label}
                    onClick={() => handleMoodSelect(mood)}
                    disabled={savingMood}
                    className={`h-11 px-4 rounded-xl border font-medium text-sm flex items-center gap-2 transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 ${
                      todayMood?.label === mood.label
                        ? 'border-rose-500 bg-rose-50 text-rose-700'
                        : 'border-gray-200 bg-gray-50 hover:bg-rose-50 hover:border-rose-300 text-gray-600'
                    }`}
                    title={mood.label}
                  >
                    <mood.icon className={`h-4 w-4 ${mood.color}`} />
                    {mood.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { to: '/journal/write', icon: PenLine, label: 'Écrire', sub: 'Dans mon journal', color: 'rose' },
          { to: '/journal/planning', icon: Calendar, label: 'Planning', sub: 'Ma semaine', color: 'purple' },
          { to: '/journal/routine', icon: Zap, label: 'Routine', sub: 'Mon objectif du jour', color: 'green' },
          { to: '/journal/moods', icon: Sparkles, label: 'Humeurs', sub: 'Mon historique', color: 'amber' },
        ].map((item, index) => (
          <FadeIn key={item.to} delay={300 + index * 80}>
            <Link
              to={item.to}
              className="card-hover group flex items-center gap-4"
            >
              <div className={`h-12 w-12 rounded-xl bg-${item.color}-100 flex items-center justify-center group-hover:bg-${item.color}-200 transition-colors`}>
                <item.icon className={`h-6 w-6 text-${item.color}-600`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{item.label}</p>
                <p className="text-sm text-gray-500">{item.sub}</p>
              </div>
              <ArrowRight className={`h-4 w-4 text-gray-400 group-hover:text-${item.color}-500 transition-colors`} />
            </Link>
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={500}>
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 font-display">
            Entrées récentes
          </h2>
          {loading ? (
            <div className="space-y-2">
              <SkeletonEntry />
              <SkeletonEntry />
              <SkeletonEntry />
            </div>
          ) : recentEntries.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Aucune entrée pour le moment.</p>
              <p className="text-sm text-gray-400 mt-1">Commence à écrire ta première entrée !</p>
              <Link
                to="/journal/write"
                className="btn-primary mt-4 text-sm"
              >
                <PenLine className="h-4 w-4" />
                Écrire maintenant
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentEntries.slice(0, 3).map((entry) => (
                <Link
                  key={entry.id}
                  to="/journal/write"
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors -mx-2"
                >
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center flex-shrink-0">
                    <PenLine className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{entry.title || 'Sans titre'}</p>
                    <p className="text-sm text-gray-500 truncate">
                      {truncate(entry.content?.replace(/<[^>]*>/g, ''), 80)}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {formatDate(entry.date || entry.created_at)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </FadeIn>
    </div>
  );
}
