import createHttpError from "http-errors"
import { driver } from "../../db"
import { get_current_user_id } from "../../utils"
import validateArticle from "../../schemas/article"
import { Request, Response, NextFunction } from "express"
import {
  getArticleFromCache,
  getArticlesFromCache,
  removeArticleFromCache,
  removeArticlesFromCache,
  setArticleInCache,
  setArticlesInCache,
} from "../../cache"

export const create_article = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Route to create an article

  const session = driver.session()
  try {
    const current_user_id = get_current_user_id(res)
    if (!current_user_id) throw createHttpError(403, `Unauthorized`)

    // destructure to handle article node and tag nodes separately;
    // TODO: Extract tags if provided
    const { tag_ids = [], ...articleProperties } = req.body

    const valid = validateArticle(articleProperties)
    // @ts-ignore
    if (!valid) throw createHttpError(400, validateArticle.errors[0].message)

    const query = `
      // create the article node
      CREATE (article:Article)

      // Set initial properties
      SET article = $article
      SET article.views = 0
      SET article._id = randomUUID()

      // Add relationship to author
      WITH article
      MATCH (author:User)
      WHERE author._id = $author_id
      MERGE (article)-[authorship:WRITTEN_BY]->(author)

      // Save dates in the relationship
      SET authorship.creation_date = date()
      SET authorship.edition_date = date()

      // Deal with tags
      // EMPTY LISTS ARE A PAIN
      WITH article

      UNWIND
        CASE
          WHEN $tag_ids = []
            THEN [null]
          ELSE $tag_ids
        END AS tag_id

      OPTIONAL MATCH (tag:Tag)
      WHERE tag._id = tag_id
      WITH collect(tag) as tags, article
      FOREACH(tag IN tags | MERGE (article)<-[:APPLIED_TO]-(tag))

      // Return the article
      RETURN properties(article) AS article
      `

    const params = {
      author_id: current_user_id,
      article: articleProperties,
      tag_ids,
    }

    const { records } = await session.run(query, params)
    const article = records[0].get("article")
    if (!article) throw createHttpError(500, `Article could not be created`)
    console.log(`Article ${article._id} created`)
    removeArticlesFromCache()

    res.send(article)
  } catch (error) {
    next(error)
  } finally {
    session.close()
  }
}

export const read_articles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const current_user = res.locals.user
  const current_user_id = get_current_user_id(res)

  const {
    author_id,
    tag_id,
    search,
    sort,
    order = "DESC",
    start_index = "0",
    batch_size = "10",
  } = req.query

  const cacheKey = `articles:${JSON.stringify({
    ...req.query,
    user_id: current_user_id,
  })}`

  const articlesFromCache = await getArticlesFromCache(cacheKey)
  if (articlesFromCache) return res.send(articlesFromCache)

  const session = driver.session()

  try {
    const sorting = () => {
      let sorting = "authorship.creation_date"
      const sorting_lookup = {
        date: "authorship.creation_date",
        title: "article.title",
        views: "article.views",
      }

      // @ts-ignore
      if (sort && sorting_lookup[sort]) sorting = sorting_lookup[sort]

      return sorting
    }

    const batching = () => {
      return `WITH article_count,
          article_collection[toInteger(${start_index})..toInteger(${start_index})+toInteger(${batch_size})] AS articles`
    }

    const query = `
        // Get all articles and teir author
        MATCH (article:Article)-[:WRITTEN_BY]->(author:User)

        // Show only published articles or articles written by user
        WHERE article.published = true
        ${current_user ? `OR author._id = $current_user_id` : ``}

        // Using search bar to find matching titles
        WITH article
        ${
          search ? `WHERE toLower(article.title) CONTAINS toLower($search)` : ``
        }

        // Filter by tag if provided
        WITH article
        ${
          tag_id
            ? "MATCH (tag:Tag)-[:APPLIED_TO]->(article) WHERE tag._id = $tag_id"
            : ""
        }

        // Filter by user if provided
        WITH article
        ${
          author_id
            ? "MATCH (author:User)<-[WRITTEN_BY]-(article) WHERE author._id = $author_id"
            : ""
        }

        // Get tags
        WITH article
        OPTIONAL MATCH (tag:Tag)-[:APPLIED_TO]->(article)

        // Author
        WITH article, COLLECT(properties(tag)) AS  tags
        MATCH (article)-[authorship:WRITTEN_BY]->(author:User)

        // Sorting and ordering
        // Can sort by views, date or title (alphabetically)
        WITH article, authorship, author, tags
        ORDER BY ${sorting()} ${order === "ASC" ? "ASC" : "DESC"}



        // Collect everything for count and batching
        WITH COUNT(DISTINCT(article)) AS article_count,
          COLLECT({
            article: properties(article),
            author: properties(author),
            authorship: properties(authorship),
            tags: tags
          }) AS article_collection

        // Return only articles by batch
        ${batching()}

        // Return articles
        RETURN article_count, articles
        `

    const params = {
      current_user_id,
      author_id,
      tag_id,
      search,
      sort,
      order,
      start_index,
      batch_size,
    }

    const { records } = await session.run(query, params)

    const output = {
      article_count: records[0].get("article_count"),
      articles: records[0].get("articles").map((a: any) => {
        const { content, ...articleProperties } = a.article

        return {
          ...articleProperties,
          author: a.author,
          authorship: a.authorship,
          tags: a.tags,
        }
      }),
    }

    output.articles.forEach((article: any) => {
      delete article.author.password_hashed
    })

    setArticlesInCache(cacheKey, output)

    res.send(output)
  } catch (error) {
    next(error)
  } finally {
    session.close()
  }
}

