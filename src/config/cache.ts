import client from './redis.js';

const CACHE_TTL_DEFAULT = 3600;

export const cacheGet = async <T>(key: string): Promise<T | null> => {
     const raw = await client.get(key);
     if (raw === null || raw === undefined) return null;
     return JSON.parse(raw) as T;
};

export const cacheSet = async <T>(key: string, value: T, ttl: number = CACHE_TTL_DEFAULT): Promise<void> => {
     await client.set(key, JSON.stringify(value), { EX: ttl });
};

export const cacheDel = async (key: string): Promise<void> => {
     await client.del(key);
};
