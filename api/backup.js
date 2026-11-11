const admin = require('firebase-admin');

if (!admin.apps.length) {
  const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
  admin.initializeApp({ credential: admin.credential.cert(sa) });
}
const db = admin.firestore();

const BACKUP_SECRET = process.env.CRON_SECRET || '';
const MAX_BACKUPS = 30;

module.exports = async (req, res) => {
  // Vercel Cron sends Authorization header with CRON_SECRET
  const auth = req.headers['authorization'];
  if (BACKUP_SECRET && auth !== `Bearer ${BACKUP_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const backupId = `backup-${dateStr}`;

    // Read all collections in parallel
    const [toursSnap, folgasSnap, csTasksSnap, servicosSnap] = await Promise.all([
      db.collection('tours').get(),
      db.collection('folgas').get(),
      db.collection('csTasks').get(),
      db.collection('servicos').get(),
    ]);

    const tours = toursSnap.docs.map(d => {
      const data = d.data();
      // Skip comprovante base64 to keep backup lean
      const { comprovanteSinal, comprovanteConf, comprovanteExt, ...rest } = data;
      return { id: d.id, ...rest,
        temComprovanteSinal: !!comprovanteSinal,
        temComprovanteConf: !!comprovanteConf,
        temComprovanteExt: !!comprovanteExt
      };
    });
    const folgas = folgasSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const csTasks = csTasksSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const servicos = servicosSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const backup = {
      date: dateStr,
      createdAt: now.toISOString(),
      counts: {
        tours: tours.length,
        folgas: folgas.length,
        csTasks: csTasks.length,
        servicos: servicos.length,
      },
      tours,
      folgas,
      csTasks,
      servicos,
    };

    // Save backup to Firestore
    await db.collection('backups').doc(backupId).set(backup);

    // Clean old backups (keep last MAX_BACKUPS)
    const allBackups = await db.collection('backups')
      .orderBy('date', 'desc')
      .get();

    if (allBackups.size > MAX_BACKUPS) {
      const toDelete = allBackups.docs.slice(MAX_BACKUPS);
      const batch = db.batch();
      toDelete.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }

    return res.status(200).json({
      success: true,
      backupId,
      counts: backup.counts,
      deletedOld: Math.max(0, allBackups.size - MAX_BACKUPS),
    });
  } catch (e) {
    console.error('Backup error:', e);
    return res.status(500).json({ error: e.message });
  }
};
