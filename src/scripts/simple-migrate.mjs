import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const clean = (val) => val ? val.replace(/^["']|["']$/g, '') : val;

const firebaseConfig = {
  apiKey: clean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: clean(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: clean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: clean(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: clean(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: clean(process.env.NEXT_PUBLIC_FIREBASE_APP_ID)
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrate() {
    console.log("Starting migration (Case Insensitive)...");
    const collections = ['portfolio', 'hero_slides', 'services', 'team'];
    
    for (const col of collections) {
        const snap = await getDocs(collection(db, col));
        console.log(`Checking ${col} (${snap.size})...`);
        for (const d of snap.docs) {
            const data = d.data();
            if (data.image && typeof data.image === 'string') {
                const lower = data.image.toLowerCase();
                if (lower.includes('fotoğraflar')) {
                    // Match the case of the original "fotoğraflar" and replace with "portfolio-photos"
                    const newUrl = data.image.replace(/fotoğraflar/i, 'portfolio-photos');
                    await updateDoc(doc(db, col, d.id), { image: newUrl });
                    console.log(`Updated ${col}/${d.id}: ${newUrl}`);
                }
            }
        }
    }
    console.log("Migration complete!");
    process.exit(0);
}

migrate().catch(console.error);
