import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";
import imageCompression from 'browser-image-compression';

/**
 * Uploads a file to Firebase Storage with automatic compression.
 * @param file The file to upload
 * @param path The path in storage (e.g., 'hero', 'portfolio')
 * @param onProgress Callback for upload progress
 */
export const uploadImage = async (
    file: File, 
    path: string, 
    onProgress?: (progress: number) => void
): Promise<string> => {
    
    // Optimizasyon: Resmi sıkıştır (Maks 2MB, 1920px genişlik)
    const options = {
        maxSizeMB: 2,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/webp' // Page speed için webp formatına çeviriyoruz
    };

    let fileToUpload: File | Blob = file;
    
    try {
        console.log(`Sıkıştırma başlıyor: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
        fileToUpload = await imageCompression(file, options);
        console.log(`Sıkıştırma bitti: ${(fileToUpload.size / 1024 / 1024).toFixed(2)} MB`);
    } catch (error) {
        console.error("Sıkıştırma hatası, orijinal dosya yükleniyor:", error);
    }

    return new Promise((resolve, reject) => {
        const fileName = `${Date.now()}_${file.name.split('.')[0]}.webp`;
        const storageRef = ref(storage, `images/${path}/${fileName}`);
        const uploadTask = uploadBytesResumable(storageRef, fileToUpload);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (onProgress) onProgress(progress);
            },
            (error) => {
                console.error("Upload error:", error);
                reject(error);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
            }
        );
    });
};
