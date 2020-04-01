// NPM modules
const path = require('path')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const MongoDB = require('mongodb')
const history = require('connect-history-api-fallback')
const authentication_middleware = require('@moreillon/authentication_middleware');

const neo4j = require('neo4j-driver');
const axios = require('axios')

// Local modules
const secrets = require('./secrets');

const identification_middleware = require('./identification_middleware');


// Parameters
const port = 8050

authentication_middleware.authentication_api_url = secrets.authentication_api_url
identification_middleware.authentication_api_url = secrets.authentication_api_url

// MongoDB related
const MongoClient = MongoDB.MongoClient;
const ObjectID = MongoDB.ObjectID;

const DB_config = {
  URL: secrets.mongodb_url,
  DB_name: 'cms',
  options: { useUnifiedTopology: true },
}


const driver = neo4j.driver(
  secrets.neo4j.url,
  neo4j.auth.basic(secrets.neo4j.username, secrets.neo4j.password)
)

// Express related
const app = express()
app.use(history())
app.use(bodyParser.json({limit: '50mb', extended: true}))
app.use(express.static(path.join(__dirname, 'dist')))
app.use(cors())





function get_user_from_jwt(req) {

  return new Promise( (resolve, reject) => {
    if(!('authorization' in req.headers)) return reject(`No token in authorization header`)

    let token = req.headers.authorization.split(" ")[1];
    if(!token) return reject(`No token in authorization header`)

    axios.post(secrets.authentication_api_url, { jwt: token })
    .then(response => { resolve(response.data) })
    .catch(error => { reject(error) })

  })
}





app.post('/get_articles', identification_middleware.middleware, (req, res) => {



    // Route to get multiple articles
    var session = driver.session()
    session
    .run(`
      // Get all articles
      MATCH (article:Article)

      // Show only published articles to unauthenticated users
      // TODO: SHOW PUBLISHED BY USER INSTEAD OF ALL PUBLISHED
      ${res.locals.user ? '' : 'WHERE article.published = true'}

      // Using search bar to find matching titles
      ${req.body.search ? 'WITH article WHERE toLower(article.title) CONTAINS toLower({search})' : ''}

      // Filter by tags if provided
      ${req.body.tag_id ? 'WITH article MATCH (tag:Tag)-[:APPLIED_TO]->(article) WHERE id(tag) = toInt({tag_id})' : ''}

      // Sorting and ordering
      // THIS IS A MESS BECAUSE NEO4J DOES NOT PARSE PARAMETERS PROPERLY HERE
      WITH article
      ORDER BY ${req.body.sort ? (req.body.sort === 'article.title' ? 'article.title' : 'article.edition_date') : 'article.edition_date'}
      ${req.body.order ? (req.body.order === 'ASC' ? 'ASC' : 'DESC') : 'DESC'}

      // Return only articles within set indices
      WITH collect(article)[${req.body.start_index ? '{start_index}' : '0' }..${req.body.start_index ? '{start_index}' : '0' }+${req.body.batch_size ? '{batch_size}' : '10' }] as articles
      UNWIND articles AS article

      // Return only articles, tags are sent with a different call
      RETURN article
      `, {
        tag_id: req.body.tag_id,
        start_index: req.body.start_index,
        search: req.body.search,
        sorting: req.body.sort,
        order: req.body.order,
        batch_size: req.body.batch_size,
      })
    .then(result => { res.send(result.records) })
    .catch(error => { res.status(500).send(`Error getting articles: ${error}`) })
    .finally(() => { session.close() })


})

app.post('/get_article_count', identification_middleware.middleware, (req, res) => {
  // Route to get multiple articles


    var session = driver.session()
    session
    .run(`
      // Get all articles
      MATCH (article:Article)

      // Show only published articles to unauthenticated users
      ${res.locals.user ? '' : 'WHERE article.published = true'}

      // Using search bar to find matching titles
      ${req.body.search ? 'WITH article WHERE toLower(article.title) CONTAINS toLower({search})' : ''}

      // Filter by tags if provided
      ${req.body.tag_id ? 'WITH article MATCH (tag:Tag)-[:APPLIED_TO]->(article) WHERE id(tag) = toInt({tag_id})' : ''}

      // Return only articles, tags are sent with a different call
      RETURN count(article)
      `, {
        tag_id: req.body.tag_id,
        start_index: req.body.start_index,
        search: req.body.search,
        batch_size: req.body.batch_size,
      })
    .then(result => { res.send(result.records) })
    .catch(error => { res.status(500).send(`Error getting articles: ${error}`) })
    .finally(() => { session.close() })


})

