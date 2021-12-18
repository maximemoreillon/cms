const {driver} = require('../../db.js')
const return_user_id = require('../../identification.js')

const {
  current_user_is_admin
} = require('../../utils.js')

function get_tag_id(req) {
  return req.params.tag_id
    ?? req.query.tad_id
    ?? req.query.id

}

exports.get_tag = (req, res) => {
  // Route to get a single tag using its ID

  const tag_id = get_tag_id(req)

  var session = driver.session()
  session
  .run(`
    MATCH (tag:Tag)
    WHERE tag._id = $tag_id
    RETURN properties(tag) as tag
    `, {
    tag_id,
  })
  .then( ({records}) => {
    if(!records.length) throw `Tag ${tag_id} not found`
    const tag = records[0].get('tag')
    console.log(`Tag ${tag_id} queried`)
    res.send(tag)
   })
  .catch(error => {
    console.log(error)
    res.status(500).send(`Error getting tag: ${error}`)
  })
  .finally(() => { session.close() })
}

exports.create_tag = (req, res) => {
  // Route to create a single tag

  const {name} = req.body

  if(!name) return res.status(400).send(`name not defined`)

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

    if(!records.length) throw 'Tag creation failed'
    console.log(`Tag ${name} merged`)
    const tag = records[0].get('tag')
    res.send(tag)

  })
  .catch(error => {
    console.log(error)
    res.status(500).send(`Error creating tag: ${error}`)
   })
  .finally(() => { session.close() })
}

exports.update_tag = (req, res) => {
  // Route to update a single tag using

  const tag_id = get_tag_id(req)
  const properties = req.body

  // TODO: Use JOY to contrain properties

  if(!current_user_is_admin(res)) return res.status(403).send('Only an administrator can perform this operation')

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
    if(!records.length) throw `Update of tag ${tag_id} failed`
    const tag = records[0].get('tag')
    console.log(`Tag ${tag_id} updated`)
    res.send(tag)
  })
  .catch(error => {
    console.log(error)
    res.status(500).send(`Error updating tag: ${error}`)
  })
  .finally(() => { session.close() })
}

exports.delete_tag = (req, res) => {
  // Route to delete a single tag

  if(!current_user_is_admin(res)) return res.status(403).send('Only an administrator can perform this operation')

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
    if(!records.length) throw `Deletion of tag ${tag_id} failed`
    console.log(`Tag ${tag_id} deleted`)
    res.send("Tag deleted successfully")
   })
  .catch(error => {
    console.error(error)
    res.status(500).send(`Error deleting tag: ${error}`)
  })
  .finally(() => { session.close() })
}

exports.get_tag_list = (req, res) => {
  // Route to get all tags

  var session = driver.session()
  session
  .run(`
    MATCH (tag:Tag)
    RETURN properties(tag) as tag
    `)
  .then( ({records}) => {

    console.log(`Tag list queried`)
    res.send(records.map(record => record.get('tag')))

  })
  .catch(error => {
    console.log(error)
    res.status(500).send(`Error getting tag list: ${error}`)
   })
  .finally(() => { session.close() })
}

exports.get_pinned_tags = (req, res) => {
  // Route to get navbar items

  // TODO: Combine with above


  var session = driver.session()
  session
  .run(`
    MATCH (tag:Tag {navigation_item: true})
    RETURN tag
    `)
  .then(result => { res.send(result.records) })
  .catch(error => {
    console.log(error)
    res.status(500).send(`Error getting navigation items: ${error}`)
  })
  .finally(() => { session.close() })
}

exports.get_article_tags = (req, res) => {
  // Route to get tags of a given article

  // Is this actuall yused?

  const article_id = req.query.id
    ?? req.params.article_id

  var session = driver.session()
  session
  .run(`
    MATCH (tag:Tag)-[:APPLIED_TO]->(article:Article)
    WHERE article._id = $article_id

    // NOT SURE IF FILTERING WORKS
    WITH tag, article
    MATCH (article)-[:WRITTEN_BY]->(author:User)
    WHERE article.published = true
    ${res.locals.user ? 'OR author._id = $current_user_id' : ''}

    RETURN tag
    `, {
      current_user_id: return_user_id(res),
      article_id
    })
  .then(result => { res.send(result.records) })
  .catch(error => {
    console.log(error)
    res.status(500).send(`Error getting tags: ${error}`)
  })
  .finally(() => { session.close() })
}
