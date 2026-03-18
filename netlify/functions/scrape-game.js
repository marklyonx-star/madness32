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

exports.handler = async function (event) {
  const gameSlug = event.queryStringParameters?.gameSlug || 'NCAAB_20260320_MIZZOU@MIAMI';
  const forceRefresh = event.queryStringParameters?.refresh === '1';
  const cache = readLocalCache(gameSlug);
  if (cache && !forceRefresh && cache.ageMs < 30 * 60 * 1000) {
    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=1800' },
      body: JSON.stringify({ ...cache.json, cache: 'local-file', ageMs: cache.ageMs })
    };
  }

  const targetUrl = `https://www.sportsline.com/college-basketball/game-forecast/${gameSlug}/`;
  try {
    const res = await fetch(targetUrl, { headers: { 'user-agent': 'Mozilla/5.0' } });
    const html = await res.text();
    if (cache?.json) {
      return {
        statusCode: 200,
        headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=1800' },
        body: JSON.stringify({ ...cache.json, cache: 'fallback-local-file', fetchedHtmlBytes: html.length })
      };
    }
    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ gameSlug, source: 'sportsline-html', fetchedHtmlBytes: html.length, note: 'Generic parser skeleton ready; structured extraction currently seeded for cached games.' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to scrape game', detail: String(error), gameSlug })
    };
  }
};
