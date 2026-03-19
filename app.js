const statusEls = {
  espn: document.getElementById('espn-status'),
  odds: document.getElementById('odds-status'),
  ai: document.getElementById('ai-status')
};

const matchupsEl = document.getElementById('matchups');
const regionFilter = document.getElementById('region-filter');
const searchFilter = document.getElementById('search-filter');
const reservationList = document.getElementById('reservation-list');
let scheduleGames = [];
const SEEDED_GAMES = [
  { day: 'THURSDAY MARCH 19', team1: 'TCU', team2: 'Ohio State', time: 'Thu 9:15 AM', spread: 'OHIOST -2.5' },
  { day: 'THURSDAY MARCH 19', team1: 'Troy', team2: 'Nebraska', time: 'Thu 9:40 AM', spread: 'NEB -12.5' },
  { day: 'THURSDAY MARCH 19', team1: 'S. Florida', team2: 'Louisville', time: 'Thu 10:30 AM', spread: 'LVILLE -4.5' },
  { day: 'THURSDAY MARCH 19', team1: 'High Point', team2: 'Wisconsin', time: 'Thu 10:50 AM', spread: 'WISC -9.5' },
  { day: 'THURSDAY MARCH 19', team1: 'McNeese', team2: 'Vanderbilt', time: 'Thu 12:15 PM', spread: 'VANDY -11.5' },
  { day: 'THURSDAY MARCH 19', team1: 'N. Dakota St', team2: 'Michigan St', time: 'Thu 1:05 PM', spread: 'MICHST -16.5' },
  { day: 'THURSDAY MARCH 19', team1: 'Hawaii', team2: 'Arkansas', time: 'Thu 1:25 PM', spread: 'ARK -15.5' },
  { day: 'THURSDAY MARCH 19', team1: 'VCU', team2: 'UNC', time: 'Thu 3:50 PM', spread: 'UNC -2.5' },
  { day: 'THURSDAY MARCH 19', team1: 'Texas', team2: 'BYU', time: 'Thu 4:25 PM', spread: 'BYU -2.5' },
  { day: 'THURSDAY MARCH 19', team1: 'Texas A&M', team2: 'Maryland', time: 'Thu 4:35 PM', spread: 'TEXAM -3.5' },
  { day: 'THURSDAY MARCH 19', team1: 'Penn', team2: 'Illinois', time: 'Thu 6:25 PM', spread: 'ILL -24.5' },
  { day: 'THURSDAY MARCH 19', team1: 'St. Louis', team2: 'Georgia', time: 'Thu 6:45 PM', spread: 'UGA -1.5' },
  { day: 'THURSDAY MARCH 19', team1: 'Kennesaw St', team2: 'Gonzaga', time: 'Thu 7:00 PM', spread: 'GONZAG -20.5' },
  { day: 'THURSDAY MARCH 19', team1: 'Idaho', team2: 'Houston', time: 'Thu 7:10 PM', spread: 'HOU -23.5' },
  { day: 'FRIDAY MARCH 20', team1: 'Santa Clara', team2: 'Kentucky', time: 'Fri 9:15 AM', spread: 'UK -3.5' },
  { day: 'FRIDAY MARCH 20', team1: 'Akron', team2: 'Texas Tech', time: 'Fri 9:40 AM', spread: 'TXTECH -8.5' },
  { day: 'FRIDAY MARCH 20', team1: 'LIU', team2: 'Arizona', time: 'Fri 10:35 AM', spread: 'ARIZ -30.5' },
  { day: 'FRIDAY MARCH 20', team1: 'Wright St', team2: 'Virginia', time: 'Fri 10:50 AM', spread: 'UVA -18.5' },
  { day: 'FRIDAY MARCH 20', team1: 'Tennessee St', team2: 'Iowa St', time: 'Fri 11:50 AM', spread: 'IOWAST -24.5' },
  { day: 'FRIDAY MARCH 20', team1: 'Hofstra', team2: 'Alabama', time: 'Fri 12:15 PM', spread: 'BAMA -11.5' },
  { day: 'FRIDAY MARCH 20', team1: 'Utah St', team2: 'Villanova', time: 'Fri 1:10 PM', spread: 'UTAHST +1.5' },
  { day: 'FRIDAY MARCH 20', team1: 'Iowa', team2: 'Clemson', time: 'Fri 3:50 PM', spread: 'IOWA +2.5' },
  { day: 'FRIDAY MARCH 20', team1: 'N. Iowa', team2: "St. John's", time: 'Fri 4:10 PM', spread: 'STJOHN -10.5' },
  { day: 'FRIDAY MARCH 20', team1: 'UCF', team2: 'UCLA', time: 'Fri 4:25 PM', spread: 'UCLA -5.5' },
  { day: 'FRIDAY MARCH 20', team1: 'Queens', team2: 'Purdue', time: 'Fri 4:35 PM', spread: 'PURDUE -25.5' },
  { day: 'FRIDAY MARCH 20', team1: 'Cal Baptist', team2: 'Kansas', time: 'Fri 6:45 PM', spread: 'KANSAS -14.5' },
  { day: 'FRIDAY MARCH 20', team1: 'Furman', team2: 'UConn', time: 'Fri 7:00 PM', spread: 'UCONN -20.5' },
  { day: 'FRIDAY MARCH 20', team1: 'Missouri', team2: 'Miami', time: 'Fri 7:10 PM', spread: 'MIAMI -1.5' }
];

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
      <div class="sharp-take"><strong>Sharp Take:</strong> ${data.sharpTake}</div>
    </div>
  `;
}

function renderSplitBars(title, outcomes = []) {
  if (!outcomes.length) return '';
  const left = outcomes[0];
  const right = outcomes[1];
  const leftPct = left?.betPercentage ?? 0;
  const rightPct = right?.betPercentage ?? 0;
  return `
    <div class="split-block">
      <div class="label">${title}</div>
      <div class="split-row"><span>${left?.outcomeType || 'Left'} ${leftPct}%</span><div class="bar"><div class="fill gold" style="width:${leftPct}%"></div></div><span>${rightPct}% ${right?.outcomeType || 'Right'}</span></div>
      <div class="small-line">${Math.abs(leftPct - rightPct) > 20 ? '⚡ Sharp Action' : 'Market balanced'}</div>
    </div>
  `;
}

function renderExpertPicks(picks = []) {
  if (!picks.length) return '<div class="meta-card"><div class="label">Expert picks</div><div>No published expert picks on this game yet.</div></div>';
  return `<div class="meta-card"><div class="label">Expert picks</div>${picks.map(p => `<div class="expert-pick"><strong>${p.analyst}</strong><div>Pick: ${p.pick}</div><div class="small-line">${p.unit || 'Unit TBD'}${p.recentRecord ? ` · ${p.recentRecord}` : ''}</div><div class="small-line">${p.quote}</div></div>`).join('')}</div>`;
}

function seededCard(game) {
  return `
    <article class="matchup-card">
      <div class="matchup-head">
        <div>
          <div class="matchup-kicker">${game.day}</div>
          <h2>${game.team1} vs ${game.team2}</h2>
        </div>
      </div>
      <div class="team-grid">
        <div class="team-panel"><div class="team-panel-block"><strong>${game.team1}</strong><div>Tip: ${game.time}</div><div>Seeded fallback card</div></div></div>
        <div class="team-panel"><div class="team-panel-block"><strong>${game.team2}</strong><div>Spread: ${game.spread}</div><div>Render-loop confirmed</div></div></div>
      </div>
      <div class="odds-grid">
        <div class="odds-box"><div class="label">Spread</div><div class="value">${game.spread}</div></div>
        <div class="odds-box"><div class="label">Time</div><div class="value">${game.time}</div></div>
        <div class="odds-box"><div class="label">Status</div><div class="value">Seeded fallback</div></div>
      </div>
    </article>
  `;
}

function renderSeededGames() {
  if (!matchupsEl) return;
  matchupsEl.innerHTML = SEEDED_GAMES.map(seededCard).join('');
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
  statusText('odds', 'Seeded fallback cards active');
  statusText('ai', 'Held until betting render is stable');
  renderSeededGames();
}

regionFilter?.addEventListener('change', () => {});
searchFilter?.addEventListener('input', () => {});
init();
