import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import 'dotenv/config';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrate() {
    console.log("Starting migration...");
    const collections = ['portfolio', 'hero_slides', 'services', 'team'];
    
    for (const col of collections) {
        const snap = await getDocs(collection(db, col));
        for (const d of snap.docs) {
            const data = d.data();
            if (data.image && typeof data.image === 'string' && data.image.includes('Fotoğraflar')) {
                const newUrl = data.image.replace('Fotoğraflar', 'portfolio-photos');
                await updateDoc(doc(db, col, d.id), { image: newUrl });
                console.log(`Updated ${col}/${d.id}: ${newUrl}`);
            }
        }
    }
    console.log("Migration complete!");
}

migrate().catch(console.error);
