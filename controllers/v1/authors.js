const {driver} = require('../../db.js')
const { get_current_user_id } = require('../../utils.js')
const createHttpError = require('http-errors')

const get_author_id = ({query, params}) => query.author_id ?? params.author_id

exports.read_authors = async (req, res, next) => {

  const session = driver.session()
  try {
    const author_id = get_author_id(req)

    // TODO: Get article count
    // TODO: Pagination
    const query = `
      MATCH (author:User {_id: $author_id})
      RETURN properties(author) as author`

    const {records} = await session.run(query, { author_id })

    const authors = records.map( r => {
      const author = r.get('author')
      delete author.password_hashed
      return author
    })
    
    res.send(authors)

  } catch (error) {
    next(error)
  } finally {
    session.close()
  }

}


exports.read_author = async (req, res, next) => {

  const session = driver.session()
  try {
    const author_id = get_author_id(req)

    const query = `
      MATCH (author:User)
      WHERE (author)<-[:WRITTEN_BY]-(:Article)
      RETURN properties(author) as author`

    const {records} = await session.run(query, { author_id })

    if(!records.length) throw createHttpError(404,`Author ${author_id} not found`)
    const author = records[0].get('author')
    delete author.password_hashed
    res.send(author)

  } catch (error) {
    next(error)
  } finally {
    session.close()
  }

}



exports.get_article_author = async (req, res, next) => {
  // Route to get author of a given article

  // Is this even used?

  const session = driver.session()
  try {

  const {article_id} = req.params
  const current_user_id = get_current_user_id(res)

  const query = `
    MATCH (author:User)<-[:WRITTEN_BY]-(article:Article)
    WHERE article._id = $article_id

    WITH author, article
    WHERE article.published = true
    ${res.locals.user ? 'OR author._id = $current_user_id' : ''}

    RETURN properties(author) as author`

  const params = {
    current_user_id,
    article_id
  }

  const {records} = await session.run(query,params)

  if(!records.length ) throw createHttpError(404, `Article ${article_id} not found`)
    const author = records[0].get('author')
    delete author.password_hashed
    res.send(author)

  } catch (error) {
    next(error)
  } finally {
    session.close()
  }

}
