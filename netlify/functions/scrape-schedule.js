function parseDateFromSlug(slug) {
  const m = slug.match(/NCAAB_(\d{4})(\d{2})(\d{2})_/);
  if (!m) return null;
  return `${m[1]}-${m[2]}-${m[3]}`;
}
exports.handler = async function () {
  const url = 'https://www.sportsline.com/college-basketball/picks/?sc=p';
  try {
    const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' } });
    const html = await res.text();
    const slugs = Array.from(new Set((html.match(/NCAAB_[0-9]{8}_[A-Z0-9]+@[A-Z0-9]+/g) || [])));
    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=1800' },
      body: JSON.stringify({
        source: 'sportsline',
        count: slugs.length,
        games: slugs.map(gameSlug => ({ gameSlug, date: parseDateFromSlug(gameSlug) }))
      })
    };
  } catch (error) {
    return { statusCode: 500, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ error: 'Failed to scrape schedule', detail: String(error) }) };
  }
};
