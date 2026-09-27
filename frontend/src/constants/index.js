import { Heart } from 'lucide-react';

export const MOODS = [
  { icon: Heart, label: 'Heureuse', color: 'text-rose-500' },
  { icon: Heart, label: 'Paisible', color: 'text-blue-400' },
  { icon: Heart, label: 'Amoureuse', color: 'text-pink-500' },
  { icon: Heart, label: 'Fatiguée', color: 'text-gray-400' },
  { icon: Heart, label: 'Triste', color: 'text-blue-500' },
  { icon: Heart, label: 'Frustrée', color: 'text-red-500' },
  { icon: Heart, label: 'Pensive', color: 'text-purple-400' },
  { icon: Heart, label: 'Célébration', color: 'text-amber-500' },
  { icon: Heart, label: 'Motivée', color: 'text-green-500' },
  { icon: Heart, label: 'Sereine', color: 'text-teal-400' },
];

export const FONTS = [
  'Quicksand',
  'Playfair Display',
  'Dancing Script',
  'Caveat',
  'Patrick Hand',
  'Indie Flower',
  'Pacifico',
  'Lobster',
  'Great Vibes',
  'Satisfy',
  'Sacramento',
  'Amatic SC',
  'Architects Daughter',
  'Kalam',
  'Shadows Into Light',
  'Gloria Hallelujah',
];

export const COLORS = [
  '#000000',
  '#E11D48',
  '#7C3AED',
  '#2563EB',
  '#059669',
  '#D97706',
  '#DB2777',
  '#4F46E5',
  '#0891B2',
  '#65A30D',
  '#9333EA',
  '#DC2626',
];

export const PERIODS = {
  matin: 'Matin',
  soir: 'Soir',
};

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
