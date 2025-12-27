const bcrypt = require('bcryptjs');

bcrypt.hash('admin123', 10).then(hash => {
  console.log('Generated hash:', hash);
  bcrypt.compare('admin123', hash).then(match => {
    console.log('Verification:', match);
  });
});
