const {driver} = require('../../db.js')
const return_user_id = require('../../identification.js')

function get_author_id(req) {
  return req.query.author_id
    ?? req.params.author_id
}

const get_article_id = (req) => {
  return req.query.id
    ?? req.query.article_id
    ?? req.params.article_id
}


exports.get_author = (req, res) => {

  const author_id = get_author_id(req)

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

  const article_id = get_article_id(req)

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
