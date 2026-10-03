export const STORAGE_KEY = 'securevote-demo-state';
export const ADMIN_PASSWORD = 'admin123';

export const INITIAL_STATE = {
  election: {
    title: 'Community Board Election',
    date: '2026-12-15',
    open: true,
  },
  candidates: [
    {
      id: 'c1',
      name: 'Maya Chen',
      description: 'Focused on resilient neighborhoods, greener streets, and digitally connected community services.',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80',
    },
    {
      id: 'c2',
      name: 'Daniel Brooks',
      description: 'Committed to transparent budgets, safer public spaces, and practical civic improvements.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80',
    },
  ],
  voters: [],
  votes: [],
  feedback: [],
};

export function cloneState(value) {
  return JSON.parse(JSON.stringify(value));
}

export function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return cloneState(INITIAL_STATE);
    }
    const parsed = JSON.parse(saved);
    return {
      election: { ...INITIAL_STATE.election, ...(parsed.election || {}) },
      candidates: Array.isArray(parsed.candidates) && parsed.candidates.length
        ? parsed.candidates.filter((candidate) => candidate.id !== 'c3')
        : cloneState(INITIAL_STATE.candidates),
      voters: Array.isArray(parsed.voters) ? parsed.voters : [],
      votes: Array.isArray(parsed.votes) ? parsed.votes : [],
      feedback: Array.isArray(parsed.feedback) ? parsed.feedback : [],
    };
  } catch (error) {
    console.warn('State could not be restored. Falling back to defaults.', error);
    return cloneState(INITIAL_STATE);
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function formatDate(dateString) {
  if (!dateString) {
    return 'No deadline set';
  }
  const date = new Date(`${dateString}T12:00:00`);
  if (Number.isNaN(date.getTime())) {
    return 'No deadline set';
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));
}
