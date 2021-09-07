const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

// Override rate limit for testing
process.env.RATE_LIMIT_WINDOW = 1000;
process.env.RATE_LIMIT_MAX = 2;
