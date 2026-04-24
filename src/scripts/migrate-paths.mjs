import 'dotenv/config'
import { db } from '../lib/firebase.ts'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'

async function migrateImages() {
    console.log('Migrating image paths from Fotoğraflar to portfolio-photos...')
    
    const collections = ['portfolio', 'hero_slides', 'services', 'team']
    
    for (const colName of collections) {
        try {
            const snap = await getDocs(collection(db, colName))
            console.log(`Checking ${colName} (${snap.size} docs)...`)
            
            for (const d of snap.docs) {
                const data = d.data()
                let updated = false
                const newData = { ...data }
                
                if (data.image && typeof data.image === 'string' && data.image.includes('Fotoğraflar')) {
                    newData.image = data.image.replace('Fotoğraflar', 'portfolio-photos')
                    updated = true
                }
                
                if (updated) {
                    await updateDoc(doc(db, colName, d.id), newData)
                    console.log(`Updated doc ${d.id} in ${colName}`)
                }
            }
        } catch (e) {
            console.error(`Error in ${colName}:`, e.message)
        }
    }
    
    console.log('Migration finished!')
    process.exit(0)
}

migrateImages().catch(console.error)
