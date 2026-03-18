exports.handler = async function (event) {
  try {
    const body = JSON.parse(event.body || '{}');
    const system = `You are a sharp NCAA Tournament analyst and sports bettor. Given matchup data, return ONLY a JSON object with exactly these fields:\n{\n  "narrative": "2-3 sentences on the matchup storyline and key factors",\n  "angle": "Your strongest betting lean with one clear reason",\n  "sharpTake": "One sentence, confident, like a veteran bettor",\n  "grade": "A, B, or C based on confidence"\n}\nNo preamble. No markdown. JSON only.`;
    const user = `Team 1: ${body.team1} | Record: ${body.record1} | ATS: ${body.ats1} | Last 5: ${body.last5_team1}\nTeam 2: ${body.team2} | Record: ${body.record2} | ATS: ${body.ats2} | Last 5: ${body.last5_team2}\nSpread: ${body.spread} | Moneyline: ${body.moneyline} | O/U: ${body.overunder}\nInjuries Team 1: ${(body.injuries1 || []).join(', ')}\nInjuries Team 2: ${(body.injuries2 || []).join(', ')}\nSeed 1: ${body.seed1 || 'TBD'} | Seed 2: ${body.seed2 || 'TBD'} | Region: ${body.region || 'TBD'}`;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          system,
          messages: [{ role: 'user', content: user }]
        })
      });
      const json = await res.json();
      const text = json?.content?.[0]?.text || '{}';
      const parsed = JSON.parse(text);
      parsed.generatedAt = new Date().toISOString();
      parsed.source = 'anthropic';
      return { statusCode: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify(parsed) };
    }

    const grade = /-1\.5|\+1\.5/.test(body.spread || '') ? 'B' : 'C';
    const payload = {
      narrative: `${body.team1} and ${body.team2} profile as a tight tournament game, with form, injury availability, and line value all pulling the handicap into one-possession territory.`,
      angle: `${body.team2 || 'Home team'} moneyline — cleaner path than sweating late free throws in a near-pick'em game.`,
      sharpTake: `${body.team2 || 'Home team'} has the steadier profile if this gets decided in the final four minutes.`,
      grade,
      generatedAt: new Date().toISOString(),
      source: 'heuristic-fallback'
    };
    return { statusCode: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) };
  } catch (error) {
    return { statusCode: 500, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ error: String(error) }) };
  }
};