const incrementViewCount = async (articleId: string) => {
  const query = `
  MATCH (article:Article {_id: $articleId})
  SET article.views = COALESCE(article.views, 0) + 1
  RETURN article.views as views
  `
  const params = { articleId }
  const session = driver.session()
  try {
    await session.run(query, params)
  } catch (error) {
    console.error(error)
  } finally {
    session.close()
  }
}

export const read_article = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { article_id } = req.params
  const current_user_id = get_current_user_id(res)

  let article = await getArticleFromCache(article_id)

  if (!article) {
    const session = driver.session()
    try {
      const query = `
        // Match article by ID
        MATCH (article:Article {_id: $article_id})-[authorship:WRITTEN_BY]->(author:User)
  
        // Get the tags of the article
        // OPTIONAL MATCH because some articles might not have a tag
        WITH article, author, authorship
        OPTIONAL MATCH (tag:Tag)-[:APPLIED_TO]->(article)
  
        // Tags is an array
        RETURN
          properties(article) as article,
          properties(author) as author,
          properties(authorship) as authorship,
          collect(properties(tag)) as tags
        `

      const params = { current_user_id, article_id }

      const { records } = await session.run(query, params)
      if (!records.length)
        throw createHttpError(404, `Article ${article_id} not found`)

      const record = records[0]
      const author = record.get("author")
      delete author.password_hashed

      article = {
        ...record.get("article"),
        author,
        authorship: record.get("authorship"),
        tags: record.get("tags"),
        cached: false,
      }

      setArticleInCache(article)
    } catch (error) {
      next(error)
    } finally {
      session.close()
    }
  }

  if (!article) return res.status(404).send("Article not found")
  if (!article.published && article.author._id !== current_user_id)
    return res.status(401).send("Fobirdden")

  incrementViewCount(article_id)
  res.send(article)
}

export const update_article = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = driver.session()

  try {
    const { article_id } = req.params
    const current_user_id = get_current_user_id(res)
    if (!current_user_id) throw createHttpError(403, `Unauthorized`)

    // TODO: extract tags if provided
    const {
      tag_ids = [],
      tags,
      authorship,
      author,
      _id,
      views,
      ...articleProperties
    } = req.body

    const valid = validateArticle(articleProperties)
    // @ts-ignore
    if (!valid) throw createHttpError(400, validateArticle.errors[0].message)

    const query = `
      // Find the article node and update it
      MATCH (article:Article)-[rel:WRITTEN_BY]->(author:User)
      WHERE article._id = $article_id
        AND author._id = $author_id

      // Remove previously set properties
      REMOVE article.thumbnail_src
      REMOVE article.summary
      REMOVE article.title

      // Set the new properties
      SET article += $article

      // Update the edition date
      SET rel.edition_date = date()

      // Delete all relationships to tags so as to recreate the necessary ones
      WITH article
      OPTIONAL MATCH (article)<-[r:APPLIED_TO]-(tag:Tag)
      DELETE r

      // Deal with tags
      // EMPTY LISTS ARE A PAIN
      WITH article

      UNWIND
        CASE
          WHEN $tag_ids = []
            THEN [null]
          ELSE $tag_ids
        END AS tag_id

      OPTIONAL MATCH (tag:Tag)
      WHERE tag._id = tag_id
      WITH collect(tag) as tags, article
      FOREACH(tag IN tags | MERGE (article)<-[:APPLIED_TO]-(tag))

      // Return the article
      RETURN properties(article) AS article
      `

    const params = {
      article_id,
      article: articleProperties,
      author_id: current_user_id,
      tag_ids,
    }

    const { records } = await session.run(query, params)

    if (!records.length)
      throw createHttpError(404, `Article ${article_id} not found`)

    console.log(`Article ${article_id} updated`)

    removeArticlesFromCache()
    removeArticleFromCache(article_id)

    res.send(records[0].get("article"))
  } catch (error) {
    next(error)
  } finally {
    session.close()
  }
}

export const delete_article = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = driver.session()

  try {
    const current_user_id = get_current_user_id(res)
    if (!current_user_id) throw createHttpError(403, `Unauthorized`)

    const article_id = req.params.article_id
    if (!article_id) throw createHttpError(400, `Missing article ID`)

    const query = `
      MATCH (article:Article)-[:WRITTEN_BY]->(author:User)
      WHERE article._id = $article_id
        AND author._id = $author_id

      // Deal with comments
      WITH article
      OPTIONAL MATCH (comment:Comment)-[:ABOUT]->(article)
      DETACH DELETE comment

      // Delete article itself
      DETACH DELETE article
      RETURN $article_id as article_id
      `

    const params = {
      author_id: current_user_id,
      article_id,
    }

    const { records } = await session.run(query, params)

    if (!records.length) throw createHttpError(500, `Article deletion failed`)
    console.log(`Article ${article_id} deleted`)

    removeArticlesFromCache()
    removeArticleFromCache(article_id)

    res.send({ article_id })
  } catch (error) {
    next(error)
  } finally {
    session.close()
  }
}
