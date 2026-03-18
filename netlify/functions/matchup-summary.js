exports.handler = async function (event) {
  try {
    const body = JSON.parse(event.body || '{}');
    const grade = /-1\.5|\+1\.5/.test(body.spread || '') ? 'B' : 'C';
    const narrative = `${body.team1} and ${body.team2} profile as a tight tournament game, with form, injury availability, and line value all pulling the handicap into one-possession territory.`;
    const angle = `${body.team2 || 'Home team'} moneyline — cleaner path than sweating late free throws in a near-pick'em game.`;
    const sharpTake = `${body.team2 || 'Home team'} has the steadier profile if this gets decided in the final four minutes.`;
    const payload = { narrative, angle, sharpTake, grade, generatedAt: new Date().toISOString(), source: 'heuristic-fallback' };
    return { statusCode: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) };
  } catch (error) {
    return { statusCode: 500, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ error: String(error) }) };
  }
};
