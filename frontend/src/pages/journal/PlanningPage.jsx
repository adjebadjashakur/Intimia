import { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import { useToast } from '../../contexts/ToastContext';
import { get, put } from '../../services/api';
import { FadeIn } from '../../components/animations';
import { ChevronLeft, ChevronRight, Save, Calendar } from 'lucide-react';

dayjs.locale('fr');

const DAY_NAMES = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

function SkeletonWeek() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="card animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
          <div className="h-24 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}

function getWeekStart(date) {
  const d = dayjs(date);
  const dayOfWeek = d.day();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  return d.add(mondayOffset, 'day').startOf('day');
}

function formatWeekRange(weekStart) {
  const weekEnd = weekStart.add(6, 'day');
  if (weekStart.month() === weekEnd.month()) {
    return `${weekStart.date()} - ${weekEnd.date()} ${weekStart.format('MMMM YYYY')}`;
  }
  return `${weekStart.date()} ${weekStart.format('MMM')} - ${weekEnd.date()} ${weekEnd.format('MMM YYYY')}`;
}

export default function PlanningPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStart(dayjs()));
  const [plans, setPlans] = useState({});

  const weekDays = Array.from({ length: 7 }, (_, i) => ({
    name: DAY_NAMES[i],
    date: currentWeekStart.add(i, 'day'),
    dateStr: currentWeekStart.add(i, 'day').format('YYYY-MM-DD'),
  }));

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const startDate = currentWeekStart.format('YYYY-MM-DD');
      const endDate = currentWeekStart.add(6, 'day').format('YYYY-MM-DD');
      const response = await get('/planning', { params: { start_date: startDate, end_date: endDate } });
      const data = response.data.data || response.data;
      const plansList = Array.isArray(data) ? data : data.plans || [];
      const plansMap = {};
      plansList.forEach((plan) => {
        const dateKey = plan.date || plan.planned_date;
        if (dateKey) plansMap[dateKey.split('T')[0]] = plan.content || plan.text || '';
      });
      setPlans(plansMap);
    } catch (error) {
      showToast('Erreur lors du chargement du planning', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentWeekStart, showToast]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  function goToPreviousWeek() { setCurrentWeekStart((prev) => prev.subtract(7, 'day')); }
  function goToNextWeek() { setCurrentWeekStart((prev) => prev.add(7, 'day')); }
  function goToCurrentWeek() { setCurrentWeekStart(getWeekStart(dayjs())); }
  function handleContentChange(dateStr, value) { setPlans((prev) => ({ ...prev, [dateStr]: value })); }

  async function handleSave() {
    setSaving(true);
    try {
      const weekPlans = weekDays.map((day) => ({ date: day.dateStr, content: plans[day.dateStr] || '' }));
      await put('/planning', { plans: weekPlans, start_date: currentWeekStart.format('YYYY-MM-DD') });
      showToast('Planning enregistré !', 'success');
    } catch (error) {
      showToast("Erreur lors de l'enregistrement", 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="section-title">Mon Planning</h1>
            <p className="section-subtitle">{formatWeekRange(currentWeekStart)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={goToPreviousWeek} className="btn-secondary p-2" title="Semaine précédente">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={goToCurrentWeek} className="btn-secondary px-3 py-2 text-sm">Aujourd'hui</button>
            <button onClick={goToNextWeek} className="btn-secondary p-2" title="Semaine suivante">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={100}>
        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            <Save className="h-4 w-4" />
            {saving ? 'Enregistrement...' : 'Enregistrer la semaine'}
          </button>
        </div>
      </FadeIn>

      {loading ? (
        <SkeletonWeek />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
          {weekDays.map((day, index) => {
            const isToday = day.date.isSame(dayjs(), 'day');
            return (
              <FadeIn key={day.dateStr} delay={index * 50}>
                <div className={`card p-0 overflow-hidden ${isToday ? 'ring-2 ring-rose-400 shadow-soft-lg' : 'hover:shadow-soft-lg'} transition-all duration-300`}>
                  <div className={`px-3 py-2 border-b ${isToday ? 'bg-rose-50 border-rose-200' : 'bg-gray-50 border-gray-100'}`}>
                    <p className={`text-sm font-semibold ${isToday ? 'text-rose-700' : 'text-gray-700'}`}>{day.name}</p>
                    <p className={`text-xs ${isToday ? 'text-rose-500' : 'text-gray-400'}`}>{day.date.format('D MMM')}</p>
                  </div>
                  <div className="p-2">
                    <textarea
                      value={plans[day.dateStr] || ''}
                      onChange={(e) => handleContentChange(day.dateStr, e.target.value)}
                      placeholder="Notes..."
                      rows={6}
                      className="w-full resize-none border-0 bg-transparent text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-0 p-1"
                    />
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      )}

      {!loading && (
        <FadeIn delay={400}>
          <div className="text-center text-sm text-gray-400 pt-2">
            <Calendar className="h-4 w-4 inline mr-1" />
            Clique sur "Aujourd'hui" pour revenir à la semaine en cours
          </div>
        </FadeIn>
      )}
    </div>
  );
}
