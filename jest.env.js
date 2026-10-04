const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock environment variables for Jest testing environment
process.env.DATABASE_URL = "mongodb://localhost:27017/boardtau-test";
process.env.NEXTAUTH_SECRET = "test_secret_key_1234567890123456";
process.env.NEXTAUTH_URL = "http://localhost:3000";
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
process.env.UPSTASH_REDIS_REST_URL = "https://placeholder-redis.upstash.io";
process.env.UPSTASH_REDIS_REST_TOKEN = "placeholder-token";
process.env.NEXT_PUBLIC_POSTHOG_KEY = "phc_mock_key_123456";
process.env.NEXT_PUBLIC_POSTHOG_HOST = "https://app.posthog.com";
process.env.MESSAGE_ENCRYPTION_KEY = "6a89408b045e12810a9f87c53d10bf41e24744bc7a030119f39bb763189d9834";
process.env.NEXT_PUBLIC_CHAT_TOKEN_SECRET = "test_chat_token_secret_1234567890";
