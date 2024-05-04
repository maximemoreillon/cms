import { RedisClientType, createClient } from "redis"

export const { REDIS_URL } = process.env

let client: RedisClientType

export const init = async () => {
  if (!REDIS_URL) {
    console.log(`[Cache] REDIS_URL not set, skipping`)
    return
  }

  console.log(`[Cache] Using redis at ${REDIS_URL}`)

  client = createClient({ url: REDIS_URL })

  client.on("error", (err) => console.log("Redis Client Error", err))

  await client.connect()
}

// Multiple articles
export const getArticlesFromCache = async (key: string) => {
  if (!client) return
  const userFromCache = await client.get(key)
  if (!userFromCache) return
  return { ...JSON.parse(userFromCache), cached: true }
}

export const setArticlesInCache = async (key: string, articles: any) => {
  if (!client) return
  await client.set(key, JSON.stringify(articles), {
    EX: 60 * 60 * 12,
  })
}

export const removeArticlesFromCache = async () => {
  if (!client) return
  for await (const key of client.scanIterator({ MATCH: "articles*" })) {
    await client.del(key)
  }
}

// Single article
export const getArticleFromCache = async (id: string) => {
  if (!client) return
  const articleFromCache = await client.get(`article:${id}`)
  if (!articleFromCache) return
  return { ...JSON.parse(articleFromCache), cached: true }
}

export const setArticleInCache = async (article: any) => {
  if (!client) return
  await client.set(`article:${article._id}`, JSON.stringify(article), {
    EX: 60 * 60 * 12,
  })
}

export const removeArticleFromCache = async (article_id: string) => {
  if (!client) return
  await client.del(`article:${article_id}`)
}
