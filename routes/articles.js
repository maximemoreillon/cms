const express = require('express')
const auth = require('@moreillon/authentication_middleware')

const controller = require('../controllers/articles.js')

const router = express.Router()

router.route('/')
  .post(auth.authenticate, controller.create_article)
  .get(auth.identify_if_possible, controller.get_article_list)

router.route('/:article_id')
  .get(auth.identify_if_possible, controller.get_article)
  .put(auth.authenticate, controller.update_article)
  .delete(auth.authenticate, controller.delete_article)

router.route('/:article_id/tags')
  .get(auth.identify_if_possible, require('../controllers/tags.js').get_article_tags)

router.route('/:article_id/author')
  .get(auth.identify_if_possible, require('../controllers/authors.js').get_article_author)

router.route('/:article_id/comments')
  .get(auth.identify_if_possible, require('../controllers/comments.js').get_article_comments)

module.exports = router
