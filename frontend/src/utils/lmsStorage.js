// Petites fonctions de persistance localStorage, scopées par utilisateur,
// pour les fonctionnalités LMS côté client (favoris, historique, notifications
// lues). Pas de backend dédié : chaque compte a ses propres clés.

function userKey(session, name) {
  const uid = session?.id ?? "guest";
  return `fhamia-${name}-${uid}`;
}

function readList(key) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

// ---------------------------------------------------------------- Favoris --

export function getFavorites(session) {
  return readList(userKey(session, "favorites"));
}

export function isFavorite(session, id) {
  return getFavorites(session).some((f) => f.id === id);
}

// item: { id, type, title, subtitle, badge, to, image }
export function toggleFavorite(session, item) {
  const key = userKey(session, "favorites");
  const list = readList(key);
  const exists = list.some((f) => f.id === item.id);
  const next = exists ? list.filter((f) => f.id !== item.id) : [{ ...item, addedAt: Date.now() }, ...list];
  writeList(key, next);
  return !exists;
}

// ------------------------------------------------------------- Historique --

// entry: { icon, title, description, type }
export function logActivity(session, entry) {
  const key = userKey(session, "activity");
  const list = readList(key);
  const next = [{ ...entry, id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, at: Date.now() }, ...list];
  writeList(key, next.slice(0, 200));
  return next;
}

export function getActivity(session) {
  return readList(userKey(session, "activity"));
}

// ---------------------------------------------------------- Notifications --

export function getReadNotificationIds(session) {
  return readList(userKey(session, "notifications-read"));
}

export function markNotificationRead(session, id) {
  const key = userKey(session, "notifications-read");
  const list = readList(key);
  if (!list.includes(id)) writeList(key, [...list, id]);
}

export function markAllNotificationsRead(session, ids) {
  writeList(userKey(session, "notifications-read"), ids);
}
