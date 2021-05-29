const express = require('express')
const auth = require('@moreillon/authentication_middleware')

const controller = require('../../controllers/v2/articles.js')
const tag_controller = require('../../controllers/v2/tags.js')
const author_controller = require('../../controllers/v2/authors.js')
const comment_controller = require('../../controllers/v2/comments.js')

const router = express.Router()

router.route('/')
  .post(auth.authenticate, controller.create_article)
  .get(auth.identify_if_possible, controller.get_article_list)

router.route('/:article_id')
  .get(auth.identify_if_possible, controller.get_article)
  .put(auth.authenticate, controller.update_article)
  .delete(auth.authenticate, controller.delete_article)

router.route('/:article_id/tags')
  .get(auth.identify_if_possible, tag_controller.get_article_tags)

router.route('/:article_id/author')
  .get(auth.identify_if_possible, author_controller.get_article_author)

router.route('/:article_id/comments')
  .get(auth.identify_if_possible, comment_controller.get_article_comments)

module.exports = router
