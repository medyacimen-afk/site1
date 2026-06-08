import { google } from 'googleapis';
import fs from 'fs';

async function test() {
  try {
    const envLocal = fs.readFileSync('.env.local', 'utf8');
    const match = envLocal.match(/GOOGLE_INDEXING_SERVICE_ACCOUNT='(.*?)'/);
    if (!match) throw new Error("No env var found");
    
    const credentials = JSON.parse(match[1]);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });

    const indexing = google.indexing('v3');
    console.log("Sending request...");
    const response = await indexing.urlNotifications.publish({
      auth,
      requestBody: {
        url: 'https://sivasdugunfotografcisi.com/',
        type: 'URL_UPDATED',
      },
    });

    console.log("Success:", response.data);
  } catch (error) {
    console.error("Error details:", error.response?.data || error.message);
  }
}

test();
