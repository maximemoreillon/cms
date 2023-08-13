import { driver } from "../../db"
import createHttpError from "http-errors"
import { current_user_is_admin } from "../../utils"
import { Request, Response, NextFunction } from "express"

const get_tag_id = ({ query, params }: any) =>
  params.tag_id || query.tad_id || query.id

export const create_tag = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = driver.session()

  try {
    const { name } = req.body

    if (!name) throw createHttpError(400, `Missing name `)

    const query = `
      MERGE (tag:Tag {name:$name})
      ON CREATE SET tag._id = randomUUID()
      RETURN properties(tag) as tag`

    const { records } = await session.run(query, { name })

    if (!records.length) throw createHttpError(500, `Tag creation failed`)
    console.log(`Tag ${name} created`)
    const tag = records[0].get("tag")
    res.send(tag)
  } catch (error) {
    next(error)
  } finally {
    session.close()
  }
}

export const read_tags = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = driver.session()

  try {
    const { pinned } = req.query

    const pinned_query = pinned ? `WHERE tag.navigation_item = true` : ``

    // TODO: Pagination
    const query = `
      MATCH (tag:Tag)
      ${pinned_query}

      WITH tag
      OPTIONAL MATCH (tag)-[:APPLIED_TO]->(article:Article)
      RETURN 
        PROPERTIES(tag) as tag,
        SIZE(COLLECT(article)) as article_count
      `

    const { records } = await session.run(query)

    const tags = records.map((r) => ({
      ...r.get("tag"),
      article_count: r.get("article_count"),
    }))
    res.send(tags)
  } catch (error) {
    next(error)
  } finally {
    session.close()
  }
}

export const read_tag = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = driver.session()

  try {
    const tag_id = get_tag_id(req)
    const query = `
      MATCH (tag:Tag)
      WHERE tag._id = $tag_id
      RETURN properties(tag) as tag
      `

    const { records } = await session.run(query, { tag_id })

    if (!records.length) throw createHttpError(404, `Tag ${tag_id} not found`)
    const tag = records[0].get("tag")
    res.send(tag)
  } catch (error) {
    next(error)
  } finally {
    session.close()
  }
}

export const update_tag = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = driver.session()

  try {
    const tag_id = get_tag_id(req)
    const userIsAdmin = current_user_is_admin(res)
    const { name, navigation_item } = req.body

    if (!tag_id) throw createHttpError(400, `Missing tag ID`)
    if (!userIsAdmin) throw createHttpError(403, `Unauthorized`)

    const query = `
      MATCH (tag:Tag)
      WHERE tag._id = $tag_id
      SET tag += $properties
      RETURN properties(tag) as tag`

    const params = { tag_id, properties: { name, navigation_item } }

    const { records } = await session.run(query, params)

    if (!records.length) throw createHttpError(500, `Tag update failed`)
    const tag = records[0].get("tag")
    console.log(`Tag ${tag_id} (${tag.name}) updated`)
    res.send(tag)
  } catch (error) {
    next(error)
  } finally {
    session.close()
  }
}

export const delete_tag = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = driver.session()

  try {
    if (!current_user_is_admin(res))
      throw createHttpError(403, `This action is restricted to administrators`)

    const tag_id = get_tag_id(req)

    const query = `
      MATCH (tag:Tag)
      WHERE tag._id = $tag_id
      DETACH DELETE tag
      RETURN $tag_id as tag_id
      `

    const { records } = await session.run(query, { tag_id })

    if (!records.length) throw createHttpError(500, `Tag deletion failed`)
    console.log(`Tag "${tag_id}" deleted`)
    res.send("Tag deleted successfully")
  } catch (error) {
    next(error)
  } finally {
    session.close()
  }
}
