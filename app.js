const statusEls = {
  espn: document.getElementById('espn-status'),
  odds: document.getElementById('odds-status'),
  ai: document.getElementById('ai-status')
};

const matchupsEl = document.getElementById('matchups');
const regionFilter = document.getElementById('region-filter');
const searchFilter = document.getElementById('search-filter');
const defaultSlug = 'NCAAB_20260320_MIZZOU@MIAMI';

function statusText(key, text) {
  if (statusEls[key]) statusEls[key].textContent = text;
}

function atsDots(values = []) {
  return values.map(v => `<span class="ats-dot ${v === 'W' ? 'win' : 'loss'}">${v}</span>`).join('');
}

function teamPanel(team) {
  return `
    <div class="team-panel-block">
      <strong>${team.name}</strong>
      <div>Record ${team.record} · ATS ${team.ats} · O/U ${team.ou}</div>
      <div>${team.schoolInfo || 'School info pending'}</div>
      <div class="small-line">Last 5 ATS: ${atsDots(team.lastFiveAts)}</div>
    </div>
  `;
}

function injuryList(team) {
  if (!team.injuries?.length) return `<div><strong>${team.name}:</strong> No listed injuries</div>`;
  return `<div><strong>${team.name}:</strong> ${team.injuries.map(i => `${i.player} (${i.status.toLowerCase()})`).join(' · ')}</div>`;
}

function renderGameCard(data) {
  const away = data.matchup.away;
  const home = data.matchup.home;
  matchupsEl.innerHTML = `
    <article class="matchup-card">
      <div class="matchup-head">
        <div>
          <div class="matchup-kicker">Proof of concept · SportsLine seeded card</div>
          <h2>${away.name} vs ${home.name}</h2>
        </div>
        <button id="analysis-refresh" class="analysis-button" type="button">Refresh AI Analysis</button>
      </div>
      <div class="team-grid">
        <div class="team-panel">${teamPanel(away)}</div>
        <div class="team-panel">${teamPanel(home)}</div>
      </div>
      <div class="odds-grid">
        <div class="odds-box"><div class="label">Spread</div><div class="value">${data.odds.spread}</div></div>
        <div class="odds-box"><div class="label">Moneyline</div><div class="value">${data.odds.moneyline}</div></div>
        <div class="odds-box"><div class="label">Over / Under</div><div class="value">${data.odds.total}</div></div>
      </div>
      <div class="meta-grid">
        <div class="meta-card">
          <div class="label">Injury report</div>
          ${injuryList(away)}
          ${injuryList(home)}
        </div>
        <div class="meta-card">
          <div class="label">Last game / trend</div>
          <div>Projected score: ${data.projectedScore}</div>
          <div>${away.name} trend: ${data.analysisPromptSeed}</div>
        </div>
      </div>
      <div class="analysis-card">
        <div class="label">AI Matchup Summary</div>
        <p id="analysis-copy" class="analysis-copy">Claude hook is ready. Once the Anthropic path is finalized, this button will refresh a live matchup summary on demand.</p>
      </div>
    </article>
  `;
  document.getElementById('analysis-refresh')?.addEventListener('click', () => {
    document.getElementById('analysis-copy').textContent = 'Anthropic call path still needs final credential/proxy decision. UI hook is working.';
  });
}

async function loadSchedule() {
  try {
    const res = await fetch('/.netlify/functions/scrape-schedule');
    const data = await res.json();
    statusText('espn', `SportsLine schedule ready · ${data.count || 0} games`);
    return data.games || [];
  } catch {
    statusText('espn', 'Schedule scrape failed');
    return [];
  }
}

async function loadGame(gameSlug = defaultSlug, refresh = false) {
  const url = `/.netlify/functions/scrape-game?gameSlug=${encodeURIComponent(gameSlug)}${refresh ? '&refresh=1' : ''}`;
  const res = await fetch(url);
  const data = await res.json();
  renderGameCard(data);
}

async function init() {
  statusText('odds', 'Stubbed — SportsLine lines active for now');
  statusText('ai', 'Hook ready — Anthropic path pending');
  await loadSchedule();
  await loadGame(defaultSlug);
}

regionFilter?.addEventListener('change', () => {});
searchFilter?.addEventListener('input', () => {});
init();
