const admin = require('firebase-admin');

if (!admin.apps.length) {
  const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
  admin.initializeApp({ credential: admin.credential.cert(sa) });
}
const firestore = admin.firestore();

const SUBDOMAIN = 'contatopartiujapaocombr';

const KOMMO_FIELDS_REVERSE = {
  552534: { key: 'destino', type: 'select', enums: {456972:'TOKYO',456974:'OSAKA',456976:'KYOTO',456978:'NARA',456980:'HAKONE',456982:'KAMAKURA',456984:'KOBE',456986:'NIKKO',456988:'HIROSHIMA',456990:'MONTE FUJI',456992:'YOKOHAMA',456994:'MIYAJIMA',456996:'TAKAYAMA',456998:'KANAZAWA'} },
  552536: { key: 'duracao', type: 'select', enums: {457000:'3 HORAS',457002:'4 HORAS',457004:'5 HORAS',457006:'6 HORAS',457008:'7 HORAS',457010:'8 HORAS',457012:'10 HORAS',457014:'12 HORAS',457016:'FULL DAY'} },
  552538: { key: 'dataTour', type: 'date' },
  552540: { key: 'dataVenda', type: 'date' },
  552542: { key: 'pessoas', type: 'numeric' },
  552544: { key: 'guia', type: 'select', enums: {457080:'MAYRA',457082:'TOTTI',457084:'CLINTE',457034:'SAYURI',457086:'KETLIN',457088:'JONAS',457090:'LORRAN',457092:'KAORI',457094:'RESERVA',457018:'DIEGO',457020:'VANESSA',457022:'LUCAS',457024:'SUU',457026:'TATI',457028:'MATSUDA',457030:'FABI',457032:'MASA',457036:'KATSUKI',457038:'HANAKO',457040:'YUKI',457042:'MISA',457044:'GUIA LOCAL'} },
  552546: { key: 'horario', type: 'text' },
  552548: { key: 'hotel', type: 'text' },
  552550: { key: 'valorUsd', type: 'numeric' },
  552552: { key: 'cambio', type: 'numeric' },
  552554: { key: 'valorBrl', type: 'numeric' },
  552556: { key: 'formaPagamento', type: 'select', enums: {457046:'PIX',457048:'CARTÃO DE CRÉDITO',457050:'TRANSFERÊNCIA BANCÁRIA',457052:'PAYPAL',457054:'WISE',457056:'DINHEIRO'} },
  552558: { key: 'extensao', type: 'select', enums: {457058:'NAO',457060:'SIM'} },
  552560: { key: 'valorExtensao', type: 'numeric' },
  552562: { key: 'valorExtensaoBrl', type: 'numeric' },
  552564: { key: 'tipoTour', type: 'select', enums: {457062:'PRIVATIVO',457064:'AGENCIA',457066:'SEMI-PRIVATIVO'} },
  552566: { key: 'agencia', type: 'text' },
  552568: { key: 'obs', type: 'textarea' }
};

function parseCustomFields(cfv) {
  const result = {};
  for (const cf of (cfv || [])) {
    const def = KOMMO_FIELDS_REVERSE[cf.field_id];
    if (!def || !cf.values || !cf.values.length) continue;
    const v = cf.values[0];
    if (def.type === 'select') {
      result[def.key] = (def.enums && v.enum_id) ? (def.enums[v.enum_id] || '') : '';
    } else if (def.type === 'date') {
      if (v.value) {
        const d = new Date(v.value * 1000);
        result[def.key] = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      }
    } else if (def.type === 'numeric') {
      result[def.key] = v.value != null ? Number(v.value) : '';
    } else {
      result[def.key] = v.value || '';
    }
  }
  return result;
}

async function fetchLead(leadId, token) {
  const r = await fetch(`https://${SUBDOMAIN}.kommo.com/api/v4/leads/${leadId}?with=contacts`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  });
  if (!r.ok) throw new Error(`Kommo API ${r.status}`);
  return r.json();
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = process.env.KOMMO_ACCESS_TOKEN;
  if (!token) return res.status(500).json({ error: 'KOMMO_ACCESS_TOKEN not configured' });

  try {
    const body = req.body || {};

    // Kommo webhooks send leads[status][0][id] or leads[add][0][id] or leads[update][0][id]
    let leadId = null;
    const leads = body.leads || {};
    for (const action of ['status', 'update', 'add']) {
      if (leads[action] && leads[action][0] && leads[action][0].id) {
        leadId = leads[action][0].id;
        break;
      }
    }

    if (!leadId) return res.status(400).json({ error: 'No lead ID found in webhook' });

    const lead = await fetchLead(leadId, token);
    const fields = parseCustomFields(lead.custom_fields_values);

    // Get client name from lead or contact
    let cliente = lead.name || '';
    const contacts = (lead._embedded && lead._embedded.contacts) || [];
    if (contacts.length && contacts[0].name) cliente = contacts[0].name;

    // Get phone from contact (if available)
    let telefone = '';
    if (contacts.length && contacts[0].id) {
      try {
        const cr = await fetch(`https://${SUBDOMAIN}.kommo.com/api/v4/contacts/${contacts[0].id}`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        if (cr.ok) {
          const contact = await cr.json();
          const phoneCf = (contact.custom_fields_values || []).find(f => f.field_code === 'PHONE');
          if (phoneCf && phoneCf.values && phoneCf.values[0]) telefone = phoneCf.values[0].value || '';
        }
      } catch (_) {}
    }

    // Check if tour already exists for this lead
    const existing = await firestore.collection('tours').where('kommoLeadId', '==', Number(leadId)).get();
    if (!existing.empty) {
      // Update existing tour
      const docId = existing.docs[0].id;
      const updates = { ...fields, cliente, kommoLeadId: Number(leadId) };
      if (telefone) updates.telefone = telefone;
      await firestore.collection('tours').doc(docId).update(updates);
      return res.json({ success: true, action: 'updated', tourId: docId });
    }

    // Create new tour
    const tour = {
      cliente,
      telefone,
      kommoLeadId: Number(leadId),
      status: 'ATIVO',
      sinalPago: 'NAO',
      restantePago: 'NAO',
      guiaConfirmou: 'NAO',
      despesaGuia: 0,
      liquido: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      ...fields
    };

    // Calculate liquido if we have valorBrl and despesaGuia
    if (tour.valorBrl && tour.despesaGuia != null) {
      tour.liquido = Number(tour.valorBrl) - Number(tour.despesaGuia);
    }

    const doc = await firestore.collection('tours').add(tour);
    return res.json({ success: true, action: 'created', tourId: doc.id });

  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: err.message });
  }
};
