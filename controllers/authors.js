const driver = require('../db_config.js')
const return_user_id = require('../identification.js')

exports.get_author = (req, res) => {

  let author_id = req.query.author_id
    || req.params.author_id

  // Route to get an author using his ID
  var session = driver.session()
  session
  .run(`
    MATCH (author:User)
    WHERE id(author) = toInteger($author_id)
    RETURN author
    `, {
    author_id: author_id,
  })
  .then(result => { res.send(result.records[0].get('author')) })
  .catch(error => { res.status(500).send(`Error getting author: ${error}`) })
  .finally( () => { session.close() })
}

exports.get_article_author = (req, res) => {
  // Route to get author of a given article

  let article_id = req.query.id
    || req.params.article_id

  var session = driver.session()
  session
  .run(`
    MATCH (author:User)<-[:WRITTEN_BY]-(article:Article)
    WHERE id(article) = toInteger($article_id)

    // NOT SURE IF FILTERING WORKS
    WITH author, article
    WHERE article.published = true
    ${res.locals.user ? 'OR id(author)=toInteger($current_user_id)' : ''}

    RETURN author
    `, {
      current_user_id: return_user_id(res),
      article_id: article_id
    })
  .then(result => { res.send(result.records) })
  .catch(error => { res.status(500).send(`Error getting author: ${error}`) })
  .finally(() => { session.close() })

}
