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


app.post('/get_article_list_neo4j', (req, res) => {
  // Route to get all articles

  // TODO: COMBINE WITH get_articles_of_tag

  var session = driver.session()
  session
  .run(`
    // Get all article nodes
    MATCH (article:Article)
    // Show private articles only to authenticated users
    ${check_authentication(req) ? '' : 'WHERE article.published = true'}
    RETURN article
    ORDER BY article.edition_date DESC
    `, {
      tag: req.body.tag,
    })
  .then(result => {
    res.send(result.records)
    session.close()
  })
  .catch(error => {
    res.status(500).send(`Error getting article list: ${error}`)
  })
})

app.post('/get_article_neo4j', (req, res) => {
  // Route to get a single article
  var session = driver.session()
  session
  .run(`
    MATCH (article:Article)
    WHERE id(article) = toInt({id})
    OPTIONAL MATCH (article)--(tag:Tag)
    RETURN article, tag
    `, {
    id: req.body.id,
  })
  .then(result => {
    res.send(result.records)
    session.close()
  })
  .catch(error => {
    res.status(500).send(`Error getting article: ${error}`)
  })
})




app.post('/create_article_neo4j', authorization_middleware.middleware, (req, res) => {
  // Route to create an article
  // TODO: Check if there is a way to combine with update route using MERGE
  // TODO: deal with tags
  var session = driver.session()
  session
  .run(`
    // create the article node
    CREATE (article:Article)
    SET article = {article}.properties

    // Add dates
    SET article.creation_date = date()
    SET article.edition_date = date()

    // Deal with tags EMPTY LISTS ARE A PAIN
    WITH article

    UNWIND
      CASE
        WHEN {tags} = []
          THEN [null]
        ELSE {tags}
      END AS target_tag

    OPTIONAL MATCH (tag:Tag)
    WHERE id(tag) = toInt(target_tag.identity.low)
    WITH collect(tag) as tags, article
    FOREACH(tag IN tags | MERGE (article)<-[:APPLIED_TO]-(tag))

    // Return the article
    RETURN article

    `, {
    article: req.body.article,
    tags: req.body.tags,
  })
  .then(result => {
    res.send(result.records)
    session.close()
  })
  .catch(error => {
    res.status(500).send(`Error creating article: ${error}`)
  })

})

app.post('/update_article_neo4j', authorization_middleware.middleware, (req, res) => {
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
    MATCH (article:Article)
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
        WHEN {tags} = []
          THEN [null]
        ELSE {tags}
      END AS target_tag

    OPTIONAL MATCH (tag:Tag)
    WHERE id(tag) = toInt(target_tag.identity.low)
    WITH collect(tag) as tags, article
    FOREACH(tag IN tags | MERGE (article)<-[:APPLIED_TO]-(tag))

    // Return the article
    RETURN article
    `, {
    article: req.body.article,
    tags: req.body.tags,
  })
  .then(result => {
    res.send(result.records)
    session.close()
  })
  .catch(error => {
    res.status(500).send(`Error updating article: ${error}`)
  })
})


app.post('/delete_article_neo4j', authorization_middleware.middleware, (req, res) => {
  // Route to delete an article
  var session = driver.session()
  session
  .run(`
    MATCH (article:Article)
    WHERE id(article) = toInt({id})
    DETACH DELETE article
    `, {
    id: req.body.id,
  })
  .then(result => {
    res.send("Article deleted successfully")
    session.close()
  })
  .catch(error => {
    res.status(500).send(`Error deleting article: ${error}`)
  })

})

app.post('/get_tag_list_neo4j', (req, res) => {
  // Route to get all tags
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

app.post('/get_tag_neo4j', (req, res) => {
  // Route to get a single tag using its ID
  var session = driver.session()
  session
  .run(`
    MATCH (tag:Tag)
    WHERE id(tag) = toInt({id})
    RETURN tag
    `, {
    id: req.body.id,
  })
  .then(result => {
    res.send(result.records)
    session.close()
  })
  .catch(error => {
    res.status(500).send(`Error getting tag: ${error}`)
  })
})

app.post('/create_tag_neo4j', authorization_middleware.middleware, (req, res) => {
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

app.post('/update_tag_neo4j', authorization_middleware.middleware, (req, res) => {
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

app.post('/delete_tag_neo4j', authorization_middleware.middleware, (req, res) => {
  // Route to delete a single tag
  var session = driver.session()
  session
  .run(`
    MATCH (tag:Tag)
    WHERE id(tag) = toInt({id})
    DETACH DELETE tag
    `, {
      // HERE, COULD GET THE WHOLE TAG
    id: req.body.id,
  })
  .then(result => {
    res.send("Tag deleted successfully")
    session.close()
  })
  .catch(error => {
    res.status(500).send(`Error deleting tag: ${error}`)
  })
})


app.post('/tag_article_neo4j', authorization_middleware.middleware, (req, res) => {
  // Route to apply a tag to an article
  // NOT USED YET
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

app.post('/get_tags_of_article', (req, res) => {
  // Route to get tags of a given article
  var session = driver.session()
  session
  .run(`
    MATCH (tag:Tag)-[:APPLIED_TO]->(article:Article)
    WHERE id(article) = toInt({id})
    RETURN tag
    `, {
      id: req.body.id
    })
  .then(result => {
    res.send(result.records)
    session.close()
  })
  .catch(error => {
    res.status(500).send(`Error getting tags: ${error}`)
  })
})

app.post('/get_articles_of_tag', (req, res) => {
  // Route to get tags of a given article

  var session = driver.session()
  session
  .run(`
    MATCH (tag:Tag)-[:APPLIED_TO]->(article:Article)
    WHERE id(tag) = toInt({id}) ${check_authentication(req) ? '' : 'AND article.published = true'}
    RETURN article
    ORDER BY article.edition_date DESC
    `, {
      id: req.body.id
    })
  .then(result => {
    res.send(result.records)
    session.close()
  })
  .catch(error => {
    res.status(500).send(`Error getting articles: ${error}`)
  })
})



app.listen(port, () => console.log(`CMS listening on port ${port}`))
