const {Router} = require('express')

const auth = require('@moreillon/express_identification_middleware')

const {
  IDENTIFICATION_URL
} = process.env

const {
  create_article,
  get_article_list,
  get_article,
  update_article,
  delete_article
} = require('../../controllers/v1/articles.js')


const {
  get_article_author
} = require('../../controllers/v1/authors.js')
//const comment_controller = require('../../controllers/v1/comments.js')

const router = Router()

const auth_options_strict = IDENTIFICATION_URL ? { url: IDENTIFICATION_URL } : undefined
const auth_options_lax = { ...auth_options_strict, lax: true }


router.route('/')
  .post(auth(auth_options_strict), create_article)
  .get(auth(auth_options_lax), get_article_list)

router.route('/:article_id')
  .get(auth(auth_options_lax), get_article)
  .put(auth(auth_options_strict), update_article)
  .patch(auth(auth_options_strict), update_article)
  .delete(auth(auth_options_strict), delete_article)

// router.route('/:article_id/tags')
//   .get(auth(auth_options_strict), tag_controller.get_article_tags)

router.route('/:article_id/author')
  .get(auth(auth_options_strict), get_article_author)

// router.route('/:article_id/comments')
//   .get(auth(auth_options_strict), comment_controller.get_article_comments)

module.exports = router
