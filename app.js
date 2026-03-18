const endpoints = {
  espnScoreboard: 'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard',
  teamsData: './data/teams.json',
  oddsSports: 'https://api.the-odds-api.com/v4/sports',
  anthropic: 'https://api.anthropic.com/v1/messages'
};

const statusEls = {
  espn: document.getElementById('espn-status'),
  odds: document.getElementById('odds-status'),
  ai: document.getElementById('ai-status')
};

const matchupsEl = document.getElementById('matchups');
const template = document.getElementById('matchup-template');
const regionFilter = document.getElementById('region-filter');
const searchFilter = document.getElementById('search-filter');

let teams = [];
let matchupCards = [];

async function loadTeams() {
  const res = await fetch(endpoints.teamsData);
  const data = await res.json();
  teams = data.teams || [];
}

function groupIntoMatchups(items) {
  const filtered = items.filter(team => regionFilter?.value === 'all' || !regionFilter || team.region === regionFilter.value);
  const grouped = [];
  for (let i = 0; i < filtered.length; i += 2) grouped.push(filtered.slice(i, i + 2));
  return grouped.filter(pair => pair.length === 2);
}

function renderTeams(pair) {
  const [away, home] = pair;
  const fragment = template.content.cloneNode(true);
  fragment.querySelector('h2').textContent = `${away.name} vs ${home.name}`;
  fragment.querySelector('.matchup-kicker').textContent = `${away.region} · Seeds ${away.seed} / ${home.seed}`;
  fragment.querySelector('.away-team').innerHTML = `<strong>${away.name}</strong><div>Seed ${away.seed} · ${away.record}</div><div>${away.ranking}</div><div>${away.school_info}</div>`;
  fragment.querySelector('.home-team').innerHTML = `<strong>${home.name}</strong><div>Seed ${home.seed} · ${home.record}</div><div>${home.ranking}</div><div>${home.school_info}</div>`;
  fragment.querySelector('.analysis-button').addEventListener('click', () => {
    const card = fragment.querySelector('.analysis-copy');
    if (card) card.textContent = 'Anthropic hook is wired. Add API proxy/credentials to generate live analysis.';
    if (statusEls.ai) statusEls.ai.textContent = 'Hook wired — credentials needed';
  });
  return fragment;
}

function renderMatchups() {
  if (!matchupsEl) return;
  matchupsEl.innerHTML = '';
  const q = (searchFilter?.value || '').trim().toLowerCase();
  const filtered = teams.filter(team => !q || `${team.name} ${team.region}`.toLowerCase().includes(q));
  matchupCards = groupIntoMatchups(filtered);
  matchupCards.forEach(pair => matchupsEl.appendChild(renderTeams(pair)));
}

async function pingEspn() {
  try {
    const res = await fetch(endpoints.espnScoreboard);
    if (!res.ok) throw new Error('ESPN unavailable');
    if (statusEls.espn) statusEls.espn.textContent = 'Connected';
  } catch {
    if (statusEls.espn) statusEls.espn.textContent = 'Hook wired — data mapping pending';
  }
}

async function pingOdds() {
  if (statusEls.odds) statusEls.odds.textContent = 'Hook wired — API key needed';
}

async function init() {
  await loadTeams();
  await Promise.all([pingEspn(), pingOdds()]);
  if (statusEls.ai) statusEls.ai.textContent = 'Hook wired — API key/proxy needed';
  renderMatchups();
}

regionFilter?.addEventListener('change', renderMatchups);
searchFilter?.addEventListener('input', renderMatchups);
init();
