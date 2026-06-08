import fs from 'fs';

try {
  const envLocal = fs.readFileSync('.env.local', 'utf8');
  const match = envLocal.match(/GOOGLE_INDEXING_SERVICE_ACCOUNT='(.*?)'/);
  if (!match) throw new Error("No env var found");
  
  const credentials = JSON.parse(match[1]);
  let privateKey = credentials.private_key || '';
  
  console.log("Original private key length:", privateKey.length);
  console.log("Contains \\n?", privateKey.includes('\\n'));
  console.log("Contains \\\\n?", privateKey.includes('\\\\n'));
  console.log("Contains actual newline?", privateKey.includes('\n'));
  
  if (!privateKey.includes('-----BEGIN PRIVATE KEY-----\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }
  
  console.log("Replaced private key length:", privateKey.length);
  console.log("First 60 chars of replaced key:");
  console.log(privateKey.substring(0, 60));
  
  console.log("Replaced string contains real newline?", privateKey.includes('\n'));
  console.log("Replaced string contains \\n?", privateKey.includes('\\n'));

} catch (error) {
  console.error(error);
}
