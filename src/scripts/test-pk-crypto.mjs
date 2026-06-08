import crypto from 'crypto';
import fs from 'fs';

try {
  const envLocal = fs.readFileSync('.env.local', 'utf8');
  const match = envLocal.match(/GOOGLE_INDEXING_SERVICE_ACCOUNT='(.*?)'/);
  const credentials = JSON.parse(match[1]);
  let privateKey = credentials.private_key;
  privateKey = privateKey.replace(/\\n/g, '\n');

  console.log("Key to parse:\n", privateKey.substring(0, 50) + "...\n" + privateKey.substring(privateKey.length - 50));

  const key = crypto.createPrivateKey({
    key: privateKey,
    format: 'pem'
  });
  console.log("Private key parsed successfully!");
} catch (e) {
  console.error("Crypto parsing failed:", e.message);
}
