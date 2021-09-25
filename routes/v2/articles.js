const {Router} = require('express')

const auth = require('@moreillon/express_identification_middleware')


const article_controller = require('../../controllers/v2/articles.js')
const tag_controller = require('../../controllers/v2/tags.js')
const author_controller = require('../../controllers/v2/authors.js')
const comment_controller = require('../../controllers/v2/comments.js')

const router = Router()
const auth_options = { url: `${process.env.AUTHENTICATION_API_URL}/v2/whoami` }
const auth_options_lax = { ...auth_options, lax: true }


router.route('/')
  .post(auth(auth_options), article_controller.create_article)
  .get(auth(auth_options_lax), article_controller.get_article_list)

router.route('/:article_id')
  .get(auth(auth_options_lax), article_controller.get_article)
  .put(auth(auth_options), article_controller.update_article)
  .delete(auth(auth_options), article_controller.delete_article)

router.route('/:article_id/tags')
  .get(auth(auth_options), tag_controller.get_article_tags)

router.route('/:article_id/author')
  .get(auth(auth_options), author_controller.get_article_author)

router.route('/:article_id/comments')
  .get(auth(auth_options), comment_controller.get_article_comments)

module.exports = router
