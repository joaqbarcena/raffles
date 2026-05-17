import { Redis } from "@upstash/redis";

const KV_PREFIX = "raffle:";

function getRedis(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error(
      "Missing Upstash Redis credentials. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env.local"
    );
  }
  return new Redis({ url, token });
}

function kvKey(raffleId: string): string {
  return `${KV_PREFIX}${raffleId}`;
}

export async function getAllRaffleIds(): Promise<string[]> {
  const redis = getRedis();
  return redis.smembers(`${KV_PREFIX}ids`);
}

export async function saveRaffleId(id: string): Promise<void> {
  const redis = getRedis();
  await redis.sadd(`${KV_PREFIX}ids`, id);
}

export async function deleteRaffleId(id: string): Promise<void> {
  const redis = getRedis();
  await redis.srem(`${KV_PREFIX}ids`, id);
}

export async function getRaffle(id: string): Promise<string | null> {
  const redis = getRedis();
  return redis.get(kvKey(id));
}

export async function setRaffle(id: string, data: string): Promise<void> {
  const redis = getRedis();
  await redis.set(kvKey(id), data);
}

export async function removeRaffle(id: string): Promise<void> {
  const redis = getRedis();
  await redis.del(kvKey(id));
}
