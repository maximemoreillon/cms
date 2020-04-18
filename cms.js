// NPM modules
const path = require('path')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const neo4j = require('neo4j-driver');
const axios = require('axios')
const dotenv = require('dotenv');


const authentication_middleware = require('@moreillon/authentication_middleware');
const identification_middleware = require('./identification_middleware');

dotenv.config();

// Parameters
var port = 80
if(process.env.APP_PORT) port=process.env.APP_PORT

// Configuration of middlewares
authentication_middleware.authentication_api_url = `${process.env.AUTHENTIATION_API_URL}/decode_jwt`
identification_middleware.authentication_api_url = `${process.env.AUTHENTIATION_API_URL}/decode_jwt`

const driver = neo4j.driver(
  process.env.NEO4J_URL,
  neo4j.auth.basic(
    process.env.NEO4J_USERNAME,
    process.env.NEO4J_PASSWORD
  )
)

// Express configuration
const app = express()
app.use(bodyParser.json({limit: '50mb', extended: true}))
app.use(cors())

function return_user_id(res) {
  if(res.locals.user) return res.locals.user.identity.low
  else return undefined
}

app.get('/', (req, res) => {
  res.send(`CMS API, Maxime MOREILLON`)
})

app.get('/auth', (req, res) => {
  axios.get(`${process.env.AUTHENTIATION_API_URL}`)
  .then(response => { res.send(response.data) })
  .catch(error => { res.send(error) })
})

app.get('/articles', identification_middleware.middleware, (req, res) => {

    // Route to get multiple articles

    var session = driver.session()
    session
    .run(`
      // Get all articles
      MATCH (article:Article)-[:WRITTEN_BY]->(author:User)

      // Show only published articles or articles written by user
      WHERE article.published = true  ${res.locals.user ? 'OR id(author)=toInt({current_user_id})' : ''}

      // Using search bar to find matching titles
      ${req.query.search ? 'WITH article WHERE toLower(article.title) CONTAINS toLower({search})' : ''}

      // Filter by tag if provided
      ${req.query.tag_id ? 'WITH article MATCH (tag:Tag)-[:APPLIED_TO]->(article) WHERE id(tag) = toInt({tag_id})' : ''}

      // Filter by user if provided
      ${req.query.author_id ? 'WITH article MATCH (author:User)<-[WRITTEN_BY]-(article) WHERE id(author) = toInt({author_id})' : ''}

      // Sorting and ordering
      // THIS IS A MESS BECAUSE NEO4J DOES NOT PARSE PARAMETERS PROPERLY HERE
      WITH article
      ORDER BY ${req.query.sort ? (req.query.sort === 'article.title' ? 'article.title' : 'article.edition_date') : 'article.edition_date'}
      ${req.query.order ? (req.query.order === 'ASC' ? 'ASC' : 'DESC') : 'DESC'}

      // Collect everything for count
      WITH count(article) as article_count, collect(article) as article_collection

      // Return only articles by batch
      WITH article_count,
      article_collection[${req.query.start_index ? 'toInt({start_index})' : '0' }..${req.query.start_index ? 'toInt({start_index})' : '0' }+${req.query.batch_size ? 'toInt({batch_size})' : '10' }]
      AS article_batch
      UNWIND article_batch AS article

      // Return only articles, tags are sent with a different call
      RETURN article, article_count
      `, {
        current_user_id: return_user_id(res),
        author_id: req.query.author_id,
        tag_id: req.query.tag_id,
        start_index: req.query.start_index,
        search: req.query.search,
        sorting: req.query.sort,
        order: req.query.order,
        batch_size: req.query.batch_size,
      })
    .then(result => { res.send(result.records) })
    .catch(error => {
      res.status(500).send(`Error getting articles: ${error}`)
    })
    .finally(() => { session.close() })


})


