import { google } from 'googleapis';
import fs from 'fs';

async function test() {
  try {
    const envLocal = fs.readFileSync('.env.local', 'utf8');
    const match = envLocal.match(/GOOGLE_INDEXING_SERVICE_ACCOUNT='(.*?)'/);
    if (!match) throw new Error("No env var found");
    
    // Create a new file with just the JSON content to be safe
    const jsonStr = match[1];
    const credentials = JSON.parse(jsonStr);

    // Let's hardcode the replace exactly how it should be
    let key = credentials.private_key;
    key = key.split('\\n').join('\n');
    key = key.split('\\\\n').join('\n');

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: credentials.client_email,
        private_key: key
      },
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
