import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Since we don't have a service account key file, we might try to use the environment
// but usually it requires GOOGLE_APPLICATION_CREDENTIALS.
// If not available, this will fail.

if (!admin.apps.length) {
    admin.initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    });
}

const db = admin.firestore();

async function migrate() {
    console.log("Starting Admin Migration...");
    const collections = ['portfolio', 'hero_slides', 'services', 'team'];
    
    for (const col of collections) {
        const snap = await db.collection(col).get();
        console.log(`Checking ${col} (${snap.size})...`);
        const batch = db.batch();
        let count = 0;
        
        snap.forEach(d => {
            const data = d.data();
            if (data.image && typeof data.image === 'string' && data.image.toLowerCase().includes('fotoğraflar')) {
                const newUrl = data.image.replace(/fotoğraflar/i, 'portfolio-photos');
                batch.update(d.ref, { image: newUrl });
                count++;
            }
        });
        
        if (count > 0) {
            await batch.commit();
            console.log(`Updated ${count} docs in ${col}`);
        }
    }
    console.log("Migration complete!");
}

migrate().catch(e => {
    console.error("Admin Migration Failed:", e.message);
    process.exit(1);
});
