const Redis = require("ioredis");

const redis = new Redis({
  host: "127.0.0.1",
  port: 6379,
});

const setCache = async (key, value, ttl = 3600) => {
  await redis.set(key, JSON.stringify(value), "EX", ttl);
};

const getCache = async (key) => {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
};

const delCache = async (key) => {
  await redis.del(key);
};

module.exports = { setCache, getCache, delCache };
