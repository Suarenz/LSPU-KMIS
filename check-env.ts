import * as dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

console.log('QWEN_API_KEY from .env.local:', process.env.QWEN_API_KEY ? 'SET' : 'NOT SET');
console.log('QWEN_BASE_URL from .env.local:', process.env.QWEN_BASE_URL);

// Also check from .env
dotenv.config({ path: './.env' });
console.log('OPENAI_API_KEY from .env:', process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET');
console.log('OPENAI_BASE_URL from .env:', process.env.OPENAI_BASE_URL);