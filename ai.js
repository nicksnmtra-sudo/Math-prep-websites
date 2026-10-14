// Netlify Function: AI performance coach. Set ANTHROPIC_API_KEY in Netlify > Site settings > Environment variables.
exports.handler = async (e) => {
  if (e.httpMethod !== 'POST') return { statusCode: 405, body: 'POST only' };
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { statusCode: 500, body: JSON.stringify({ error: 'Missing ANTHROPIC_API_KEY' }) };
  const { stats } = JSON.parse(e.body || '{}');
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-5-5', max_tokens: 700,
      system: "You are a friendly SAT/ACT math coach. From the student's per-topic stats give: **Strengths**, **Top 3 weak areas** (with likely skill gaps), and a short **7-day plan**. Under 250 words, short lines.",
      messages: [{ role: 'user', content: JSON.stringify(stats) }]
    })
  });
  const j = await r.json();
  const text = (j.content || []).map(c => c.text || '').join('');
  return { statusCode: r.ok ? 200 : 502, body: JSON.stringify({ text }) };
};
