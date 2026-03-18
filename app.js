const statusEls = {
  espn: document.getElementById('espn-status'),
  odds: document.getElementById('odds-status'),
  ai: document.getElementById('ai-status')
};

const matchupsEl = document.getElementById('matchups');
const regionFilter = document.getElementById('region-filter');
const searchFilter = document.getElementById('search-filter');
const reservationList = document.getElementById('reservation-list');
const defaultSlug = 'NCAAB_20260320_MIZZOU@MIAMI';
let scheduleGames = [];

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
  return `<div><strong>${team.name}:</strong> ${team.injuries.map(i => `${i.player}${i.position ? ` (${i.position})` : ''} — ${i.status}${i.date ? ` · ${i.date}` : ''}`).join(' · ')}</div>`;
}

function renderLogs(team, gameSlug) {
  const rows = (team.logs || []).slice(0, 5).map(log => `
    <tr>
      <td>${log.opponent}</td>
      <td>${log.date || 'TBD'}</td>
      <td>${log.score}</td>
      <td class="${log.wl === 'W' ? 'log-win' : 'log-loss'}">${log.wl}</td>
      <td class="${log.ats === 'WIN' ? 'log-win' : 'log-loss'}">${log.ats}</td>
      <td class="${log.ml === 'WIN' ? 'log-win' : 'log-loss'}">${log.ml}</td>
      <td class="${log.ou === 'WIN' ? 'log-win' : 'log-loss'}">${log.ou}</td>
    </tr>
  `).join('');
  return `
    <details class="game-log-details">
      <summary>Season Stats / Game Log</summary>
      <div class="log-tabs">
        <button type="button" class="log-tab active" data-target="${gameSlug}-${team.abbr}">${team.abbr}</button>
      </div>
      <div class="log-table-wrap" id="${gameSlug}-${team.abbr}">
        <table class="log-table">
          <thead><tr><th>Opponent</th><th>Date</th><th>Score</th><th>W/L</th><th>ATS</th><th>ML</th><th>O/U</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </details>
  `;
}

function renderAnalysis(data) {
  if (!data) return '';
  const gradeClass = data.grade === 'A' ? 'grade-a' : data.grade === 'B' ? 'grade-b' : 'grade-c';
  return `
    <div class="analysis-results">
      <div class="analysis-header-row">
        <span class="grade-badge ${gradeClass}">${data.grade}</span>
        <span class="analysis-timestamp">Analysis generated ${new Date(data.generatedAt || Date.now()).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
      </div>
      <div><strong>Narrative:</strong> ${data.narrative}</div>
      <div><strong>Angle:</strong> ${data.angle}</div>
      <div><strong>Sharp Take:</strong> ${data.sharpTake}</div>
    </div>
  `;
}

