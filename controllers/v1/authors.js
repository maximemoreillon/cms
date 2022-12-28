const {driver} = require('../../db.js')
const createHttpError = require('http-errors')

const get_author_id = ({query, params}) => query.author_id ?? params.author_id

exports.read_authors = async (req, res, next) => {

  const session = driver.session()
  try {

    // TODO: Pagination
    const query = `
      MATCH (author:User)
      WITH author
      MATCH (author)<-[:WRITTEN_BY]-(article:Article)
      RETURN 
        PROPERTIES(author) as author,
        SIZE(COLLECT(article)) as article_count`

    const {records} = await session.run(query)

    const authors = records.map( r => {
      const author = r.get('author')
      const article_count = r.get('article_count')
      delete author.password_hashed
      return { ...author, article_count }
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
      MATCH (author:User {_id: $author_id})
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
