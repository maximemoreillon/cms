const {driver} = require('../../db.js')
const return_user_id = require('../../identification.js')
const {error_handling} = require('../../utils.js')

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
  const session = driver.session()

  const query = `
    MATCH (author:User)
    WHERE author._id = $author_id
    RETURN properties(author) as author
    `

  session.run(query, { author_id })
  .then( ({records}) => {

    if(!records.length) throw {code: 404, message: `Author ${author_id} not found`}
    const author = records[0].get('author')
    delete author.password_hashed
    res.send(author)

   })
  .catch(error => { error_handling(error, res) })
  .finally( () => { session.close() })
}

exports.get_article_author = (req, res) => {
  // Route to get author of a given article

  // Is this even used?

  const {article_id} = req.params
  const current_user_id = return_user_id(res)

  const session = driver.session()

  const query = `
    MATCH (author:User)<-[:WRITTEN_BY]-(article:Article)
    WHERE article._id = $article_id

    WITH author, article
    WHERE article.published = true
    ${res.locals.user ? 'OR author._id = $current_user_id' : ''}

    RETURN properties(author) as author
    `

  const params = {
    current_user_id,
    article_id
  }

  session.run(query,params)
  .then( ({records}) => {

    if(!records.length) throw {code: 404, message: `Article ${article_id} not found`}
    const author = records[0].get('author')
    delete author.password_hashed
    res.send(author)

   })
  .catch(error => { error_handling(error, res) })
  .finally(() => { session.close() })

}
