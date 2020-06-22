const express = require('express')
const auth = require('@moreillon/authentication_middleware')

const driver = require('../db_config.js')
const return_user_id = require('../identification.js')

var router = express.Router()

let create_comment = (req, res) => {
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

let delete_comment = (req, res) => {
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


router.route('/')
  .post(create_comment)
  .delete(auth.authenticate, delete_comment)

module.exports = router
