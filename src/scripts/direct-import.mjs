import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, writeBatch, doc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import fs from 'fs';
import path from 'path';

const firebaseConfig = {
  apiKey: "AIzaSyANXlQdDiUFjCpQPUXk4jnetupAczny_ng",
  authDomain: "sivasdugunfotografcisicom.firebaseapp.com",
  projectId: "sivasdugunfotografcisicom",
  storageBucket: "sivasdugunfotografcisicom.firebasestorage.app",
  messagingSenderId: "367648441409",
  appId: "1:367648441409:web:f3817a7fb486cdc24032c0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function run() {
    try {
        console.log("Giriş yapılıyor...");
        await signInWithEmailAndPassword(auth, "sivaskadraj@gmail.com", "Suat.22541970");
        console.log("Giriş başarılı!");

        const importDir = path.join(process.cwd(), 'public', 'fotoğraflar');
        const files = fs.readdirSync(importDir);
        const imageFiles = files.filter(file => 
            ['.jpg', '.jpeg', '.png', '.webp'].includes(path.extname(file).toLowerCase())
        );

        console.log(`${imageFiles.length} fotoğraf bulundu. Firestore'a yazılıyor...`);

        // Batch processing (max 500 items per batch)
        const batch = writeBatch(db);
        for (const file of imageFiles) {
            const docRef = doc(collection(db, 'portfolio'));
            const title = file.split('.')[0].replace(/-/g, ' ').replace(/_/g, ' ');
            batch.set(docRef, {
                title: title.charAt(0).toUpperCase() + title.slice(1),
                category: 'Düğün Hikayesi',
                image: `/fotoğraflar/${file}`,
                isHome: false,
                createdAt: new Date().toISOString()
            });
        }

        await batch.commit();
        console.log("Aktarım başarıyla tamamlandı.");
        process.exit(0);
    } catch (error) {
        console.error("Hata oluştu:", error);
        process.exit(1);
    }
}

run();
