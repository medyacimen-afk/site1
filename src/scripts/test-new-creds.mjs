import { google } from 'googleapis';
import fs from 'fs';

async function test() {
  try {
    const credsStr = fs.readFileSync('src/scripts/new-creds.json', 'utf8');
    const credentials = JSON.parse(credsStr);
    
    let privateKey = credentials.private_key || '';
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: privateKey,
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
