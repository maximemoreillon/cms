const {driver} = require('../../db.js')
const createHttpError = require('http-errors')
const { current_user_is_admin } = require('../../utils.js')

const get_tag_id = ({query, params}) => params.tag_id || query.tad_id || query.id



exports.create_tag = async (req, res, next) => {
  // Route to create a single tag
  const session = driver.session()

  try {
    const { name } = req.body

    if(!name) throw createHttpError(400, `Missing name `)

    const query = `
      MERGE (tag:Tag {name:$name})
      ON CREATE SET tag._id = randomUUID()
      RETURN properties(tag) as tag
      `

    const {records} = await session.run(query,{name})

    if(!records.length) throw createHttpError(500, `Tag creation failed`)
    console.log(`Tag ${name} created`)
    const tag = records[0].get('tag')
    res.send(tag)

  } catch (error) {
    next(error)
  } finally {
    session.close()
  }

}

exports.read_tags = async (req, res, next) => {

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
    
    const {records} = await session.run(query)

    const tags = records.map(r => ({ ...r.get('tag'), article_count: r.get('article_count') }))
    res.send(tags)


  } catch (error) {
    next(error)
  } finally {
    session.close()
  }

}

exports.read_tag = async (req, res, next) => {
  // Route to get a single tag using its ID

  const session = driver.session()

  try {

    const tag_id = get_tag_id(req)
    const query = `
      MATCH (tag:Tag)
      WHERE tag._id = $tag_id
      RETURN properties(tag) as tag
      `
    
    const {records} = await session.run(query, { tag_id })

    if (!records.length) throw createHttpError(404, `Tag ${tag_id} not found`)
    const tag = records[0].get('tag')
    console.log(`Tag ${tag_id} queried`)
    res.send(tag)

  } catch (error) {
    next(error)
  } finally {
    session.close()
  }

}

exports.update_tag = async (req, res, next) => {

  const session = driver.session()

  try {
    const tag_id = get_tag_id(req)
    const properties = req.body

    // TODO: Use JOY to constrain properties
    if(!current_user_is_admin(res)) throw createHttpError(403, `This action is restricted to administrators`)


    const query = `
      MATCH (tag:Tag)
      WHERE tag._id = $tag_id
      SET tag += $properties
      RETURN properties(tag) as tag
      `

    const params = { tag_id, properties }
    
    const {records} = await session.run(query,params)

    if(!records.length) throw createHttpError(500, `Tag update failed`)
    const tag = records[0].get('tag')
    console.log(`Tag ${tag_id} updated`)
    res.send(tag)

  } catch (error) {
    next(error)
  } finally {
    session.close()
  }

}

exports.delete_tag = async (req, res, next) => {

  const session = driver.session()

  try {
    if(!current_user_is_admin(res)) throw createHttpError(403, `This action is restricted to administrators`)

    const tag_id = get_tag_id(req)


    const query = `
      MATCH (tag:Tag)
      WHERE tag._id = $tag_id
      DETACH DELETE tag
      RETURN $tag_id as tag_id
      `

    const {records} = await session.run(query, { tag_id })

    if(!records.length) throw createHttpError(500, `Tag deletion failed`)
    console.log(`Tag ${tag_id} deleted`)
    res.send("Tag deleted successfully")

  } catch (error) {
    next(error)
  } finally {
    session.close()
  }

}
