import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// POST /generate
app.post('/generate', async (req, res) => {
  const { icp_input } = req.body;

  if (!icp_input) {
    return res.status(400).json({ error: 'Missing icp_input in request body.' });
  }

  try {
    // 🔍 Generate report from OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-prover-v2:free',
        messages: [
          { role: 'system', content: 'You are a startup research assistant that generates detailed startup reports based on an ICP (Ideal Customer Profile). Provide comprehensive, insightful, and actionable reports.' },
          { role: 'user', content: `Generate a detailed startup report for the following ICP:\n${icp_input}` }
        ]
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error('OpenRouter error:', data.error);
      return res.status(500).json({ error: data.error.message });
    }

    const reportContent = data.choices?.[0]?.message?.content || 'Failed to generate report.';

    // 💾 Store in Supabase
    const { error: dbError } = await supabase
      .from('reports')
      .insert([{ icp_input, report: reportContent }]);

    if (dbError) {
      console.error('Supabase insert error:', dbError);
      return res.status(500).json({ error: 'Failed to save to database.' });
    }

    return res.json({ icp_input, report: reportContent });

  } catch (err) {
    console.error('Unhandled exception:', err);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

