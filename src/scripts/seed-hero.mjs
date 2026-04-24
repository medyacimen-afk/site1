import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
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

async function seedHero() {
    console.log("Seeding Hero Slides...");
    const snap = await getDocs(collection(db, 'hero_slides'));
    if (snap.size === 0) {
        const slides = [
            { image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1920", createdAt: new Date().toISOString() },
            { image: "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=1920", createdAt: new Date().toISOString() }
        ];
        for (const s of slides) {
            await addDoc(collection(db, 'hero_slides'), s);
            console.log("Added slide");
        }
    } else {
        console.log("Slides already exist");
    }
    process.exit(0);
}

seedHero().catch(console.error);
