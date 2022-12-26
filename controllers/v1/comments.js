// COMMENTS ARE NOT USED FOR THE TIME BEING!

const createHttpError = require('http-errors')
const {driver} = require('../../db.js')
const { get_current_user_id } = require('../../utils.js')

exports.create_comment = async (req, res, next) => {
  // Route to create a comment
  // TODO: Prevent commenting on unpublished articles
  const session = driver.session()
  try {
    const query = `
    // Find article node
    MATCH (article:Article)
    WHERE article._id = $article_id

    // Create comment
    CREATE (comment:Comment)-[:ABOUT]->(article)
    SET comment = $comment.properties
    SET comment.date = date()
    SET comment._id = randomUUID()


    RETURN comment
    `

    const params = {
      article_id: req.body.article_id,
      comment: req.body.comment,
    }

    const {records} = await session.run(query, params)

    console.log(`Comment created`)
    res.send(result.records)
    
  } catch (error) {
    next(error)
  } finally {
    session.close()
  }

}

exports.delete_comment = async (req, res, next) => {
  // Route to delete a comment
  const session = driver.session()

  try {

    const query = `
    // Find the comment
    MATCH (comment:Comment)
    WHERE comment._id = $comment_id

    // Match the user requesting
    WITH comment
    MATCH (user:User)
    WHERE user._id = $user_id
      AND ( (comment)-[:ABOUT]->(:Article)-[:WRITTEN_BY]->(user:User)
        OR user.isAdmin )

    DETACH DELETE comment
    RETURN 'success'
    `

    const params = {
      user_id: res.locals.user._id,
      comment_id: req.body.comment_id,
    }

    const { records} = await session.run(query, params)

    if (!records.length) throw createHttpError(400, `Comment could not be deleted, probably due to insufficient permissions`)
    res.send("Comment deleted successfully")
    
  } catch (error) {
    next(error)
  } finally {
    session.close()
  }

}

exports.get_article_comments = async (req, res, next) => {
  // Route to get comments of a given article

  const session = driver.session()
  try {
    let article_id = req.query.id || req.params.article_id

    const query = `
      MATCH (comment:Comment)-[:ABOUT]->(article:Article)
      WHERE article._id = $article_id

      WITH comment, article
      MATCH (article)-[:WRITTEN_BY]->(author:User)
      WHERE article.published = true  ${res.locals.user ? 'OR author._id = $current_user_id' : ''}

      RETURN comment
      `
    
      const params = {
        current_user_id: get_current_user_id(res),
        article_id: article_id,
      }

      const { record } = await session.run(query, params)

      res.send(record)

  } catch (error) {
    next(error)
  } finally {
    session.close()
  }

}
