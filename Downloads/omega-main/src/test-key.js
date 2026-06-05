const fs = require('fs');
const dotenv = require('dotenv');

// Charger les variables d'environnement depuis .env.local
if (fs.existsSync('.env.local')) {
  const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

const privateKey = process.env.FIREBASE_PRIVATE_KEY;
console.log('Raw Key Length:', privateKey ? privateKey.length : 0);
console.log('Contains literal \\n:', privateKey ? privateKey.includes('\\n') : false);
console.log('Contains real newlines:', privateKey ? privateKey.includes('\n') : false);

const cleanedKey = privateKey ? privateKey.replace(/\\n/g, '\n') : '';
console.log('Cleaned Key Length:', cleanedKey.length);

try {
  const crypto = require('crypto');
  // Tenter de créer une clé privée pour voir si OpenSSL la valide
  crypto.createPrivateKey(cleanedKey);
  console.log('SUCCESS: Key is valid and parsed correctly!');
} catch (err) {
  console.error('ERROR validating key:', err.message);
}
