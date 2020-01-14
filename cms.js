// NPM modules
const path = require('path')
const express = require('express')
const cors = require('cors')
const cookieSession = require('cookie-session')
const bodyParser = require('body-parser')
const MongoDB = require('mongodb');
const history = require('connect-history-api-fallback');

// Local modules
const credentials = require('../common/credentials');
const misc = require('../common/misc');

// Parameters
const port = 8050

// MongoDB related
const MongoClient = MongoDB.MongoClient;
const ObjectID = MongoDB.ObjectID;

const DB_config = {
  URL: 'mongodb://localhost:27017/',
  DB_name: 'CMS',
  options: { useUnifiedTopology: true },
}

// authentication middleware
function check_authentication(req, res, next) {
  if(!req.session.username) res.status(400).send("Unauthorized");
  else next();
}

// Express related
const app = express()
app.use(history({
  // Ignore route /file
  rewrites: [
    { from: '/file', to: '/file'}
  ]
}));
app.use(bodyParser.json({limit: '50mb', extended: true}))
app.use(express.static(path.join(__dirname, 'dist')));
app.use(cors({
  origin: misc.cors_origins,
  credentials: true,
}));
app.use(cookieSession({
  name: 'session',
  secret: credentials.session.secret,
  maxAge: 253402300000000,
  sameSite: false,
  domain: '.maximemoreillon.com'
}));

app.post('/get_article_list', (req, res) => {
  console.log("[Express] Article list requested")
  MongoClient.connect(DB_config.URL, DB_config.options, (err, db) => {
    if (err) throw err

    // By default query everything but if not logged in only query published
    var query = {}
    if(req.body.category) query.category = req.body.category;
    if(!req.session.username) query.published = true;

    // Do not get content to prevent a massive response
    db.db(DB_config.DB_name)
    .collection("articles")
    .find(query, {projection: {content: 0}})
    .sort({edit_date: -1})
    .toArray( (err, result) => {
      if (err) console.log(err);
      db.close();
      res.send(result)
    });
  });
})

app.post('/get_article_categories', (req, res) => {
  MongoClient.connect(DB_config.URL, DB_config.options, (err, db) => {
    if (err) throw err
    var dbo = db.db(DB_config.DB_name)

    dbo.collection("articles").find({}, {projection: { _id:0, category: 1}}).toArray( (err, result) => {
      if (err) console.log(err);
      db.close();
      res.send(result)
    });
  });
})

app.post('/get_tags', (req, res) => {
  MongoClient.connect(DB_config.URL, DB_config.options, (err, db) => {
    if (err) throw err
    db.db(DB_config.DB_name)
    .collection("articles")
    .distinct("tags", {}, (err, result) => {
      if (err) console.log(err);
      db.close();
      res.send(result)
    });
  });
})

app.post('/get_article', (req, res) => {
  // route to get load a single article for either viewing or editing

  MongoClient.connect(DB_config.URL, DB_config.options, (err, db) => {
    if (err) throw err
    var dbo = db.db(DB_config.DB_name)

    // Query by ID but if not logged in, only query public articles
    var query = { _id: ObjectID(req.body._id) }
    if(!req.session.username) query.published = true;

    dbo.collection("articles").findOne(query, (err, result) => {
      if (err) console.log(err);
      db.close();
      res.send(result)
    });
  });
})

app.post('/edit_article',check_authentication, (req, res) => {
  MongoClient.connect(DB_config.URL, DB_config.options, (err, db) => {
    if (err) throw err
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
      if (err) console.log(err);
      db.close();
      res.send(result.value)
    });
  });
})

app.post('/delete_article',check_authentication, (req, res) => {
  MongoClient.connect(DB_config.URL, DB_config.options, (err, db) => {
    if (err) throw err
    var dbo = db.db(DB_config.DB_name)
    dbo.collection("articles").deleteOne({
      _id: ObjectID(req.body._id)
    }, (err, result) => {
      if (err) console.log(err);
      db.close();
      res.send('OK')
    });
  });
})

app.listen(port, () => console.log(`CMS listening on port ${port}`))
