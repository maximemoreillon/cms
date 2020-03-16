// NPM modules
const path = require('path')
const express = require('express')
const cors = require('cors')
const cookieSession = require('cookie-session')
const bodyParser = require('body-parser')
const MongoDB = require('mongodb')
const history = require('connect-history-api-fallback')
const jwt = require('jsonwebtoken')
const Cookies = require('cookies')
const authorization_middleware = require('@moreillon/authorization_middleware');
const neo4j = require('neo4j-driver');

// Local modules
const secrets = require('./secrets');

// Parameters
const port = 8050

authorization_middleware.secret = secrets.jwt_secret

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

function check_authentication(req){
  // Authorization using a JWT

  if(!req.headers.authorization) return false

  // parse the headers to get the token
  let token = req.headers.authorization.split(" ")[1];

  try {
    var decoded = jwt.verify(token, secrets.jwt_secret);
  }
  catch(err) {
    return false
  }

  if(decoded) return true
  else return false

}


app.post('/get_articles', (req, res) => {
  // Route to get multiple articles

  let sort = {
    by: undefined,
    order: undefined,
  }

  if(req.body.sort) sort = req.body.sort

  var session = driver.session()
  session
  .run(`
    // Get all articles
    MATCH (article:Article)

    // Show only published articles to unauthenticated users
    ${check_authentication(req) ? '' : 'WHERE article.published = true'}

    // Filter by tags if provided
    WITH article
    ${req.body.tag_id ? 'MATCH (tag:Tag)-[:APPLIED_TO]->(article) WHERE id(tag) = toInt({tag_id})' : ''}

    // Return only articles within set indices
    // DIRT, IMPROVE!
    WITH collect(article)${req.body.start_index ? '[{start_index}..{start_index}+10]' : '[0..10]'} as articles
    UNWIND articles AS article

    // Return only articles, tags are sent with a different call
    RETURN article

    // Sorting and ordering
    ORDER BY ${sort.by ? sort.by : 'article.edition_date'} ${sort.order ? sort.order : 'DESC'}
    `, {
      tag_id: req.body.tag_id,
      start_index: req.body.start_index,
    })
  .then(result => {
    res.send(result.records)
    session.close()
  })
  .catch(error => {
    res.status(500).send(`Error getting articles: ${error}`)
  })
})

app.post('/get_article', (req, res) => {
  // Route to get a single article
  var session = driver.session()
  session
  .run(`
    MATCH (article:Article)
    WHERE id(article) = toInt({article_id})
    RETURN article
    `, {
    article_id: req.body.article_id
  })
  .then(result => {
    res.send(result.records)
    session.close()
  })
  .catch(error => {
    res.status(500).send(`Error getting article: ${error}`)
  })
})

app.post('/get_tags_of_article', (req, res) => {
  // Route to get tags of a given article
  var session = driver.session()
  session
  .run(`
    MATCH (tag:Tag)-[:APPLIED_TO]->(article:Article)
    WHERE id(article) = toInt({article_id})
    RETURN tag
    `, {
      article_id: req.body.article_id
    })
  .then(result => {
    res.send(result.records)
    session.close()
  })
  .catch(error => {
    res.status(500).send(`Error getting tags: ${error}`)
  })
})

app.post('/get_author_of_article', (req, res) => {
  // Route to get author of a given article
  var session = driver.session()
  session
  .run(`
    MATCH (author:User)<-[:WRITTEN_BY]-(article:Article)
    WHERE id(article) = toInt({article_id})
    RETURN author
    `, {
      article_id: req.body.article_id
    })
  .then(result => {
    res.send(result.records)
    session.close()
  })
  .catch(error => {
    res.status(500).send(`Error getting author: ${error}`)
  })
})

