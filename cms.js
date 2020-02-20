// NPM modules
const path = require('path')
const express = require('express')
const cors = require('cors')
const cookieSession = require('cookie-session')
const bodyParser = require('body-parser')
const MongoDB = require('mongodb');
const history = require('connect-history-api-fallback');
const jwt = require('jsonwebtoken')
const Cookies = require('cookies')
const authorization_middleware = require('@moreillon/authorization_middleware');


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


// Express related
const app = express()
app.use(bodyParser.json({limit: '50mb', extended: true}))
app.use(express.static(path.join(__dirname, 'dist')))
app.use(cors())
app.use(history())

function check_authentication(req){
  // Authorization using a JWT


  if(!req.headers.authorization) return false

  // parse the headers to get the token
  let token = req.headers.authorization.split(" ")[1];

  console.log(token)

  /*
  var decoded = jwt.verify(token, secrets.jwt_secret);

  if(decoded) return true
  else return false
  */
  return false

}


app.post('/get_article_list', (req, res) => {


  MongoClient.connect(DB_config.URL, DB_config.options, (err, db) => {
    if (err) return res.status(500).send("Error connecting to DB")

    // By default query everything but if not logged in only query published
    var query = {}
    if(req.body.category) query.category = req.body.category;
    if(req.body.tags) console.log("NOT IMPLEMENTED YET")

    // this is flimsy
    if(!check_authentication(req)) query.published = true;

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

app.post('/edit_article',authorization_middleware.middleware, (req, res) => {
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



app.listen(port, () => console.log(`CMS listening on port ${port}`))