app.get('/article', identification_middleware.middleware, (req, res) => {
  // Route to get a single article using its ID

  var session = driver.session()
  session
  .run(`
    MATCH (article:Article)
    WHERE id(article) = toInt({article_id})

    // Show only published articles or articles written by user
    WITH article
    MATCH (article)-[:WRITTEN_BY]->(author:User)
    WHERE article.published = true  ${res.locals.user ? 'OR id(author)=toInt({current_user_id})' : ''}

    RETURN article
    `, {
    current_user_id: return_user_id(res),
    article_id: req.query.id
  })
  .then(result => { res.send(result.records) })
  .catch(error => { res.status(500).send(`Error getting article: ${error}`) })
  .finally(() => { session.close() })

})

app.get('/tags_of_article', identification_middleware.middleware,  (req, res) => {
  // Route to get tags of a given article

  var session = driver.session()
  session
  .run(`
    MATCH (tag:Tag)-[:APPLIED_TO]->(article:Article)
    WHERE id(article) = toInt({article_id})

    // NOT SURE IF FILTERING WORKS
    WITH tag, article
    MATCH (article)-[:WRITTEN_BY]->(author:User)
    WHERE article.published = true  ${res.locals.user ? 'OR id(author)=toInt({current_user_id})' : ''}

    RETURN tag
    `, {
      current_user_id: return_user_id(res),
      article_id: req.query.id
    })
  .then(result => { res.send(result.records) })
  .catch(error => { res.status(500).send(`Error getting tags: ${error}`) })
  .finally(() => { session.close() })
})

app.get('/author_of_article', identification_middleware.middleware, (req, res) => {
  // Route to get author of a given article


    var session = driver.session()
    session
    .run(`
      MATCH (author:User)<-[:WRITTEN_BY]-(article:Article)
      WHERE id(article) = toInt({article_id})

      // NOT SURE IF FILTERING WORKS
      WITH author, article
      WHERE article.published = true  ${res.locals.user ? 'OR id(author)=toInt({current_user_id})' : ''}

      RETURN author
      `, {
        current_user_id: return_user_id(res),
        article_id: req.query.id
      })
    .then(result => { res.send(result.records) })
    .catch(error => { res.status(500).send(`Error getting author: ${error}`) })
    .finally(() => { session.close() })

})

app.post('/create_article', authentication_middleware.middleware, (req, res) => {
  // Route to create an article
  // TODO: Check if there is a way to combine with update route using MERGE

    var session = driver.session()
    session
    .run(`
      // create the article node
      CREATE (article:Article)

      // Set properties
      SET article = {article}.properties

      // Add dates
      SET article.creation_date = date()
      SET article.edition_date = date()

      // Add relationship to author
      WITH article
      MATCH (author:User)
      WHERE id(author)=toInt({author_id})
      MERGE (article)-[:WRITTEN_BY]->(author)

      // Deal with tags EMPTY LISTS ARE A PAIN
      WITH article

      UNWIND
        CASE
          WHEN {tag_ids} = []
            THEN [null]
          ELSE {tag_ids}
        END AS tag_id

      OPTIONAL MATCH (tag:Tag)
      WHERE id(tag) = toInt(tag_id)
      WITH collect(tag) as tags, article
      FOREACH(tag IN tags | MERGE (article)<-[:APPLIED_TO]-(tag))

      // Return the article
      RETURN article

      `, {
      article: req.body.article,
      tag_ids: req.body.tag_ids,
      author_id: res.locals.user.identity.low,
    })
    .then(result => { res.send(result.records) })
    .catch(error => { res.status(500).send(`Error creating article: ${error}`) })
    .finally(() => { session.close() })




})

