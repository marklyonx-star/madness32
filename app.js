const statusEls = {
  espn: document.getElementById('espn-status'),
  odds: document.getElementById('odds-status'),
  ai: document.getElementById('ai-status')
};

const matchupsEl = document.getElementById('matchups');
const reservationList = document.getElementById('reservation-list');
const regionFilter = document.getElementById('region-filter');
const searchFilter = document.getElementById('search-filter');
const gameSelector = document.getElementById('game-selector');
let scheduleGames = [];

const GAMES = [
  {
    id: 'tcu-ohio-state',
    day: 'THURSDAY · MARCH 19', region: 'South', tv: 'TBS', date: 'THU MAR 19', time: '9:15 AM',
    away: { name: 'TCU Horned Frogs', short: 'TCU', seed: 6, record: '22-11', ats: '14-17', ou: '17-14', lastFiveAts: ['L','W','L','W','L'] },
    home: { name: 'Ohio State Buckeyes', short: 'Ohio State', seed: 11, record: '21-12', ats: '16-14', ou: '15-14', lastFiveAts: ['W','L','W','W','L'] },
    spread: { headline: 'OHIOST -2.5', detail: 'OHIOST -2.5 (-110) / TCU +2.5 (-110)' },
    moneyline: 'OHIOST -145 / TCU +122', total: '142.5 · OVER -110 / UNDER -110',
    injuries: [
      { status: '🟡 QUESTIONABLE', player: 'Emanuel Miller', team: 'TCU', position: 'F', detail: 'Knee', impact: '🟡 MEDIUM', note: '13.2 ppg wing scorer, TCU has depth' },
      { status: '🟡 QUESTIONABLE', player: 'Devin Royal', team: 'Ohio St', position: 'F', detail: 'Illness', impact: '🔴 HIGH', note: '14.8 ppg second leading scorer, significant if out' }
    ],
    splits: [
      { title: 'Spread', leftLabel: 'TCU', left: 44, rightLabel: 'Ohio St', right: 56, note: '' },
      { title: 'Moneyline', leftLabel: 'TCU', left: 38, rightLabel: 'Ohio St', right: 62, note: '⚡ Sharp Action' },
      { title: 'Total', leftLabel: 'Under', left: 48, rightLabel: 'Over', right: 52, note: '' }
    ]
  },
  { id:'troy-nebraska', day:'THURSDAY · MARCH 19', region:'East', tv:'CBS', date:'THU MAR 19', time:'9:40 AM', away:{name:'Troy', short:'Troy', seed:14}, home:{name:'Nebraska', short:'Nebraska', seed:3}, spread:{headline:'NEB -12.5', detail:'NEB -12.5'}, moneyline:'—', total:'144.5', ouValue:'144.5' },
  { id:'sflorida-louisville', day:'THURSDAY · MARCH 19', region:'West', tv:'TBS', date:'THU MAR 19', time:'10:30 AM', away:{name:'S. Florida', short:'S. Florida', seed:12}, home:{name:'Louisville', short:'Louisville', seed:5}, spread:{headline:'LVILLE -4.5', detail:'LVILLE -4.5'}, moneyline:'—', total:'148.5', ouValue:'148.5' },
  { id:'high-point-wisconsin', day:'THURSDAY · MARCH 19', region:'Midwest', tv:'CBS', date:'THU MAR 19', time:'10:50 AM', away:{name:'High Point', short:'High Point', seed:15}, home:{name:'Wisconsin', short:'Wisconsin', seed:2}, spread:{headline:'WISC -9.5', detail:'WISC -9.5'}, moneyline:'—', total:'136.5', ouValue:'136.5' },
  { id:'mcneese-vanderbilt', day:'THURSDAY · MARCH 19', region:'East', tv:'TBS', date:'THU MAR 19', time:'12:15 PM', away:{name:'McNeese', short:'McNeese', seed:13}, home:{name:'Vanderbilt', short:'Vanderbilt', seed:4}, spread:{headline:'VANDY -11.5', detail:'VANDY -11.5'}, moneyline:'—', total:'142.5', ouValue:'142.5' },
  { id:'ndakota-michst', day:'THURSDAY · MARCH 19', region:'West', tv:'CBS', date:'THU MAR 19', time:'1:05 PM', away:{name:'N. Dakota St', short:'N. Dakota St', seed:16}, home:{name:'Michigan St', short:'Michigan St', seed:1}, spread:{headline:'MICHST -16.5', detail:'MICHST -16.5'}, moneyline:'—', total:'138.5', ouValue:'138.5' },
  { id:'hawaii-arkansas', day:'THURSDAY · MARCH 19', region:'Midwest', tv:'TBS', date:'THU MAR 19', time:'1:25 PM', away:{name:'Hawaii', short:'Hawaii', seed:15}, home:{name:'Arkansas', short:'Arkansas', seed:2}, spread:{headline:'ARK -15.5', detail:'ARK -15.5'}, moneyline:'—', total:'152.5', ouValue:'152.5' },
  { id:'vcu-unc', day:'THURSDAY · MARCH 19', region:'East', tv:'CBS', date:'THU MAR 19', time:'3:50 PM', away:{name:'VCU', short:'VCU', seed:11}, home:{name:'UNC', short:'UNC', seed:6}, spread:{headline:'UNC -2.5', detail:'UNC -2.5'}, moneyline:'—', total:'154.5', ouValue:'154.5' },
  { id:'texas-byu', day:'THURSDAY · MARCH 19', region:'South', tv:'TBS', date:'THU MAR 19', time:'4:25 PM', away:{name:'Texas', short:'Texas', seed:11}, home:{name:'BYU', short:'BYU', seed:6}, spread:{headline:'BYU -2.5', detail:'BYU -2.5'}, moneyline:'—', total:'156.5', ouValue:'156.5' },
  { id:'texasam-maryland', day:'THURSDAY · MARCH 19', region:'West', tv:'CBS', date:'THU MAR 19', time:'4:35 PM', away:{name:'Texas A&M', short:'Texas A&M', seed:8}, home:{name:'Maryland', short:'Maryland', seed:9}, spread:{headline:'TEXAM -3.5', detail:'TEXAM -3.5'}, moneyline:'—', total:'148.5', ouValue:'148.5' },
  { id:'penn-illinois', day:'THURSDAY · MARCH 19', region:'Midwest', tv:'TBS', date:'THU MAR 19', time:'6:25 PM', away:{name:'Penn', short:'Penn', seed:16}, home:{name:'Illinois', short:'Illinois', seed:1}, spread:{headline:'ILL -24.5', detail:'ILL -24.5'}, moneyline:'—', total:'138.5', ouValue:'138.5' },
  { id:'stlouis-georgia', day:'THURSDAY · MARCH 19', region:'South', tv:'CBS', date:'THU MAR 19', time:'6:45 PM', away:{name:'St. Louis', short:'St. Louis', seed:9}, home:{name:'Georgia', short:'Georgia', seed:8}, spread:{headline:'UGA -1.5', detail:'UGA -1.5'}, moneyline:'—', total:'163.5', ouValue:'163.5' },
  { id:'kennesaw-gonzaga', day:'THURSDAY · MARCH 19', region:'East', tv:'TBS', date:'THU MAR 19', time:'7:00 PM', away:{name:'Kennesaw St', short:'Kennesaw St', seed:16}, home:{name:'Gonzaga', short:'Gonzaga', seed:1}, spread:{headline:'GONZAG -20.5', detail:'GONZAG -20.5'}, moneyline:'—', total:'158.5', ouValue:'158.5' },
  { id:'idaho-houston', day:'THURSDAY · MARCH 19', region:'Midwest', tv:'CBS', date:'THU MAR 19', time:'7:10 PM', away:{name:'Idaho', short:'Idaho', seed:15}, home:{name:'Houston', short:'Houston', seed:2}, spread:{headline:'HOU -23.5', detail:'HOU -23.5'}, moneyline:'—', total:'159.5', ouValue:'159.5' },
  { id:'santaclara-kentucky', day:'FRIDAY · MARCH 20', region:'West', tv:'CBS', date:'FRI MAR 20', time:'9:15 AM', away:{name:'Santa Clara', short:'Santa Clara', seed:10}, home:{name:'Kentucky', short:'Kentucky', seed:7}, spread:{headline:'UK -3.5', detail:'UK -3.5'}, moneyline:'—', total:'152.5', ouValue:'152.5' },
  { id:'akron-texastech', day:'FRIDAY · MARCH 20', region:'East', tv:'TBS', date:'FRI MAR 20', time:'9:40 AM', away:{name:'Akron', short:'Akron', seed:12}, home:{name:'Texas Tech', short:'Texas Tech', seed:5}, spread:{headline:'TXTECH -8.5', detail:'TXTECH -8.5'}, moneyline:'—', total:'144.5', ouValue:'144.5' },
  { id:'liu-arizona', day:'FRIDAY · MARCH 20', region:'South', tv:'CBS', date:'FRI MAR 20', time:'10:35 AM', away:{name:'LIU', short:'LIU', seed:16}, home:{name:'Arizona', short:'Arizona', seed:1}, spread:{headline:'ARIZ -30.5', detail:'ARIZ -30.5'}, moneyline:'—', total:'152.5', ouValue:'152.5' },
  { id:'wright-virginia', day:'FRIDAY · MARCH 20', region:'West', tv:'TBS', date:'FRI MAR 20', time:'10:50 AM', away:{name:'Wright St', short:'Wright St', seed:15}, home:{name:'Virginia', short:'Virginia', seed:2}, spread:{headline:'UVA -18.5', detail:'UVA -18.5'}, moneyline:'—', total:'136.5', ouValue:'136.5' },
  { id:'tennessee-iowast', day:'FRIDAY · MARCH 20', region:'Midwest', tv:'CBS', date:'FRI MAR 20', time:'11:50 AM', away:{name:'Tennessee St', short:'Tennessee St', seed:16}, home:{name:'Iowa St', short:'Iowa St', seed:1}, spread:{headline:'IOWAST -24.5', detail:'IOWAST -24.5'}, moneyline:'—', total:'138.5', ouValue:'138.5' },
  { id:'hofstra-alabama', day:'FRIDAY · MARCH 20', region:'South', tv:'TBS', date:'FRI MAR 20', time:'12:15 PM', away:{name:'Hofstra', short:'Hofstra', seed:13}, home:{name:'Alabama', short:'Alabama', seed:4}, spread:{headline:'BAMA -11.5', detail:'BAMA -11.5'}, moneyline:'—', total:'154.5', ouValue:'154.5' },
  { id:'utahst-villanova', day:'FRIDAY · MARCH 20', region:'East', tv:'CBS', date:'FRI MAR 20', time:'1:10 PM', away:{name:'Utah St', short:'Utah St', seed:9}, home:{name:'Villanova', short:'Villanova', seed:8}, spread:{headline:'UTAHST +1.5', detail:'UTAHST +1.5'}, moneyline:'—', total:'148.5', ouValue:'148.5' },
  { id:'iowa-clemson', day:'FRIDAY · MARCH 20', region:'West', tv:'TBS', date:'FRI MAR 20', time:'3:50 PM', away:{name:'Iowa', short:'Iowa', seed:10}, home:{name:'Clemson', short:'Clemson', seed:7}, spread:{headline:'IOWA +2.5', detail:'IOWA +2.5'}, moneyline:'—', total:'152.5', ouValue:'152.5' },
  { id:'niowa-stjohns', day:'FRIDAY · MARCH 20', region:'South', tv:'CBS', date:'FRI MAR 20', time:'4:10 PM', away:{name:'N. Iowa', short:'N. Iowa', seed:12}, home:{name:"St. John's", short:"St. John's", seed:5}, spread:{headline:'STJOHN -10.5', detail:'STJOHN -10.5'}, moneyline:'—', total:'154.5', ouValue:'154.5' },
  { id:'ucf-ucla', day:'FRIDAY · MARCH 20', region:'Midwest', tv:'TBS', date:'FRI MAR 20', time:'4:25 PM', away:{name:'UCF', short:'UCF', seed:10}, home:{name:'UCLA', short:'UCLA', seed:7}, spread:{headline:'UCLA -5.5', detail:'UCLA -5.5'}, moneyline:'—', total:'152.5', ouValue:'152.5' },
  { id:'queens-purdue', day:'FRIDAY · MARCH 20', region:'East', tv:'CBS', date:'FRI MAR 20', time:'4:35 PM', away:{name:'Queens', short:'Queens', seed:16}, home:{name:'Purdue', short:'Purdue', seed:1}, spread:{headline:'PURDUE -25.5', detail:'PURDUE -25.5'}, moneyline:'—', total:'163.5', ouValue:'163.5' },
  { id:'calbaptist-kansas', day:'FRIDAY · MARCH 20', region:'South', tv:'TBS', date:'FRI MAR 20', time:'6:45 PM', away:{name:'Cal Baptist', short:'Cal Baptist', seed:14}, home:{name:'Kansas', short:'Kansas', seed:3}, spread:{headline:'KANSAS -14.5', detail:'KANSAS -14.5'}, moneyline:'—', total:'138.5', ouValue:'138.5' },
  { id:'furman-uconn', day:'FRIDAY · MARCH 20', region:'West', tv:'CBS', date:'FRI MAR 20', time:'7:00 PM', away:{name:'Furman', short:'Furman', seed:14}, home:{name:'UConn', short:'UConn', seed:3}, spread:{headline:'UCONN -20.5', detail:'UCONN -20.5'}, moneyline:'—', total:'136.5', ouValue:'136.5' },
  { id:'missouri-miami', day:'FRIDAY · MARCH 20', region:'Midwest', tv:'CBS', date:'FRI MAR 20', time:'7:10 PM', away:{name:'Missouri', short:'Missouri', seed:9}, home:{name:'Miami', short:'Miami', seed:8}, spread:{headline:'MIAMI -1.5', detail:'MIAMI -1.5'}, moneyline:'—', total:'147.5', ouValue:'147.5' }
];

