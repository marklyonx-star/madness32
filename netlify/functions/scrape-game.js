const fs = require('fs');
const path = require('path');

function readLocalCache(gameSlug) {
  const filePath = path.join(__dirname, '..', '..', 'data', 'games', `${gameSlug}.json`);
  if (!fs.existsSync(filePath)) return null;
  const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const cachedAt = new Date(json.cachedAt || 0).getTime();
  const ageMs = Date.now() - cachedAt;
  return { json, ageMs };
}
function fmtTeam(team) {
  const ml = team?.lastTeamRecordsByLine?.moneyLine || {};
  const spread = team?.lastTeamRecordsByLine?.spread || {};
  const total = team?.lastTeamRecordsByLine?.total || {};
  return {
    id: team?.id,
    abbr: team?.abbr,
    name: `${team?.location || ''} ${team?.nickName || ''}`.trim(),
    schoolInfo: team?.mediumName || '',
    record: `${ml.win ?? 0}-${ml.loss ?? 0}`,
    ats: `${spread.win ?? 0}-${spread.loss ?? 0}${(spread.draw ?? 0) ? `-${spread.draw}` : ''}`,
    ou: `${total.over ?? 0}-${total.under ?? 0}-${total.draw ?? 0}`,
    lastFiveAts: (team?.logs || []).slice(0,5).map(log => {
      const side = log.awayTeamId === team.id ? 'away' : 'home';
      return log?.spread?.[side]?.outcome === 'WIN' ? 'W' : 'L';
    }),
    injuries: (team?.playersInjuries || []).map(player => ({
      player: `${player.firstName || ''} ${player.lastName || ''}`.trim(),
      position: player.position || '',
      status: player.injuries?.[0]?.injuryType || 'Reported',
      date: player.injuries?.[0]?.lastUpdated || '',
      detail: player.injuries?.[0]?.customInjuryString || player.injuries?.[0]?.injuryType || ''
    })),
    logs: (team?.logs || []).map(log => {
      const side = log.awayTeamId === team.id ? 'away' : 'home';
      return {
        slug: log.abbr,
        date: (log.abbr.match(/NCAAB_(\d{8})_/) || [])[1] || '',
        opponent: (log.abbr.split('_')[2] || '').replace(`${team.abbr}@`, '').replace(`@${team.abbr}`, ''),
        score: 'TBD',
        wl: log?.moneyLine?.[side]?.outcome === 'WIN' ? 'W' : 'L',
        ats: log?.spread?.[side]?.outcome || 'TBD',
        ml: log?.moneyLine?.[side]?.outcome || 'TBD',
        ou: log?.total?.over?.outcome || log?.total?.under?.outcome || 'TBD'
      };
    })
  };
}
function parseSportslineData(html) {
  const match = html.match(/__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
  if (!match) throw new Error('NEXT_DATA not found');
  const json = JSON.parse(match[1]);
  const game = json.props.pageProps.data.gameByAbbr;
  const away = fmtTeam(game.awayTeam);
  const home = fmtTeam(game.homeTeam);
  const odds = game.odds || {};
  const splits = game.bettingSplits || {};
  return {
    gameSlug: game.abbr,
    cachedAt: new Date().toISOString(),
    matchup: { away, home },
    projectedScore: game.projection?.awayScore && game.projection?.homeScore ? `${home.name} ${game.projection.homeScore}, ${away.name} ${game.projection.awayScore}` : 'Projection pending / subscriber-gated',
    odds: {
      spread: `${home.name} ${odds.spread?.home?.value || 'TBD'} (${odds.spread?.home?.outcomeOdds || 'TBD'}) / ${away.name} ${odds.spread?.away?.value || 'TBD'} (${odds.spread?.away?.outcomeOdds || 'TBD'})`,
      spreadOpen: `${odds.spread?.home?.openingValue || 'TBD'} / ${odds.spread?.away?.openingValue || 'TBD'}`,
      moneyline: `${home.name} ${odds.moneyLine?.home?.outcomeOdds || 'TBD'} / ${away.name} ${odds.moneyLine?.away?.outcomeOdds || 'TBD'}`,
      moneylineOpen: `${odds.moneyLine?.home?.openingOutcomeOdds || 'TBD'} / ${odds.moneyLine?.away?.openingOutcomeOdds || 'TBD'}`,
      total: `${odds.total?.over?.value || 'TBD'} · Over ${odds.total?.over?.outcomeOdds || 'TBD'} / Under ${odds.total?.under?.outcomeOdds || 'TBD'}`,
      totalOpen: `${odds.total?.over?.openingValue || 'TBD'}`
    },
    bettingSplits: splits,
    expertPicks: [],
    source: 'sportsline-next-data'
  };
}
exports.handler = async function (event) {
  const gameSlug = event.queryStringParameters?.gameSlug || 'NCAAB_20260320_MIZZOU@MIAMI';
  const forceRefresh = event.queryStringParameters?.refresh === '1';
  const cache = readLocalCache(gameSlug);
  if (cache && !forceRefresh && cache.ageMs < 30 * 60 * 1000) {
    return { statusCode: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=1800' }, body: JSON.stringify({ ...cache.json, cache: 'local-file', ageMs: cache.ageMs }) };
  }
  try {
    const targetUrl = `https://www.sportsline.com/college-basketball/game-forecast/${gameSlug}/`;
    const res = await fetch(targetUrl, { headers: { 'user-agent': 'Mozilla/5.0' } });
    const html = await res.text();
    const parsed = parseSportslineData(html);
    return { statusCode: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=1800' }, body: JSON.stringify(parsed) };
  } catch (error) {
    if (cache?.json) return { statusCode: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...cache.json, cache: 'fallback-local-file', error: String(error) }) };
    return { statusCode: 500, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ error: 'Failed to scrape game', detail: String(error), gameSlug }) };
  }
};