app.post('/get_article', identification_middleware.middleware, (req, res) => {
  // Route to get a single article

    var session = driver.session()
    session
    .run(`
      MATCH (article:Article)
      WHERE id(article) = toInt({article_id})

      WITH article
      ${res.locals.user ? '' : 'WHERE article.published = true'}

      RETURN article
      `, {
      article_id: req.body.article_id
    })
    .then(result => { res.send(result.records) })
    .catch(error => { res.status(500).send(`Error getting article: ${error}`) })
    .finally(() => { session.close() })

})

app.post('/get_tags_of_article', identification_middleware.middleware,  (req, res) => {
  // Route to get tags of a given article

    var session = driver.session()
    session
    .run(`
      MATCH (tag:Tag)-[:APPLIED_TO]->(article:Article)
      WHERE id(article) = toInt({article_id})

      // NOT SURE IF FILTERING WORKS
      WITH tag, article
      ${res.locals.user ? '' : 'WHERE article.published = true'}


      RETURN tag
      `, {
        article_id: req.body.article_id
      })
    .then(result => { res.send(result.records) })
    .catch(error => { res.status(500).send(`Error getting tags: ${error}`) })
    .finally(() => { session.close() })
})

app.post('/get_author_of_article', identification_middleware.middleware, (req, res) => {
  // Route to get author of a given article


    var session = driver.session()
    session
    .run(`
      MATCH (author:User)<-[:WRITTEN_BY]-(article:Article)
      WHERE id(article) = toInt({article_id})

      // NOT SURE IF FILTERING WORKS
      WITH author, article
      ${res.locals.user ? '' : 'WHERE article.published = true'}

      RETURN author
      `, {
        article_id: req.body.article_id
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
      MATCH (author:User {username: {author_username}})
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
      author_username: res.locals.user.properties.username,
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
    MATCH (article:Article)-[:WRITTEN_BY]->(:User {username: {author_username}})
    WHERE id(article) = toInt({article}.identity.low)

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
    author_username: res.locals.user.properties.username,
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
    MATCH (article:Article)-[:WRITTEN_BY]->(:User {username: {author_username}})
    WHERE id(article) = toInt({article_id})
    WITH article
    OPTIONAL MATCH (comment:Comment)-[:ABOUT]->(article)
    DETACH DELETE comment
    DETACH DELETE article
    RETURN 'success'
    `, {
    article_id: req.body.article_id,
    author_username: res.locals.user.properties.username,
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


app.post('/get_tag', (req, res) => {
  // Route to get a single tag using its ID
  var session = driver.session()
  session
  .run(`
    MATCH (tag:Tag)
    WHERE id(tag) = toInt({tag_id})
    RETURN tag
    `, {
    tag_id: req.body.tag_id,
  })
  .then(result => { res.send(result.records) })
  .catch(error => { res.status(500).send(`Error getting tag: ${error}`) })
  .finally(() => { session.close() })
})

app.post('/get_tag_list', (req, res) => {
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
  // Todo: check if tag attached to article of user only

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
    MATCH (comment:Comment)-[:ABOUT]->(:Article)-[:WRITTEN_BY]->(author:User {username :{author_username}})
    WHERE id(comment) = toInt({comment_id})
    DETACH DELETE comment
    RETURN 'success'
    `, {
    comment_id: req.body.comment_id,
    author_username: user.properties.username,
  })
  .then(result => {
    if(result.records.length === 0 ) return res.status(400).send(`Comment could not be deleted, probably due to insufficient permissions`)
    res.send("Comment deleted successfully")
  })
  .catch(error => { res.status(500).send(`Error deleting tag: ${error}`) })
  .finally(() => { session.close() })
})

app.post('/get_comments_of_article', identification_middleware.middleware, (req, res) => {
  // Route to get comments of a given article


    var session = driver.session()
    session
    .run(`
      MATCH (comment:Comment)-[:ABOUT]->(article:Article)
      WHERE id(article) = toInt({article_id})

      WITH comment, article
      ${res.locals.user ? '' : 'WHERE article.published = true'}

      RETURN comment
      `, {
        article_id: req.body.article_id
      })
    .then(result => { res.send(result.records) })
    .catch(error => { res.status(500).send(`Error getting comments: ${error}`) })
    .finally(() => { session.close() })

})



app.post('/get_navigation_items', (req, res) => {
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