function statusText(key, text) {
  if (statusEls[key]) statusEls[key].textContent = text;
}

function atsDots(values = []) {
  if (!values?.length) return '—';
  return values.map(v => `<span class="ats-dot ${v === 'W' ? 'win' : 'loss'}">${v}</span>`).join('');
}

function verdictForSpread(spread) {
  const match = spread.match(/([+-]?\d+(?:\.\d+)?)/);
  const line = match ? Math.abs(parseFloat(match[1])) : 0;
  if (line <= 2.5) return 'TOSS UP';
  if (line <= 6.5) return 'DOG';
  return 'FAVORITE';
}

function teamPanel(team, game) {
  return `
    <div class="team-panel-block polished-team-panel">
      <div class="team-seed-line"><span class="seed-badge">#${team.seed}</span> ${team.name.toUpperCase()}</div>
      <div>Record: ${team.record || '—'}</div>
      <div>ATS: ${team.ats || '—'}</div>
      <div>O/U: ${team.ou || '—'}</div>
      <div class="small-line">Last 5 ATS: ${team.lastFiveAts ? atsDots(team.lastFiveAts) : '—'}</div>
      ${!team.record ? `<div class="small-line">${game.region} Region · ${game.tv} · ${game.time}</div>` : ''}
    </div>
  `;
}

