const MongoDB = require('mongodb')
const neo4j = require('neo4j-driver');
const secrets = require('./secrets');

const MongoClient = MongoDB.MongoClient;

const DB_config = {
  URL: secrets.mongodb_url,
  DB_name: 'cms',
  options: { useUnifiedTopology: true },
}

const driver = neo4j.driver(
  secrets.neo4j.url,
  neo4j.auth.basic(secrets.neo4j.username, secrets.neo4j.password)
)

function format_date(date_string){

  var date = new Date(date_string);

  var mm = date.getMonth() + 1; // getMonth() is zero-based
  var dd = date.getDate();
  return [date.getFullYear(), (mm>9 ? '' : '0') + mm, (dd>9 ? '' : '0') + dd ].join('-');
}


MongoClient.connect(DB_config.URL, DB_config.options, (err, db) => {
  if (err) return console.log("Error connecting to DB")
  db.db(DB_config.DB_name)
  .collection("articles")
  .find({})
  .toArray( (err, articles) => {
    if (err) return console.log("Error querying the DB for article list")
    db.close();

    console.log(`Retrieved ${articles.length} results`)

    articles.forEach(article => {
      if(article.creation_date) article.creation_date = format_date(article.creation_date)
      if(article.edit_date) article.edit_date = format_date(article.edit_date)
      else if(article.creation_date) article.edit_date = format_date(article.creation_date)
    });

    console.log(articles[0])



    var session = driver.session()
    session
    .run(`
      UNWIND {articles} as mongodb_article
      MERGE (article:Article {content: mongodb_article.content})
      SET article.title = mongodb_article.title
      SET article.summary = mongodb_article.summary
      SET article.thumbnail_src = mongodb_article.thumbnail_src
      SET article.published = mongodb_article.published

      // Dates
      SET article.edition_date = date(mongodb_article.edit_date)
      SET article.creation_date = date(mongodb_article.creation_date)

      WITH article, mongodb_article
      UNWIND mongodb_article.tags as mongodb_tag
      MERGE (tag:Tag {name: mongodb_tag})
      MERGE (tag)-[:APPLIED_TO]->(article)

      RETURN article
      `, {
        articles: articles
      })
    .then(result => {
      console.log(`MERGEd ${result.records.length} articles`)
      session.close()
      driver.close()
    })
    .catch(error => console.log(error))


  });
})
