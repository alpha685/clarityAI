import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

console.log('SUPABASE_URL:', SUPABASE_URL);
console.log('OPENROUTER_API_KEY:', OPENROUTER_API_KEY ? '***hidden***' : 'MISSING');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function fetchExistingData() {
  const { data, error } = await supabase.from('reports').select('*');
  if (error) {
    console.error('❌ Error reading data:', error);
    return [];
  }
  console.log(`📄 Existing rows found: ${data.length}`);
  return data;
}

async function callOpenRouterDeepSeek(icpInput) {
  console.log('🔍 Calling OpenRouter DeepSeek with ICP:', icpInput);
  const model = 'deepseek/deepseek-prover-v2:free';
  const url = 'https://openrouter.ai/api/v1/chat/completions';

  const body = {
    model,
    messages: [
      {
        role: 'system',
        content:
          'You are a startup research assistant that generates detailed startup reports based on an ICP (Ideal Customer Profile). Provide comprehensive, insightful, and actionable reports.',
      },
      {
        role: 'user',
        content: `Generate a detailed startup report for the following ICP:\n${icpInput}`,
      },
    ],
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    if (res.status !== 200) {
      console.error(`❌ OpenRouter returned HTTP ${res.status}`);
      console.error('🧾 Full response text:', text);
      return null;
    }

    console.log('🔍 Raw response text:', text);
    const json = JSON.parse(text);

    if (json.error) {
      console.error('❌ DeepSeek error:', json.error);
      return null;
    }

    if (
      json.choices &&
      json.choices.length > 0 &&
      json.choices[0].message &&
      json.choices[0].message.content
    ) {
      return json.choices[0].message.content;
    } else {
      console.error('❌ DeepSeek returned no valid choices:', json);
      return null;
    }
  } catch (err) {
    console.error('❌ Exception calling DeepSeek:', err);
    return null;
  }
}

async function insertReport(icpInput, report) {
  const { data, error } = await supabase
    .from('reports')
    .insert([{ icp_input: icpInput, report }])
    .select();

  if (error) {
    console.error('❌ Error inserting report:', error);
    return null;
  }

  console.log('✅ Report inserted:', data);
  return data;
}

async function main() {
  const existingData = await fetchExistingData();

  const icpSamples = [
    'Fintech startups for SMB lending in India',
    'B2B AI tools for marketing automation',
  ];

  for (const icpInput of icpSamples) {
    console.log(`\nProcessing ICP: "${icpInput}"`);

    const generatedReport = await callOpenRouterDeepSeek(icpInput);

    if (!generatedReport) {
      console.log('❌ Failed to generate report.');
      await insertReport(icpInput, 'Failed to generate report.');
    } else {
      console.log('📝 Generated report:', generatedReport);
      await insertReport(icpInput, generatedReport);
    }
  }

  const finalData = await fetchExistingData();
  console.log('📦 Supabase data:', finalData);
}

// Optional if you want to run this via Express later
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
