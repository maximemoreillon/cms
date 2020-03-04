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
  var session = driver.session()
  session
  .run(`
    // Find the article node and update it
    MATCH (article:Article)
    WHERE id(article) = toInt({article}.identity.low)
    SET article = {article}.properties

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


app.post('/get_navigation_items', authorization_middleware.middleware, (req, res) => {
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


///////////////////////////////
// LEGACY CODE USING MONGODB //
///////////////////////////////
app.post('/get_article_list', (req, res) => {
  MongoClient.connect(DB_config.URL, DB_config.options, (err, db) => {
    if (err) return res.status(500).send("Error connecting to DB")

    var query = {}

    // Only get published items if not authenticated
    if(!check_authentication(req)) query.published = true;
    if(req.body.category) query.category = req.body.category;
    if(req.body.tags) query.tags = { $all: req.body.tags }



    // Exclude content so as not to get a massive response
    db.db(DB_config.DB_name)
    .collection("articles")
    .find(query, {projection: {content: 0}})
    .sort({edit_date: -1, creation_date: -1})
    .toArray( (err, result) => {
      if (err) return res.status(500).send("Error querying the DB for article list")
      db.close();
      res.send(result)
    });
  });
})

app.post('/get_article_categories', (req, res) => {
  MongoClient.connect(DB_config.URL, DB_config.options, (err, db) => {
    if (err) return res.status(500).send("Error connecting to DB")
    var dbo = db.db(DB_config.DB_name)

    dbo.collection("articles").find({}, {projection: { _id:0, category: 1}}).toArray( (err, result) => {
      if (err) return res.status(500).send("Error querying the DB for categories")
      db.close();
      res.send(result)
    });
  });
})

app.post('/get_tags', (req, res) => {
  MongoClient.connect(DB_config.URL, DB_config.options, (err, db) => {
    if (err) return res.status(500).send("Error connecting to DB")
    db.db(DB_config.DB_name)
    .collection("articles")
    .distinct("tags", {}, (err, result) => {
      if (err) return res.status(500).send("Error querying the DB for tags")
      db.close();
      res.send(result)
    });
  });
})

app.post('/get_article', (req, res) => {
  // route to get load a single article for either viewing or editing

  MongoClient.connect(DB_config.URL, DB_config.options, (err, db) => {
    if (err) return res.status(500).send("Error connecting to DB")
    var dbo = db.db(DB_config.DB_name)

    // Query by ID but if not logged in, only query public articles
    const query = { _id: ObjectID(req.body._id) }
    if(!check_authentication(req)) query.published = true;

    dbo.collection("articles")
    .findOne(query, (err, result) => {
      if (err) return res.status(500).send("Error querying the DB for article")
      db.close();
      res.send(result)
    });
  });
})

app.post('/edit_article', authorization_middleware.middleware, (req, res) => {
  MongoClient.connect(DB_config.URL, DB_config.options, (err, db) => {
    if (err) return res.status(500).send("Error connecting to DB")
    var dbo = db.db(DB_config.DB_name)

    // separate id from rest of body
    const { _id, ...body_without_id } = req.body;

    dbo.collection("articles").findOneAndUpdate({
      _id: ObjectID(req.body._id)
    }, {
      $set: body_without_id
    }, {
      upsert: true,
      returnOriginal: false,
    }, (err, result) => {
      if (err) return res.status(500).send("Error updating article in DB")
      db.close();
      res.send(result.value)
    });
  });
})

app.post('/delete_article',authorization_middleware.middleware, (req, res) => {
  MongoClient.connect(DB_config.URL, DB_config.options, (err, db) => {
    if (err) return res.status(500).send("Error connecting to DB")
    var dbo = db.db(DB_config.DB_name)
    dbo.collection("articles").deleteOne({
      _id: ObjectID(req.body._id)
    }, (err, result) => {
      if (err) return res.status(500).send("Error deleting article in DB")
      db.close();
      res.send('OK')
    });
  });
})

///////////////////////////////
// END OF CODE USING MONGODB //
///////////////////////////////



app.listen(port, () => console.log(`CMS listening on port ${port}`))
