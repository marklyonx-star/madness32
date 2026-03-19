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
  { day: 'THURSDAY · MARCH 19', team1: 'TCU', seed1: 6, team2: 'Ohio State', seed2: 11, time: '9:15 AM', tv: 'TBS', region: 'South', spread: 'OSU -2.5', ou: '142.5' },
  { day: 'THURSDAY · MARCH 19', team1: 'Troy', seed1: 14, team2: 'Nebraska', seed2: 3, time: '9:40 AM', tv: 'CBS', region: 'East', spread: 'NEB -12.5', ou: '144.5' },
  { day: 'THURSDAY · MARCH 19', team1: 'S. Florida', seed1: 12, team2: 'Louisville', seed2: 5, time: '10:30 AM', tv: 'TBS', region: 'West', spread: 'LVILLE -4.5', ou: '148.5' },
  { day: 'THURSDAY · MARCH 19', team1: 'High Point', seed1: 15, team2: 'Wisconsin', seed2: 2, time: '10:50 AM', tv: 'CBS', region: 'Midwest', spread: 'WISC -9.5', ou: '136.5' },
  { day: 'THURSDAY · MARCH 19', team1: 'McNeese', seed1: 13, team2: 'Vanderbilt', seed2: 4, time: '12:15 PM', tv: 'TBS', region: 'East', spread: 'VANDY -11.5', ou: '142.5' },
  { day: 'THURSDAY · MARCH 19', team1: 'N. Dakota St', seed1: 16, team2: 'Michigan St', seed2: 1, time: '1:05 PM', tv: 'CBS', region: 'West', spread: 'MICHST -16.5', ou: '138.5' },
  { day: 'THURSDAY · MARCH 19', team1: 'Hawaii', seed1: 15, team2: 'Arkansas', seed2: 2, time: '1:25 PM', tv: 'TBS', region: 'Midwest', spread: 'ARK -15.5', ou: '152.5' },
  { day: 'THURSDAY · MARCH 19', team1: 'VCU', seed1: 11, team2: 'UNC', seed2: 6, time: '3:50 PM', tv: 'CBS', region: 'East', spread: 'UNC -2.5', ou: '154.5' },
  { day: 'THURSDAY · MARCH 19', team1: 'Texas', seed1: 11, team2: 'BYU', seed2: 6, time: '4:25 PM', tv: 'TBS', region: 'South', spread: 'BYU -2.5', ou: '156.5' },
  { day: 'THURSDAY · MARCH 19', team1: 'Texas A&M', seed1: 8, team2: 'Maryland', seed2: 9, time: '4:35 PM', tv: 'CBS', region: 'West', spread: 'TEXAM -3.5', ou: '148.5' },
  { day: 'THURSDAY · MARCH 19', team1: 'Penn', seed1: 16, team2: 'Illinois', seed2: 1, time: '6:25 PM', tv: 'TBS', region: 'Midwest', spread: 'ILL -24.5', ou: '138.5' },
  { day: 'THURSDAY · MARCH 19', team1: 'St. Louis', seed1: 9, team2: 'Georgia', seed2: 8, time: '6:45 PM', tv: 'CBS', region: 'South', spread: 'UGA -1.5', ou: '163.5' },
  { day: 'THURSDAY · MARCH 19', team1: 'Kennesaw St', seed1: 16, team2: 'Gonzaga', seed2: 1, time: '7:00 PM', tv: 'TBS', region: 'East', spread: 'GONZAG -20.5', ou: '158.5' },
  { day: 'THURSDAY · MARCH 19', team1: 'Idaho', seed1: 15, team2: 'Houston', seed2: 2, time: '7:10 PM', tv: 'CBS', region: 'Midwest', spread: 'HOU -23.5', ou: '159.5' },
  { day: 'FRIDAY · MARCH 20', team1: 'Santa Clara', seed1: 10, team2: 'Kentucky', seed2: 7, time: '9:15 AM', tv: 'CBS', region: 'West', spread: 'UK -3.5', ou: '152.5' },
  { day: 'FRIDAY · MARCH 20', team1: 'Akron', seed1: 12, team2: 'Texas Tech', seed2: 5, time: '9:40 AM', tv: 'TBS', region: 'East', spread: 'TXTECH -8.5', ou: '144.5' },
  { day: 'FRIDAY · MARCH 20', team1: 'LIU', seed1: 16, team2: 'Arizona', seed2: 1, time: '10:35 AM', tv: 'CBS', region: 'South', spread: 'ARIZ -30.5', ou: '152.5' },
  { day: 'FRIDAY · MARCH 20', team1: 'Wright St', seed1: 15, team2: 'Virginia', seed2: 2, time: '10:50 AM', tv: 'TBS', region: 'West', spread: 'UVA -18.5', ou: '136.5' },
  { day: 'FRIDAY · MARCH 20', team1: 'Tennessee St', seed1: 16, team2: 'Iowa St', seed2: 1, time: '11:50 AM', tv: 'CBS', region: 'Midwest', spread: 'IOWAST -24.5', ou: '138.5' },
  { day: 'FRIDAY · MARCH 20', team1: 'Hofstra', seed1: 13, team2: 'Alabama', seed2: 4, time: '12:15 PM', tv: 'TBS', region: 'South', spread: 'BAMA -11.5', ou: '154.5' },
  { day: 'FRIDAY · MARCH 20', team1: 'Utah St', seed1: 9, team2: 'Villanova', seed2: 8, time: '1:10 PM', tv: 'CBS', region: 'East', spread: 'UTAHST +1.5', ou: '148.5' },
  { day: 'FRIDAY · MARCH 20', team1: 'Iowa', seed1: 10, team2: 'Clemson', seed2: 7, time: '3:50 PM', tv: 'TBS', region: 'West', spread: 'IOWA +2.5', ou: '152.5' },
  { day: 'FRIDAY · MARCH 20', team1: 'N. Iowa', seed1: 12, team2: "St. John's", seed2: 5, time: '4:10 PM', tv: 'CBS', region: 'South', spread: 'STJOHN -10.5', ou: '154.5' },
  { day: 'FRIDAY · MARCH 20', team1: 'UCF', seed1: 10, team2: 'UCLA', seed2: 7, time: '4:25 PM', tv: 'TBS', region: 'Midwest', spread: 'UCLA -5.5', ou: '152.5' },
  { day: 'FRIDAY · MARCH 20', team1: 'Queens', seed1: 16, team2: 'Purdue', seed2: 1, time: '4:35 PM', tv: 'CBS', region: 'East', spread: 'PURDUE -25.5', ou: '163.5' },
  { day: 'FRIDAY · MARCH 20', team1: 'Cal Baptist', seed1: 14, team2: 'Kansas', seed2: 3, time: '6:45 PM', tv: 'TBS', region: 'South', spread: 'KANSAS -14.5', ou: '138.5' },
  { day: 'FRIDAY · MARCH 20', team1: 'Furman', seed1: 14, team2: 'UConn', seed2: 3, time: '7:00 PM', tv: 'CBS', region: 'West', spread: 'UCONN -20.5', ou: '136.5' },
  { day: 'FRIDAY · MARCH 20', team1: 'Missouri', seed1: 9, team2: 'Miami', seed2: 8, time: '7:10 PM', tv: 'CBS', region: 'Midwest', spread: 'MIAMI -1.5', ou: '147.5' }
];

