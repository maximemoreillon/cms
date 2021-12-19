const {Router} = require('express')

const auth = require('@moreillon/express_identification_middleware')


const article_controller = require('../../controllers/v3/articles.js')
const tag_controller = require('../../controllers/v3/tags.js')
const author_controller = require('../../controllers/v3/authors.js')
const comment_controller = require('../../controllers/v3/comments.js')

const router = Router()
// const auth_options_strict = { url: `${process.env.AUTHENTICATION_API_URL}/v3/whoami` }
const auth_options_strict = { url: `${process.env.IDENTIFICATION_URL}` }
const auth_options_lax = { ...auth_options_strict, lax: true }


router.route('/')
  .post(auth(auth_options_strict), article_controller.create_article)
  .get(auth(auth_options_lax), article_controller.get_article_list)

router.route('/:article_id')
  .get(auth(auth_options_lax), article_controller.get_article)
  .put(auth(auth_options_strict), article_controller.update_article)
  .patch(auth(auth_options_strict), article_controller.update_article)
  .delete(auth(auth_options_strict), article_controller.delete_article)

router.route('/:article_id/tags')
  .get(auth(auth_options_strict), tag_controller.get_article_tags)

router.route('/:article_id/author')
  .get(auth(auth_options_strict), author_controller.get_article_author)

router.route('/:article_id/comments')
  .get(auth(auth_options_strict), comment_controller.get_article_comments)

module.exports = router
