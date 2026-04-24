import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function run() {
    try {
        const importDir = path.join(process.cwd(), 'public', 'fotoğraflar');
        const files = fs.readdirSync(importDir);
        const imageFiles = files.filter(file => 
            ['.jpg', '.jpeg', '.png', '.webp'].includes(path.extname(file).toLowerCase())
        );

        console.log(`${imageFiles.length} fotoğraf bulundu. CLI üzerinden Firestore'a basılıyor...`);

        for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            const id = `portfolio_${Date.now()}_${i}`;
            const title = file.split('.')[0].replace(/-/g, ' ').replace(/_/g, ' ');
            const data = {
                title: title.charAt(0).toUpperCase() + title.slice(1),
                category: 'Düğün Hikayesi',
                image: `/fotoğraflar/${file}`,
                isHome: false,
                createdAt: new Date().toISOString()
            };

            const jsonStr = JSON.stringify(data).replace(/"/g, '\\"');
            const command = `firebase firestore:set portfolio/${id} "${jsonStr}" --project sivasdugunfotografcisicom --force`;
            
            console.log(`[${i+1}/${imageFiles.length}] ${file} aktarılıyor...`);
            execSync(command);
        }

        console.log("Tüm fotoğraflar başarıyla Firestore'a eklendi!");
        process.exit(0);
    } catch (error) {
        console.error("Hata:", error.message);
        process.exit(1);
    }
}

run();
