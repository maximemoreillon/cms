const {driver} = require('../../db.js')
const return_user_id = require('../../identification.js')

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
    RETURN tag
    `, {
    tag_id,
  })
  .then(result => { res.send(result.records[0].get('tag')) })
  .catch(error => {
    console.log(error)
    res.status(500).send(`Error getting tag: ${error}`)
  })
  .finally(() => { session.close() })
}

exports.create_tag = (req, res) => {
  // Route to create a single tag

  const tag_name = req.body.tag_name

  var session = driver.session()
  session
  .run(`
    MERGE (tag:Tag {name:$tag_name})
    ON CREATE SET tag._id = randomUUID()
    RETURN tag
    `, {
    tag_name,
  })
  .then(({records}) => {
    if(!records.length) throw 'Tag creation failed'
    console.log(`Tag ${tag_name} created`)
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

  let tag_id = get_tag_id(req)

  if(!res.locals.user.properties.isAdmin) return res.status(403).send('Only an administrator can perform this operation')

  var session = driver.session()
  session
  .run(`
    MATCH (tag:Tag)
    WHERE tag._id = $tag_id
    SET tag += $properties
    RETURN tag
    `, {
      tag_id,
      properties: req.body.properties,
  })
  .then(result => {
    console.log(`Tag ${tag_id} updated`)
    res.send(result.records)
  })
  .catch(error => {
    console.log(error)
    res.status(500).send(`Error updating tag: ${error}`)
  })
  .finally(() => { session.close() })
}

exports.delete_tag = (req, res) => {
  // Route to delete a single tag

  if(!res.locals.user.properties.isAdmin) return res.status(403).send('Only an administrator can perform this operation')

  let tag_id = get_tag_id(req)

  var session = driver.session()
  session
  .run(`
    MATCH (tag:Tag)
    WHERE tag._id = $tag_id
    DETACH DELETE tag
    `, {
    tag_id,
  })
  .then(result => {
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
    RETURN tag
    `)
  .then( ({records}) => {
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
