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
  552568: { key: 'obs', type: 'textarea' },
  552578: { key: 'valorSinal', type: 'numeric' },
  552580: { key: 'valorConfirmacao', type: 'numeric' },
  552582: { key: 'sinalPago', type: 'select', enums: {457096:'SIM',457098:'NAO'} },
  552584: { key: 'restantePago', type: 'select', enums: {457100:'SIM',457102:'NAO'} },
  552586: { key: 'status', type: 'select', enums: {457104:'PENDENTE',457106:'ATIVO',457108:'CONCLUIDO',457110:'CANCELADO',457112:'ESTORNO'} }
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
    console.log('Webhook received:', JSON.stringify(body).substring(0, 2000));

    // Kommo webhooks may send nested or flat form-encoded data
    const VENDA_EFETUADA_STATUS = 142;
    let leadId = null;
    let statusId = null;

    // Try nested format: body.leads.status[0].id
    const leads = body.leads || {};
    if (leads.status && leads.status[0]) {
      leadId = leads.status[0].id;
      statusId = Number(leads.status[0].status_id);
    }

    // Try flat form-encoded: body['leads[status][0][id]']
    if (!leadId && body['leads[status][0][id]']) {
      leadId = body['leads[status][0][id]'];
      statusId = Number(body['leads[status][0][status_id]']);
    }

    console.log('Parsed leadId:', leadId, 'statusId:', statusId);

    if (!leadId) return res.status(400).json({ error: 'No lead ID found in webhook', receivedKeys: Object.keys(body).slice(0, 20) });
    if (statusId !== VENDA_EFETUADA_STATUS) return res.json({ skipped: true, reason: 'Status ' + statusId + ' is not VENDA EFETUADA (' + VENDA_EFETUADA_STATUS + ')' });

    console.log('Status is VENDA EFETUADA, fetching lead', leadId);
    const lead = await fetchLead(leadId, token);
    console.log('Lead fetched:', lead.name, 'custom_fields:', (lead.custom_fields_values || []).length);
    const fields = parseCustomFields(lead.custom_fields_values);
    console.log('Parsed fields:', JSON.stringify(fields));

    // Get client name from lead or contact
    let cliente = lead.name || '';
    const contacts = (lead._embedded && lead._embedded.contacts) || [];
    if (contacts.length && contacts[0].name) cliente = contacts[0].name;
    console.log('Cliente:', cliente);

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
      } catch (phoneErr) { console.log('Phone fetch error:', phoneErr.message); }
    }

    // Check if tour already exists for this lead
    console.log('Checking Firestore for existing tour with kommoLeadId:', Number(leadId));
    const existing = await firestore.collection('tours').where('kommoLeadId', '==', Number(leadId)).get();
    if (!existing.empty) {
      const docId = existing.docs[0].id;
      const updates = { ...fields, cliente, kommoLeadId: Number(leadId) };
      if (telefone) updates.telefone = telefone;
      await firestore.collection('tours').doc(docId).update(updates);
      console.log('Tour UPDATED:', docId);
      return res.json({ success: true, action: 'updated', tourId: docId });
    }

    // Create new tour
    const tour = {
      cliente,
      telefone,
      kommoLeadId: Number(leadId),
      status: 'PENDENTE',
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

    console.log('Creating new tour for', cliente);
    const doc = await firestore.collection('tours').add(tour);
    console.log('Tour CREATED:', doc.id);
    return res.json({ success: true, action: 'created', tourId: doc.id });

  } catch (err) {
    console.error('Webhook error:', err.message, err.stack);
    return res.status(500).json({ error: err.message });
  }
};