function renderGameCard(data) {
  if (!matchupsEl) return;
  const away = data.matchup.away;
  const home = data.matchup.home;
  const splits = data.bettingSplits || {};
  matchupsEl.innerHTML = `
    <article class="matchup-card">
      <div class="matchup-head">
        <div>
          <div class="matchup-kicker">SportsLine parsed card · ${data.gameSlug}</div>
          <h2>${away.name} vs ${home.name}</h2>
        </div>
        <button id="analysis-refresh" class="analysis-button" type="button">Get AI Analysis</button>
      </div>
      <div class="team-grid">
        <div class="team-panel">${teamPanel(away)}</div>
        <div class="team-panel">${teamPanel(home)}</div>
      </div>
      <div class="odds-grid">
        <div class="odds-box"><div class="label">Spread</div><div class="value">${data.odds.spread}</div><div class="small-line">Open ${data.odds.spreadOpen || 'TBD'}</div></div>
        <div class="odds-box"><div class="label">Moneyline</div><div class="value">${data.odds.moneyline}</div><div class="small-line">Open ${data.odds.moneylineOpen || 'TBD'}</div></div>
        <div class="odds-box"><div class="label">Over / Under</div><div class="value">${data.odds.total}</div><div class="small-line">Open ${data.odds.totalOpen || 'TBD'}</div></div>
      </div>
      <div class="meta-grid">
        <div class="meta-card">
          <div class="label">Injury report</div>
          ${injuryList(away)}
          ${injuryList(home)}
        </div>
        <div class="meta-card">
          <div class="label">Projected / public splits</div>
          <div>Projected score: ${data.projectedScore}</div>
          <div class="small-line">Spread bets: ${JSON.stringify(splits.spread?.outcomes || [])}</div>
          <div class="small-line">ML bets: ${JSON.stringify(splits.moneyLine?.outcomes || [])}</div>
          <div class="small-line">Total bets: ${JSON.stringify(splits.total?.outcomes || [])}</div>
        </div>
      </div>
      ${renderLogs(away, data.gameSlug)}
      ${renderLogs(home, data.gameSlug)}
      <div class="analysis-card">
        <div class="label">AI Matchup Summary</div>
        <div id="analysis-copy">${renderAnalysis(data.analysis)}</div>
      </div>
    </article>
  `;

  document.getElementById('analysis-refresh')?.addEventListener('click', async () => {
    const target = document.getElementById('analysis-copy');
    if (!target) return;
    target.innerHTML = '<p class="analysis-copy">Generating analysis…</p>';
    const payload = {
      team1: away.name,
      team2: home.name,
      record1: away.record,
      record2: home.record,
      ats1: away.ats,
      ats2: home.ats,
      spread: data.odds.spread,
      moneyline: data.odds.moneyline,
      overunder: data.odds.total,
      injuries1: away.injuries.map(i => `${i.player} — ${i.status}`),
      injuries2: home.injuries.map(i => `${i.player} — ${i.status}`),
      last5_team1: away.lastFiveAts.join('/'),
      last5_team2: home.lastFiveAts.join('/')
    };
    const res = await fetch('/.netlify/functions/matchup-summary', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    const summary = await res.json();
    target.innerHTML = renderAnalysis(summary);
  });
}

function fmtDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

function gamesForDate(date) {
  return scheduleGames.filter(g => g.date === date);
}

async function renderReservations() {
  if (!reservationList) return;
  const [tripRes, scheduleRes] = await Promise.all([fetch('./data/trip.json'), fetch('/.netlify/functions/scrape-schedule')]);
  const trip = await tripRes.json();
  const schedule = await scheduleRes.json().catch(() => ({ games: [] }));
  scheduleGames = schedule.games || [];
  reservationList.innerHTML = trip.reservations.map(item => {
    const games = gamesForDate(item.date);
    const reservationBadge = item.conf
      ? `<div class="confirmation-pill">Confirmation # <span>${item.conf}</span></div>`
      : `<div class="confirmation-pill owner-pill">Reservation Owner <span>${item.owner}</span></div>`;
    const badges = [
      `<span class="info-badge">${item.time}</span>`,
      `<span class="info-badge">${item.party || `${item.guests} Guests`}</span>`
    ];
    if (item.minimum) badges.push(`<span class="info-badge">$${item.minimum.toLocaleString()} Minimum</span>`);
    if (item.note) badges.push(`<span class="info-badge">${item.note}</span>`);
    return `
      <article class="ticket-card ${item.theme}">
        <div class="ticket-date">${fmtDate(item.date)}</div>
        <h2>${item.venue}</h2>
        ${reservationBadge}
        <div class="badge-row">${badges.join('')}</div>
        <p class="reservation-bio">${item.bio}</p>
        ${item.awards?.length ? `<div class="award-badges">${item.awards.map(a => `<span class="award-badge">${a}</span>`).join('')}</div>` : ''}
        <div class="games-today-block">
          <strong>🏀 Games During This Session</strong>
          <div>${fmtDate(item.date)} · ${games.length} games on the board</div>
          <div class="small-line">${games.slice(0, 6).map(g => g.gameSlug.split('_')[2]).join(' · ') || 'Schedule syncing…'}</div>
        </div>
        <div class="must-order-block">
          <div class="label">Must Order</div>
          <ul>${(item.must_order || []).map(dish => `<li>🍽️ ${dish}</li>`).join('')}</ul>
        </div>
        <div class="ticket-contact">
          <div><strong>Phone</strong><br /><a href="tel:${item.phone.replace(/[^\d]/g, '')}">${item.phone}</a></div>
          <div><strong>Address</strong><br /><a target="_blank" href="${item.maps_url}">${item.address}</a></div>
          <div><strong>Links</strong><br /><a target="_blank" href="${item.website}">Website</a>${item.instagram ? ` · <a target="_blank" href="${item.instagram}">Instagram</a>` : ''} · <a target="_blank" href="${item.maps_url}">Google Maps</a></div>
          <div><strong>Booked By</strong><br />${item.owner || 'Venue confirmation on file'}</div>
        </div>
        ${item.dress_code ? `<div class="parking-note">Dress code: ${item.dress_code}</div>` : ''}
        <div class="parking-note">${item.parking || 'Valet available'}</div>
        <div class="grace-note">15-min grace period · Cancel within 24 hours</div>
      </article>
    `;
  }).join('');
}

async function loadSchedule() {
  try {
    const res = await fetch('/.netlify/functions/scrape-schedule');
    const data = await res.json();
    scheduleGames = data.games || [];
    statusText('espn', `SportsLine schedule ready · ${data.count || 0} games`);
    return data.games || [];
  } catch {
    statusText('espn', 'Schedule scrape failed');
    return [];
  }
}

async function loadGame(gameSlug = defaultSlug, refresh = false) {
  if (!matchupsEl) return;
  const url = `/.netlify/functions/scrape-game?gameSlug=${encodeURIComponent(gameSlug)}${refresh ? '&refresh=1' : ''}`;
  const res = await fetch(url);
  const data = await res.json();
  renderGameCard(data);
}

async function init() {
  if (reservationList) {
    await renderReservations();
    return;
  }
  statusText('odds', 'SportsLine market lines active');
  statusText('ai', 'Live function connected');
  await loadSchedule();
  await loadGame(defaultSlug);
}

regionFilter?.addEventListener('change', () => {});
searchFilter?.addEventListener('input', () => {});
init();
