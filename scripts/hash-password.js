// Genere le hash bcrypt a mettre dans APP_ADMIN_PASSWORD_HASH.
// Usage : node scripts/hash-password.js "monmotdepasse"
const bcrypt = require("bcryptjs");

const password = process.argv[2];
if (!password) {
  console.error('Usage : node scripts/hash-password.js "monmotdepasse"');
  process.exit(1);
}

bcrypt.hash(password, 10).then((hash) => {
  console.log(hash);
});
