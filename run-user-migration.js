// Load environment variables
require('dotenv').config({ path: './.env.local' });

// Import the createDefaultUsers function and run it
const { createDefaultUsers } = require('./scripts/create-default-users.ts');
createDefaultUsers().catch(console.error);