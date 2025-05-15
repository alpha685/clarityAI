import fetch from 'node-fetch';
import 'dotenv/config';

const { OPENROUTER_API_KEY } = process.env;

async function test() {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-prover-v2:free',
      messages: [
        { role: 'system', content: 'You are a helpful startup research analyst.' },
        { role: 'user', content: 'List top 3 AI startups in healthcare and explain why they’re promising.' }
      ]
    })
  });

  const json = await res.json();
  console.log(JSON.stringify(json, null, 2));
}

test();
