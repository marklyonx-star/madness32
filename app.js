const statusEls = {
  espn: document.getElementById('espn-status'),
  odds: document.getElementById('odds-status'),
  ai: document.getElementById('ai-status')
};

const matchupsEl = document.getElementById('matchups');
const reservationList = document.getElementById('reservation-list');
let scheduleGames = [];

const FEATURED_GAME = {
  region: 'South',
  tv: 'TBS',
  date: 'THU MAR 19',
  time: '9:15 AM',
  away: {
    name: 'TCU Horned Frogs',
    short: 'TCU',
    seed: 6,
    record: '22-11',
    ats: '14-17',
    ou: '17-14',
    lastFiveAts: ['L', 'W', 'L', 'W', 'L'],
    injury: {
      status: '🟡 QUESTIONABLE',
      player: 'Emanuel Miller',
      team: 'TCU',
      position: 'F',
      detail: 'Knee',
      impact: '🟡 MEDIUM',
      note: '13.2 ppg wing scorer'
    }
  },
  home: {
    name: 'Ohio State Buckeyes',
    short: 'Ohio State',
    seed: 11,
    record: '21-12',
    ats: '16-14',
    ou: '15-14',
    lastFiveAts: ['W', 'L', 'W', 'W', 'L'],
    injury: {
      status: '🟡 QUESTIONABLE',
      player: 'Devin Royal',
      team: 'Ohio St',
      position: 'F',
      detail: 'Illness',
      impact: '🔴 HIGH',
      note: '14.8 ppg, second leading scorer'
    }
  },
  spread: {
    headline: 'OHIOST -2.5',
    away: 'TCU +2.5 (-110)',
    home: 'OHIOST -2.5 (-110)'
  },
  moneyline: {
    away: 'TCU +122',
    home: 'OHIOST -145'
  },
  total: {
    line: '142.5',
    over: 'OVER -110',
    under: 'UNDER -110'
  },
  splits: {
    spread: { leftLabel: 'TCU', left: 44, rightLabel: 'Ohio St', right: 56, note: '' },
    moneyline: { leftLabel: 'TCU', left: 38, rightLabel: 'Ohio St', right: 62, note: '⚡ Sharp Action' },
    total: { leftLabel: 'Under', left: 48, rightLabel: 'Over', right: 52, note: '' }
  }
};

function statusText(key, text) {
  if (statusEls[key]) statusEls[key].textContent = text;
}

function atsDots(values = []) {
  return values.map(v => `<span class="ats-dot ${v === 'W' ? 'win' : 'loss'}">${v}</span>`).join('');
}

function teamPanel(team) {
  return `
    <div class="team-panel-block polished-team-panel">
      <div class="team-seed-line"><span class="seed-badge">#${team.seed}</span> ${team.name.toUpperCase()}</div>
      <div>Record: ${team.record}</div>
      <div>ATS: ${team.ats}</div>
      <div>O/U: ${team.ou}</div>
      <div class="small-line">Last 5 ATS: ${atsDots(team.lastFiveAts)}</div>
    </div>
  `;
}

function splitBar(title, split) {
  return `
    <div class="split-block">
      <div class="label">${title}</div>
      <div class="split-row"><span>${split.left}% ${split.leftLabel}</span><div class="bar"><div class="fill gold" style="width:${split.right}%"></div></div><span>${split.right}% ${split.rightLabel}</span></div>
      ${split.note ? `<div class="small-line">${split.note}</div>` : ''}
    </div>
  `;
}

function injuryItem(injury) {
  return `
    <div class="injury-item">
      <div>${injury.status} · ${injury.player} · ${injury.team} · ${injury.position} · ${injury.detail}</div>
      <div class="small-line">Impact: ${injury.impact} — ${injury.note}</div>
    </div>
  `;
}

function renderFeaturedGame() {
  if (!matchupsEl) return;
  const game = FEATURED_GAME;
  matchupsEl.innerHTML = `
    <article class="matchup-card featured-card">
      <div class="matchup-head featured-head">
        <div>
          <div class="matchup-kicker">${game.region.toUpperCase()} REGION · ${game.tv} · ${game.date} · ${game.time}</div>
          <h2><span class="seed-badge">#${game.away.seed}</span> ${game.away.name.toUpperCase()} <span class="versus">vs</span> <span class="seed-badge">#${game.home.seed}</span> ${game.home.name.toUpperCase()}</h2>
        </div>
        <button id="analysis-refresh" class="analysis-button" type="button">Get AI Analysis</button>
      </div>

      <div class="team-grid">
        <div class="team-panel">${teamPanel(game.away)}</div>
        <div class="team-panel">${teamPanel(game.home)}</div>
      </div>

      <div class="odds-grid featured-odds-grid">
        <div class="odds-box spread-box">
          <div class="label">Spread</div>
          <div class="value big-spread">${game.spread.headline}</div>
          <div class="small-line">${game.spread.home} / ${game.spread.away}</div>
        </div>
        <div class="odds-box">
          <div class="label">Moneyline</div>
          <div class="value">${game.moneyline.home}</div>
          <div class="small-line">${game.moneyline.away}</div>
        </div>
        <div class="odds-box">
          <div class="label">Over / Under</div>
          <div class="value">${game.total.line}</div>
          <div class="small-line">${game.total.over} / ${game.total.under}</div>
        </div>
      </div>

      <div class="meta-grid">
        <div class="meta-card">
          <div class="label">Injury Report</div>
          ${injuryItem(game.away.injury)}
          ${injuryItem(game.home.injury)}
        </div>
        <div class="meta-card">
          <div class="label">Public Splits</div>
          ${splitBar('Spread', game.splits.spread)}
          ${splitBar('Moneyline', game.splits.moneyline)}
          ${splitBar('Total', game.splits.total)}
        </div>
      </div>

      <div class="analysis-card">
        <div class="label">AI Matchup Summary</div>
        <div id="analysis-copy" class="analysis-copy">Ready for AI analysis.</div>
      </div>
    </article>
  `;

  document.getElementById('analysis-refresh')?.addEventListener('click', () => {
    const target = document.getElementById('analysis-copy');
    if (target) target.textContent = 'AI analysis is staged for the next pass.';
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

async function init() {
  if (reservationList) {
    await renderReservations();
    return;
  }
  statusText('espn', 'Single featured matchup live');
  statusText('odds', 'TCU vs Ohio State fully staged');
  statusText('ai', 'Manual approval required for next game');
  renderFeaturedGame();
}

init();