app.post('/update_article', authentication_middleware.middleware, (req, res) => {
  // Route to delete an article

  // Conversion of date back to Neo4J object
  // Neo4J is really bad for this
  req.body.article.properties.creation_date = new neo4j.types.Date(
    req.body.article.properties.creation_date.year.low,
    req.body.article.properties.creation_date.month.low,
    req.body.article.properties.creation_date.day.low
  )

  if('edition_date' in req.body.article.properties){
    req.body.article.properties.edition_date = new neo4j.types.Date(
      req.body.article.properties.edition_date.year.low,
      req.body.article.properties.edition_date.month.low,
      req.body.article.properties.edition_date.day.low
    )
  }

  var session = driver.session()
  session
  .run(`
    // Find the article node and update it
    MATCH (article:Article)-[:WRITTEN_BY]->(author:User)
    WHERE id(article) = toInt({article}.identity.low) AND id(author)=toInt({author_id})

    // Remove previously set properties
    REMOVE article.thumbnail_src
    REMOVE article.summary
    REMOVE article.title

    // Set the new properties
    SET article = {article}.properties

    // Set the date
    SET article.edition_date = date()

    // Delete all relationships to tags so as to recreate the necessary ones
    WITH article
    OPTIONAL MATCH (article)<-[r:APPLIED_TO]-(tag:Tag)
    DELETE r

    // Deal with tags EMPTY LISTS ARE A PAIN
    WITH article

    UNWIND
      CASE
        WHEN {tag_ids} = []
          THEN [null]
        ELSE {tag_ids}
      END AS tag_id

    OPTIONAL MATCH (tag:Tag)
    WHERE id(tag) = toInt(tag_id)
    WITH collect(tag) as tags, article
    FOREACH(tag IN tags | MERGE (article)<-[:APPLIED_TO]-(tag))

    // Return the article
    RETURN article
    `, {
    article: req.body.article,
    tag_ids: req.body.tag_ids,
    author_id: res.locals.user.identity.low,
  })
  .then(result => {
    if(result.records.length === 0 ) return res.status(400).send(`Article could not be updated, probably due to insufficient permissions`)
    res.send(result.records) })
  .catch(error => { res.status(500).send(`Error updating article: ${error}`) })
  .finally(() => { session.close() })




})


app.post('/delete_article', authentication_middleware.middleware, (req, res) => {
  // Route to delete an article

  var session = driver.session()
  session
  .run(`
    MATCH (article:Article)-[:WRITTEN_BY]->(author:User)
    WHERE id(article) = toInt({article_id}) AND id(author)=toInt({author_id})

    // Deal with comments
    WITH article
    OPTIONAL MATCH (comment:Comment)-[:ABOUT]->(article)
    DETACH DELETE comment

    // Delete article itself
    DETACH DELETE article
    RETURN 'success'
    `, {
    author_id: res.locals.user.identity.low,
    article_id: req.body.article_id,
  })
  .then(result => {

    if(result.records.length === 0 ) return res.status(400).send(`Article could not be deleted, probably due to insufficient permissions`)
    res.send("Article deleted successfully")

  })
  .catch(error => {
    res.status(500).send(`Error deleting article: ${error}`)
  })
  .finally(() => {
    session.close()
  })



})


app.get('/tag', (req, res) => {
  // Route to get a single tag using its ID
  var session = driver.session()
  session
  .run(`
    MATCH (tag:Tag)
    WHERE id(tag) = toInt({tag_id})
    RETURN tag
    `, {
    tag_id: req.query.tag_id,
  })
  .then(result => { res.send(result.records[0].get('tag')) })
  .catch(error => { res.status(500).send(`Error getting tag: ${error}`) })
  .finally(() => { session.close() })
})

app.get('/author', (req, res) => {
  // Route to get an author using his ID
  var session = driver.session()
  session
  .run(`
    MATCH (author:User)
    WHERE id(author) = toInt({author_id})
    RETURN author
    `, {
    author_id: req.query.author_id,
  })
  .then(result => { res.send(result.records[0].get('author')) })
  .catch(error => { res.status(500).send(`Error getting author: ${error}`) })
  .finally( () => { session.close() })
})


app.get('/tag_list', (req, res) => {
  // Route to get all tags

  var session = driver.session()
  session
  .run(`
    MATCH (tag:Tag)
    RETURN tag
    `, {})
  .then(result => { res.send(result.records) })
  .catch(error => { res.status(500).send(`Error getting tag list: ${error}`) })
  .finally(() => { session.close() })
})



app.post('/create_tag', authentication_middleware.middleware, (req, res) => {
  // Route to create a single tag

  var session = driver.session()
  session
  .run(`
    MERGE (tag:Tag {name:{tag_name}})
    RETURN tag
    `, {
    tag_name: req.body.tag_name,
  })
  .then(result => { res.send(result.records) })
  .catch(error => { res.status(500).send(`Error creating tag: ${error}`) })
  .finally(() => { session.close() })
})