function splitBar(split) {
  return `
    <div class="split-block">
      <div class="label">${split.title}</div>
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

function genericInfoCard(game) {
  return `
    <div class="meta-card compact-meta-card">
      <div class="label">Game Info</div>
      <div>${game.region} Region · ${game.tv} · ${game.date} · ${game.time}</div>
      <div class="small-line">Spread: ${game.spread.detail}</div>
      <div class="small-line">O/U: ${game.ouValue || game.total}</div>
    </div>
  `;
}

function gameCard(game) {
  const verdict = verdictForSpread(game.spread.headline).toLowerCase().replace(/\s+/g, '-');
  return `
    <article class="matchup-card featured-card" id="${game.id}">
      <div class="matchup-head featured-head">
        <div>
          <div class="matchup-kicker">${game.region.toUpperCase()} REGION · ${game.tv} · ${game.date} · ${game.time}</div>
          <h2><span class="seed-badge">#${game.away.seed}</span> ${game.away.name.toUpperCase()} <span class="versus">vs</span> <span class="seed-badge">#${game.home.seed}</span> ${game.home.name.toUpperCase()}</h2>
        </div>
        <span class="verdict-badge ${verdict}">${verdictForSpread(game.spread.headline)}</span>
      </div>

      <div class="team-grid">
        <div class="team-panel">${teamPanel(game.away, game)}</div>
        <div class="team-panel">${teamPanel(game.home, game)}</div>
      </div>

      <div class="odds-grid featured-odds-grid">
        <div class="odds-box spread-box">
          <div class="label">Spread</div>
          <div class="value big-spread">${game.spread.headline}</div>
          <div class="small-line">${game.spread.detail}</div>
        </div>
        <div class="odds-box">
          <div class="label">Moneyline</div>
          <div class="value">${game.moneyline || '—'}</div>
        </div>
        <div class="odds-box">
          <div class="label">Over / Under</div>
          <div class="value">${game.total}</div>
        </div>
      </div>

      <div class="meta-grid">
        ${game.injuries?.length ? `
          <div class="meta-card">
            <div class="label">Injury Report</div>
            ${game.injuries.map(injuryItem).join('')}
          </div>
        ` : genericInfoCard(game)}
        ${game.splits?.length ? `
          <div class="meta-card">
            <div class="label">Public Splits</div>
            ${game.splits.map(splitBar).join('')}
          </div>
        ` : genericInfoCard(game)}
      </div>

      <div class="analysis-card">
        <div class="label">AI Matchup Summary</div>
        <div class="analysis-copy">${game.id === 'tcu-ohio-state' ? 'Ready for AI analysis.' : 'Template card ready for the next full-data pass.'}</div>
      </div>
    </article>
  `;
}

function renderSelectorOptions() {
  if (!gameSelector) return;
  const days = ['THURSDAY · MARCH 19', 'FRIDAY · MARCH 20'];
  gameSelector.innerHTML = [`<option value="">Jump to a game</option>`].concat(days.flatMap(day => {
    const label = day.replace(' · ', ' ');
    const header = `<option value="" disabled>── ${label} ──</option>`;
    const opts = GAMES.filter(game => game.day === day).map(game => `<option value="${game.id}">${game.away.short} vs ${game.home.short} · ${game.time} · ${game.tv}</option>`);
    return [header, ...opts];
  })).join('');
}

function renderGames() {
  if (!matchupsEl) return;
  const regionValue = regionFilter?.value || 'all';
  const term = (searchFilter?.value || '').trim().toLowerCase();
  const filtered = GAMES.filter(game => {
    const regionMatch = regionValue === 'all' || game.region === regionValue;
    const textMatch = !term || `${game.away.name} ${game.home.name} ${game.region} ${game.tv}`.toLowerCase().includes(term);
    return regionMatch && textMatch;
  });
  const days = ['THURSDAY · MARCH 19', 'FRIDAY · MARCH 20'];
  matchupsEl.innerHTML = days.map(day => {
    const games = filtered.filter(game => game.day === day);
    if (!games.length) return '';
    return `
      <section class="day-group">
        <div class="day-group-header">${day}</div>
        <div class="day-group-grid">${games.map(gameCard).join('')}</div>
      </section>
    `;
  }).join('');
}

function scrollToSelectedGame() {
  const id = gameSelector?.value;
  if (!id) return;
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  el.classList.remove('gold-flash');
  void el.offsetWidth;
  el.classList.add('gold-flash');
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
  statusText('espn', '28-card board restored');
  statusText('odds', 'Selector + jump navigation live');
  statusText('ai', 'TCU card remains the full-data template');
  renderSelectorOptions();
  renderGames();
}

regionFilter?.addEventListener('change', renderGames);
searchFilter?.addEventListener('input', renderGames);
gameSelector?.addEventListener('change', scrollToSelectedGame);

init();
