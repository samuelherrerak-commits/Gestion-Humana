const API_KEY = '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';
const API_URL = '/v1/chat/completions';
const MODEL = 'z-ai/glm-5.2';
const MAX_TOKENS = 8192;
const TEMPERATURE = 0.3;

export async function generarInforme(promptSystem, promptUser) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: promptSystem },
        { role: 'user', content: promptUser }
      ],
      max_tokens: MAX_TOKENS,
      temperature: TEMPERATURE
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Error NVIDIA API (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
