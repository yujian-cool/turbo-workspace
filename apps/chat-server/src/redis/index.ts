import { createClient } from 'redis';
import type { RedisClientType } from 'redis';


const client: RedisClientType = createClient({
    url: process.env.REDIS_URL
});

client.on('error', (err) => {
    console.log('Redis error: ', err);
});

client.on('connect', () => {
    console.log('Redis connected');
});

export default client;