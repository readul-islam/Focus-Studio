const fs = require('fs');
const crypto = require('crypto');

const version = {
  hash: crypto.randomBytes(8).toString('hex'),
  buildTime: new Date().toISOString()
};

fs.writeFileSync('./public/version.json', JSON.stringify(version, null, 2));
console.log('Build version generated:', version.hash);
