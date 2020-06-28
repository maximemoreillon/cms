const driver = require('../db_config.js')
const return_user_id = require('../identification.js')

exports.create_comment = (req, res) => {
  // Route to create a comment
  // TODO: Prevent commenting on unpublished articles
  var session = driver.session()
  session
  .run(`
    // Find article node
    MATCH (article:Article)
    WHERE id(article) = toInt({article_id})

    // Create comment
    CREATE (comment:Comment)-[:ABOUT]->(article)
    SET comment = {comment}.properties
    SET comment.date = date()

    RETURN comment
    `, {
    article_id: req.body.article_id,
    comment: req.body.comment,
  })
  .then(result => { res.send(result.records) })
  .catch(error => { res.status(500).send(`Error creatin comment: ${error}`) })
  .finally(() => { session.close() })
}

exports.delete_comment = (req, res) => {
  // Route to delete a comment
  var session = driver.session()
  session
  .run(`
    // Find the comment
    MATCH (comment:Comment)
    WHERE id(comment) = toInt({comment_id})

    // Match the user requesting
    WITH comment
    MATCH (user:User)
    WHERE id(user)=toInt({user_id})
      AND ( (comment)-[:ABOUT]->(:Article)-[:WRITTEN_BY]->(user:User)
        OR user.isAdmin )

    DETACH DELETE comment
    RETURN 'success'
    `, {
    user_id: res.locals.user.identity.low,
    comment_id: req.body.comment_id,
  })
  .then(result => {
    if(result.records.length === 0 ) return res.status(400).send(`Comment could not be deleted, probably due to insufficient permissions`)
    res.send("Comment deleted successfully")
  })
  .catch(error => {
    console.log(error)
    res.status(500).send(`Error deleting comment: ${error}`)
  })
  .finally(() => { session.close() })
}

exports.get_article_comments = (req, res) => {
  // Route to get comments of a given article

  let article_id = req.query.id
    || req.params.article_id

  var session = driver.session()
  session
  .run(`
    MATCH (comment:Comment)-[:ABOUT]->(article:Article)
    WHERE id(article) = toInt({article_id})

    WITH comment, article
    MATCH (article)-[:WRITTEN_BY]->(author:User)
    WHERE article.published = true  ${res.locals.user ? 'OR id(author)=toInt({current_user_id})' : ''}

    RETURN comment
    `, {
      current_user_id: return_user_id(res),
      article_id: article_id,
    })
  .then(result => { res.send(result.records) })
  .catch(error => { res.status(500).send(`Error getting comments: ${error}`) })
  .finally(() => { session.close() })

}
