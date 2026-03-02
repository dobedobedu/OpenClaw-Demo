export async function fetchLeaderboard() {
  const res = await fetch("/visualization/api/leaderboard");
  return res.json();
}

export async function fetchEloHistory(days = 30) {
  const res = await fetch(`/visualization/api/elo-history?days=${days}`);
  return res.json();
}

export async function fetchPredictions() {
  const res = await fetch("/visualization/api/predictions");
  return res.json();
}

export async function fetchEvaluations(date?: string) {
  const url = date
    ? `/visualization/api/evaluations?date=${date}`
    : "/visualization/api/evaluations";
  const res = await fetch(url);
  return res.json();
}

export async function fetchAccuracy() {
  const res = await fetch("/visualization/api/accuracy");
  return res.json();
}

export async function fetchReflections(agent?: string, date?: string) {
  const params = new URLSearchParams();
  if (agent) params.set("agent", agent);
  if (date) params.set("date", date);
  const qs = params.toString();
  const res = await fetch(`/visualization/api/reflections${qs ? `?${qs}` : ""}`);
  return res.json();
}
