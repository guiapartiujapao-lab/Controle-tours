const SUBDOMAIN = 'contatopartiujapaocombr';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = process.env.KOMMO_ACCESS_TOKEN;
  if (!token) return res.status(500).json({ error: 'KOMMO_ACCESS_TOKEN not configured' });

  const baseUrl = `https://${SUBDOMAIN}.kommo.com/api/v4`;
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const { action, data } = req.body || {};

  try {
    switch (action) {
      case 'search': {
        const query = encodeURIComponent((data && data.query) || '');
        const r = await fetch(`${baseUrl}/leads?query=${query}&limit=10&with=contacts`, { headers });
        if (r.status === 204) return res.json({ _embedded: { leads: [] } });
        if (!r.ok) return res.status(r.status).json({ error: `Kommo ${r.status}`, detail: await r.text() });
        const text = await r.text();
        if (!text) return res.json({ _embedded: { leads: [] } });
        return res.json(JSON.parse(text));
      }

      case 'update': {
        if (!data || !data.id) return res.status(400).json({ error: 'Missing lead id' });
        const r = await fetch(`${baseUrl}/leads`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify([{ id: data.id, custom_fields_values: data.custom_fields_values }]),
        });
        if (!r.ok) return res.status(r.status).json({ error: `Kommo ${r.status}`, detail: await r.text() });
        return res.json(await r.json());
      }

      case 'get_lead': {
        if (!data || !data.id) return res.status(400).json({ error: 'Missing lead id' });
        const r = await fetch(`${baseUrl}/leads/${data.id}?with=contacts`, { headers });
        if (!r.ok) return res.status(r.status).json({ error: `Kommo ${r.status}`, detail: await r.text() });
        return res.json(await r.json());
      }

      case 'get_pipelines': {
        const r = await fetch(`${baseUrl}/leads/pipelines`, { headers });
        if (!r.ok) return res.status(r.status).json({ error: `Kommo ${r.status}`, detail: await r.text() });
        return res.json(await r.json());
      }

      case 'get_field': {
        if (!data || !data.id) return res.status(400).json({ error: 'Missing field id' });
        const r = await fetch(`${baseUrl}/leads/custom_fields/${data.id}`, { headers });
        if (!r.ok) return res.status(r.status).json({ error: `Kommo ${r.status}`, detail: await r.text() });
        return res.json(await r.json());
      }

      case 'update_field': {
        if (!data || !data.id) return res.status(400).json({ error: 'Missing field id' });
        const r = await fetch(`${baseUrl}/leads/custom_fields/${data.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ enums: data.enums }),
        });
        if (!r.ok) return res.status(r.status).json({ error: `Kommo ${r.status}`, detail: await r.text() });
        return res.json(await r.json());
      }

      case 'subscribe_webhook': {
        if (!data || !data.destination) return res.status(400).json({ error: 'Missing destination URL' });
        const r = await fetch(`${baseUrl}/webhooks`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ destination: data.destination, settings: data.settings || ['status_lead'] }),
        });
        if (!r.ok) return res.status(r.status).json({ error: `Kommo ${r.status}`, detail: await r.text() });
        return res.json(await r.json());
      }

      default:
        return res.status(400).json({ error: 'Invalid action. Use: search, update, get_lead, get_pipelines, subscribe_webhook' });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
