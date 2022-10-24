const {driver} = require('../../db.js')
const { get_current_user_id } = require('../../utils.js')
const createHttpError = require('http-errors')

const {
  current_user_is_admin
} = require('../../utils.js')

function get_tag_id(req) {
  return req.params.tag_id
    ?? req.query.tad_id
    ?? req.query.id

}



exports.create_tag = (req, res, next) => {
  // Route to create a single tag

  const {name} = req.body

  if(!name) throw createHttpError(400, `Missing name `)

  var session = driver.session()

  const query = `
    MERGE (tag:Tag {name:$name})
    ON CREATE SET tag._id = randomUUID()
    RETURN properties(tag) as tag
    `

  const params = {name}
  session
  .run(query,params)
  .then(({records}) => {

    if(!records.length) throw createHttpError(500, `Tag creation failed`)
    console.log(`Tag ${name} created`)
    const tag = records[0].get('tag')
    res.send(tag)

  })
  .catch(next)
  .finally(() => { session.close() })
}

exports.get_tag_list = (req, res, next) => {
  // Route to get all tags

  const {
    pinned
  } = req.query

  const pinned_query = pinned ? `WHERE tag.navigation_item = true` : ``

  const query = `
    MATCH (tag:Tag)
    ${pinned_query}

    WITH tag
    OPTIONAL MATCH (tag)-[:APPLIED_TO]->(article:Article)
    WITH PROPERTIES(tag) as tag, size(collect(article)) as article_count
    RETURN tag, article_count
    `
  

  const session = driver.session()
  session.run(query)
    .then(({ records }) => {

      const tags = records.map(r => ({ ...r.get('tag'), article_count: r.get('article_count') }))
      res.send(tags)

    })
    .catch(next)
    .finally(() => { session.close() })
}

exports.get_tag = (req, res, next) => {
  // Route to get a single tag using its ID

  const tag_id = get_tag_id(req)

  const session = driver.session()
  session
    .run(`
    MATCH (tag:Tag)
    WHERE tag._id = $tag_id
    RETURN properties(tag) as tag
    `, {
      tag_id,
    })
    .then(({ records }) => {
      if (!records.length) throw createHttpError(404, `Tag ${tag_id} not found`)
      const tag = records[0].get('tag')
      console.log(`Tag ${tag_id} queried`)
      res.send(tag)
    })
    .catch(next)
    .finally(() => { session.close() })
}

exports.update_tag = (req, res, next) => {
  // Route to update a single tag using

  const tag_id = get_tag_id(req)
  const properties = req.body

  // TODO: Use JOY to contrain properties

  if(!current_user_is_admin(res)) throw createHttpError(403, `This action is restricted to administrators`)

  const session = driver.session()

  const query = `
    MATCH (tag:Tag)
    WHERE tag._id = $tag_id
    SET tag += $properties
    RETURN properties(tag) as tag
    `

  const params = { tag_id, properties }

  session.run(query,params)
  .then( ({records}) => {
    if(!records.length) throw createHttpError(500, `Tag update failed`)
    const tag = records[0].get('tag')
    console.log(`Tag ${tag_id} updated`)
    res.send(tag)
  })
  .catch(next)
  .finally(() => { session.close() })
}

exports.delete_tag = (req, res, next) => {
  // Route to delete a single tag

  if(!current_user_is_admin(res)) throw createHttpError(403, `This action is restricted to administrators`)

  let tag_id = get_tag_id(req)

  var session = driver.session()
  session
  .run(`
    MATCH (tag:Tag)
    WHERE tag._id = $tag_id
    DETACH DELETE tag
    RETURN $tag_id as tag_id
    `, {
    tag_id,
  })
  .then( ({records}) => {
    if(!records.length) throw createHttpError(500, `Tag deletion failed`)
    console.log(`Tag ${tag_id} deleted`)
    res.send("Tag deleted successfully")
   })
  .catch(next)
  .finally(() => { session.close() })
}




// exports.get_article_tags = (req, res, next) => {
//   // Route to get tags of a given article
//
//   const article_id = req.query.id
//     ?? req.params.article_id
//
//   var session = driver.session()
//   session
//   .run(`
//     MATCH (tag:Tag)-[:APPLIED_TO]->(article:Article)
//     WHERE article._id = $article_id
//
//     // NOT SURE IF FILTERING WORKS
//     WITH tag, article
//     MATCH (article)-[:WRITTEN_BY]->(author:User)
//     WHERE article.published = true
//     ${res.locals.user ? 'OR author._id = $current_user_id' : ''}
//
//     RETURN tag
//     `, {
//       current_user_id: get_current_user_id(res),
//       article_id
//     })
//   .then(result => { res.send(result.records) })
//   .catch(next)
//   .finally(() => { session.close() })
// }
