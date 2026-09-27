import { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import { useToast } from '../../contexts/ToastContext';
import { get, post } from '../../services/api';
import { MOODS } from '../../constants';
import { FadeIn } from '../../components/animations';
import { Sparkles, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';

dayjs.locale('fr');

function MoodCalendar({ moods }) {
  const [currentMonth, setCurrentMonth] = useState(dayjs());

  const daysInMonth = currentMonth.daysInMonth();
  const startDay = currentMonth.startOf('month').day();
  const mondayOffset = startDay === 0 ? -6 : 1 - startDay;

  const days = [];
  for (let i = 0; i < daysInMonth; i++) {
    const date = currentMonth.date(i + 1).format('YYYY-MM-DD');
    const moodEntry = moods.find((m) => m.date === date);
    days.push({ day: i + 1, date, mood: moodEntry ? moodEntry.mood : null, isToday: dayjs().format('YYYY-MM-DD') === date });
  }

  const blanks = Array.from({ length: mondayOffset < 0 ? 7 + mondayOffset : mondayOffset });

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentMonth((prev) => prev.subtract(1, 'month'))} className="btn-secondary p-2">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="font-semibold text-gray-900 capitalize font-display">{currentMonth.format('MMMM YYYY')}</h3>
        <button onClick={() => setCurrentMonth((prev) => prev.add(1, 'month'))} className="btn-secondary p-2">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-400 mb-2">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {blanks.map((_, i) => <div key={`blank-${i}`} />)}
        {days.map(({ day, date, mood, isToday }) => (
          <div key={date}
            className={`aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all ${
              isToday ? 'bg-rose-100 ring-2 ring-rose-400' : mood ? 'bg-gray-50' : 'hover:bg-gray-50'
            }`}>
            <span className={`text-xs ${isToday ? 'font-bold text-rose-700' : 'text-gray-600'}`}>{day}</span>
            {mood && <Sparkles className="h-3 w-3 text-rose-400 mt-0.5" />}
          </div>
        ))}
      </div>
    </div>
  );
}

function MoodStats({ moods }) {
  const moodCounts = {};
  moods.forEach((m) => { moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1; });
  const sorted = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxCount = sorted.length > 0 ? sorted[0][1] : 1;

  return (
    <div className="card">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 font-display">
        <TrendingUp className="h-5 w-5 text-rose-500" />
        Humeurs les plus fréquentes
      </h3>
      {sorted.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Pas encore de données</p>
      ) : (
        <div className="space-y-3">
          {sorted.map(([label, count]) => (
            <div key={label} className="flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-rose-400 w-8 text-center" />
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{label}</span>
                  <span className="text-gray-400">{count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="h-2 rounded-full bg-rose-400 transition-all" style={{ width: `${(count / maxCount) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MoodsPage() {
  const { showToast } = useToast();
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);

  const today = dayjs().format('YYYY-MM-DD');
  const todayMood = moods.find((m) => m.date === today);

  const fetchMoods = useCallback(async () => {
    try {
      const response = await get('/moods');
      const data = response.data.data || response.data;
      setMoods(Array.isArray(data) ? data : data.moods || []);
    } catch (err) {
      showToast('Erreur lors du chargement des humeurs', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchMoods(); }, [fetchMoods]);

  async function handleMoodSelect(mood) {
    setSaving(true);
    try {
      await post('/moods', { mood: mood.label, date: today });
      setSelectedMood(mood);
      setMoods((prev) => {
        const existing = prev.findIndex((m) => m.date === today);
        if (existing !== -1) {
          const updated = [...prev];
          updated[existing] = { ...updated[existing], mood: mood.label };
          return updated;
        }
        return [...prev, { date: today, mood: mood.label }];
      });
      showToast('Humeur enregistrée !', 'success');
    } catch (err) {
      showToast("Erreur lors de l'enregistrement", 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <FadeIn>
        <div>
          <h1 className="section-title">Mes Humeurs</h1>
          <p className="section-subtitle">{dayjs().format('dddd D MMMM YYYY')}</p>
        </div>
      </FadeIn>

      <FadeIn delay={100}>
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="h-6 w-6 text-rose-500" />
            <h2 className="text-lg font-semibold text-gray-900 font-display">
              {todayMood && !selectedMood ? 'Humeur du jour déjà enregistrée' : "Comment te sens-tu aujourd'hui ?"}
            </h2>
          </div>
          {todayMood && !selectedMood ? (
            <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-xl border border-rose-100">
              <Sparkles className="h-5 w-5 text-rose-500" />
              <div>
                <p className="font-medium text-gray-900">{todayMood.mood}</p>
                <p className="text-sm text-gray-500">Enregistré aujourd'hui</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {MOODS.map((mood) => (
                <button key={mood.label} onClick={() => handleMoodSelect(mood)} disabled={saving}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 ${
                    selectedMood?.label === mood.label
                      ? 'border-rose-500 bg-rose-50 text-rose-700'
                      : 'border-gray-200 hover:border-rose-300 hover:bg-rose-50 text-gray-600'
                  }`}>
                  <mood.icon className={`h-4 w-4 ${mood.color}`} />
                  <span className="text-sm font-medium">{mood.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </FadeIn>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/2 mb-4" /><div className="h-48 bg-gray-200 rounded" /></div>
          <div className="card animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/2 mb-4" /><div className="h-32 bg-gray-200 rounded" /></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FadeIn delay={200}><MoodCalendar moods={moods} /></FadeIn>
          <FadeIn delay={300}><MoodStats moods={moods} /></FadeIn>
        </div>
      )}
    </div>
  );
}
