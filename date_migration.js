const dotenv = require('dotenv')
const neo4j = require('neo4j-driver')

dotenv.config()


const driver = neo4j.driver(
  process.env.NEO4J_URL,
  neo4j.auth.basic(
    process.env.NEO4J_USERNAME,
    process.env.NEO4J_PASSWORD
  )
)


var session = driver.session()
session
.run(`
  // Get all articles
  MATCH (article:Article)-[rel:WRITTEN_BY]->(author:User)
  WHERE EXISTS(article.creation_date)
    AND EXISTS(article.edition_date)

  SET rel.creation_date = article.creation_date
  SET rel.edition_date = article.edition_date

  REMOVE article.creation_date
  REMOVE article.edition_date

  RETURN article
  `, {})
.then(result => { console.log('OK') })
.catch(error => { console.log(error)})
.finally(() => { session.close() })