app.post('/create_article', authorization_middleware.middleware, (req, res) => {
  // Route to create an article
  // TODO: Check if there is a way to combine with update route using MERGE
  var session = driver.session()
  session
  .run(`
    // create the article node
    CREATE (article:Article)

    // Remove previously set properties
    REMOVE article.thumbnail_src
    REMOVE article.summary
    REMOVE article.title

    // Set new properties
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
    // Not very elegant...
    author_username: jwt.verify(req.headers.authorization.split(" ")[1], secrets.jwt_secret).username,
  })
  .then(result => {
    res.send(result.records)
    session.close()
  })
  .catch(error => {
    res.status(500).send(`Error creating article: ${error}`)
  })

})

app.post('/update_article', authorization_middleware.middleware, (req, res) => {
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
    // Not very elegant...
    author_username: jwt.verify(req.headers.authorization.split(" ")[1], secrets.jwt_secret).username,
  })
  .then(result => {
    session.close()
    if(result.records.length === 0 ) return res.status(400).send(`Article could not be updated, probably due to insufficient permissions`)
    res.send(result.records)

  })
  .catch(error => {
    res.status(500).send(`Error updating article: ${error}`)
  })
})


app.post('/delete_article', authorization_middleware.middleware, (req, res) => {
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
    // Not very elegant...
    author_username: jwt.verify(req.headers.authorization.split(" ")[1], secrets.jwt_secret).username,
  })
  .then(result => {
    session.close()
    if(result.records.length === 0 ) return res.status(400).send(`Article could not be deleted, probably due to insufficient permissions`)
    res.send("Article deleted successfully")

  })
  .catch(error => {
    res.status(500).send(`Error deleting article: ${error}`)
  })

})


app.post('/get_tag', (req, res) => {
  // Route to get a single tag using its ID
  // CANNOT HAVE THE WHOLE TAG IN THE BODY
  var session = driver.session()
  session
  .run(`
    MATCH (tag:Tag)
    WHERE id(tag) = toInt({tag_id})
    RETURN tag
    `, {
    tag_id: req.body.tag_id,
  })
  .then(result => {
    res.send(result.records)
    session.close()
  })
  .catch(error => {
    res.status(500).send(`Error getting tag: ${error}`)
  })
})

app.post('/get_tag_list', (req, res) => {
  // Route to get all tags
  // NOT USED
  var session = driver.session()
  session
  .run(`
    MATCH (tag:Tag)
    RETURN tag
    `, {})
  .then(result => {
    res.send(result.records)
    session.close()
  })
  .catch(error => {
    res.status(500).send(`Error getting tag list: ${error}`)
  })
})

app.post('/create_tag', authorization_middleware.middleware, (req, res) => {
  // Route to create a single tag
  var session = driver.session()
  session
  .run(`
    MERGE (tag:Tag {name:{tag_name}})
    RETURN tag
    `, {
    tag_name: req.body.tag_name,
  })
  .then(result => {
    res.send(result.records)
    session.close()
  })
  .catch(error => {
    res.status(500).send(`Error creating tag: ${error}`)
  })
})

app.post('/update_tag', authorization_middleware.middleware, (req, res) => {
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
  .then(result => {
    res.send(result.records)
    session.close()
  })
  .catch(error => {
    res.status(500).send(`Error updating tag: ${error}`)
  })
})

app.post('/delete_tag', authorization_middleware.middleware, (req, res) => {
  // Route to delete a single tag
  var session = driver.session()
  session
  .run(`
    MATCH (tag:Tag)
    WHERE id(tag) = toInt({tag_id})
    DETACH DELETE tag
    `, {
    tag_id: req.body.tag_id,
  })
  .then(result => {
    res.send("Tag deleted successfully")
    session.close()
  })
  .catch(error => {
    res.status(500).send(`Error deleting tag: ${error}`)
  })
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
  .then(result => {
    res.send(result.records)
    session.close()
  })
  .catch(error => {
    res.status(500).send(`Error deleting tag: ${error}`)
  })
})

app.post('/delete_comment', authorization_middleware.middleware, (req, res) => {
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
    author_username: jwt.verify(req.headers.authorization.split(" ")[1], secrets.jwt_secret).username,
  })
  .then(result => {
    session.close()
    if(result.records.length === 0 ) return res.status(400).send(`Comment could not be deleted, probably due to insufficient permissions`)
    res.send("Comment deleted successfully")
  })
  .catch(error => {
    res.status(500).send(`Error deleting tag: ${error}`)
  })
})

app.post('/get_comments_of_article', (req, res) => {
  // Route to get comments of a given article
  var session = driver.session()
  session
  .run(`
    MATCH (comment:Comment)-[:ABOUT]->(article:Article)
    WHERE id(article) = toInt({article_id})
    RETURN comment
    `, {
      article_id: req.body.article_id
    })
  .then(result => {
    res.send(result.records)
    session.close()
  })
  .catch(error => {
    res.status(500).send(`Error getting comments: ${error}`)
  })
})






app.post('/tag_article', authorization_middleware.middleware, (req, res) => {
  // Route to apply a tag to an article
  // NOT USED
  var session = driver.session()
  session
  .run(`
    // Find the article by ID
    MATCH (article:Article)
    WHERE id(article) = toInt({id})

    // Find the tag
    WITH article
    MATCH (tag:Tag)
    WHERE id(tag) = toInt({tag_id})

    MERGE (article)<-[:APPLIED_TO]-(tag)

    RETURN article
    `, {
    article_id: req.body.article.id,
    tag_id: req.body.tag.id,
  })
  .then(result => {
    res.send(result.records)
    session.close()
  })
  .catch(error => {
    res.status(500).send(`Error creating Tagging article: ${error}`)
  })
})


app.post('/get_navigation_items', (req, res) => {
  // Route to get navbar items
  var session = driver.session()
  session
  .run(`
    MATCH (tag:Tag {navigation_item: true})
    RETURN tag
    `, {})
  .then(result => {
    res.send(result.records)
    session.close()
  })
  .catch(error => {
    res.status(500).send(`Error getting navigation items: ${error}`)
  })
})







app.listen(port, () => console.log(`CMS listening on port ${port}`))