app.post('/update_tag', authentication_middleware.middleware, (req, res) => {
  // Route to update a single tag using

  if(!res.locals.user.properties.isAdmin) return res.status(403).send('Only an administrator can perform this operation')

  var session = driver.session()
  session
  .run(`
    MATCH (tag:Tag)
    WHERE id(tag) = toInt({tag}.identity.low)
    SET tag = {tag}.properties
    RETURN tag
    `, {
    tag: req.body.tag,
  })
  .then(result => { res.send(result.records) })
  .catch(error => { res.status(500).send(`Error updating tag: ${error}`) })
  .finally(() => { session.close() })
})

app.post('/delete_tag', authentication_middleware.middleware, (req, res) => {
  // Route to delete a single tag

  if(!res.locals.user.properties.isAdmin) return res.status(403).send('Only an administrator can perform this operation')

  var session = driver.session()
  session
  .run(`
    MATCH (tag:Tag)
    WHERE id(tag) = toInt({tag_id})
    DETACH DELETE tag
    `, {
    tag_id: req.body.tag_id,
  })
  .then(result => { res.send("Tag deleted successfully") })
  .catch(error => { res.status(500).send(`Error deleting tag: ${error}`) })
  .finally(() => { session.close() })
})


app.post('/create_comment', (req, res) => {
  // Route to create a comment
  // TODO: Prevent commenting on unpublished articles
  var session = driver.session()
  session
  .run(`
    // Find article node
    MATCH (article:Article)
    WHERE id(article) = toInt({article_id})
    SET article.creation_date = date()

    // Create comment
    CREATE (comment:Comment)-[:ABOUT]->(article)
    SET comment = {comment}.properties
    SET comment.date = date()

    RETURN comment
    `, {
    article_id: req.body.article_id,
    comment: req.body.comment,
  })
  .then(result => { res.send(result.records) })
  .catch(error => { res.status(500).send(`Error creatin comment: ${error}`) })
  .finally(() => { session.close() })
})

app.post('/delete_comment', authentication_middleware.middleware, (req, res) => {
  // Route to delete a comment
  var session = driver.session()
  session
  .run(`
    // Find article node
    MATCH (comment:Comment)-[:ABOUT]->(:Article)-[:WRITTEN_BY]->(author:User)
    WHERE id(comment) = toInt({comment_id}) AND WHERE id(author)=toInt({author_id})
    DETACH DELETE comment
    RETURN 'success'
    `, {
    comment_id: req.body.comment_id,
    author_id: res.locals.user.identity.low,
  })
  .then(result => {
    if(result.records.length === 0 ) return res.status(400).send(`Comment could not be deleted, probably due to insufficient permissions`)
    res.send("Comment deleted successfully")
  })
  .catch(error => { res.status(500).send(`Error deleting tag: ${error}`) })
  .finally(() => { session.close() })
})

app.get('/comments_of_article', identification_middleware.middleware, (req, res) => {
  // Route to get comments of a given article
  var session = driver.session()
  session
  .run(`
    MATCH (comment:Comment)-[:ABOUT]->(article:Article)
    WHERE id(article) = toInt({article_id})

    WITH comment, article
    MATCH (article)-[:WRITTEN_BY]->(author:User)
    WHERE article.published = true  ${res.locals.user ? 'OR id(author)=toInt({current_user_id})' : ''}

    RETURN comment
    `, {
      current_user_id: return_user_id(res),
      article_id: req.query.id,
    })
  .then(result => { res.send(result.records) })
  .catch(error => { res.status(500).send(`Error getting comments: ${error}`) })
  .finally(() => { session.close() })

})



app.get('/navigation_items', (req, res) => {
  // Route to get navbar items
  var session = driver.session()
  session
  .run(`
    MATCH (tag:Tag {navigation_item: true})
    RETURN tag
    `, {})
  .then(result => { res.send(result.records) })
  .catch(error => { res.status(500).send(`Error getting navigation items: ${error}`) })
})







app.listen(port, () => console.log(`CMS listening on port ${port}`))