function statusText(key, text) {
  if (statusEls[key]) statusEls[key].textContent = text;
}

function verdictForSpread(spread) {
  const match = spread.match(/([+-]?\d+(?:\.\d+)?)/);
  const line = match ? Math.abs(parseFloat(match[1])) : 0;
  if (line <= 2.5) return 'TOSS UP';
  if (line <= 6.5) return 'DOG';
  return 'FAVORITE';
}

function seededCard(game) {
  return `
    <article class="matchup-card enriched-card">
      <div class="matchup-head">
        <div>
          <div class="matchup-kicker">${game.region.toUpperCase()} REGION · ${game.tv} · ${game.time}</div>
          <h2><span class="seed-badge">#${game.seed1}</span> ${game.team1.toUpperCase()} <span class="versus">vs</span> <span class="seed-badge">#${game.seed2}</span> ${game.team2.toUpperCase()}</h2>
        </div>
        <span class="verdict-badge ${verdictForSpread(game.spread).toLowerCase().replace(/\s+/g, '-')}">${verdictForSpread(game.spread)}</span>
      </div>
      <div class="team-grid">
        <div class="team-panel"><div class="team-panel-block"><strong>${game.team1}</strong><div class="tip-line">Tip: ${game.time}</div></div></div>
        <div class="team-panel"><div class="team-panel-block"><strong>${game.team2}</strong><div class="tip-line">Region: ${game.region}</div></div></div>
      </div>
      <div class="odds-grid enriched-odds-grid">
        <div class="odds-box spread-box"><div class="label">Spread</div><div class="value big-spread">${game.spread}</div></div>
        <div class="odds-box"><div class="label">O/U</div><div class="value">${game.ou}</div></div>
        <div class="odds-box"><div class="label">TV</div><div class="value">${game.tv}</div></div>
      </div>
    </article>
  `;
}

function renderSeededGames() {
  if (!matchupsEl) return;
  const regionValue = regionFilter?.value || 'all';
  const term = (searchFilter?.value || '').trim().toLowerCase();
  const filtered = SEEDED_GAMES.filter(game => {
    const regionMatch = regionValue === 'all' || game.region === regionValue;
    const textMatch = !term || `${game.team1} ${game.team2} ${game.region} ${game.tv}`.toLowerCase().includes(term);
    return regionMatch && textMatch;
  });

  const days = ['THURSDAY · MARCH 19', 'FRIDAY · MARCH 20'];
  matchupsEl.innerHTML = days.map(day => {
    const games = filtered.filter(game => game.day === day);
    if (!games.length) return '';
    return `
      <section class="day-group">
        <div class="day-group-header">${day}</div>
        <div class="day-group-grid">
          ${games.map(seededCard).join('')}
        </div>
      </section>
    `;
  }).join('');
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
  statusText('espn', 'Seeded board locked for tipoff');
  statusText('odds', 'Enriched fallback cards active');
  statusText('ai', 'Held until betting render is stable');
  renderSeededGames();
}

regionFilter?.addEventListener('change', renderSeededGames);
searchFilter?.addEventListener('input', renderSeededGames);
init();
