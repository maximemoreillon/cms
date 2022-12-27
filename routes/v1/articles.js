const auth = require('@moreillon/express_identification_middleware')
const dotenv = require('dotenv')
const {Router} = require('express')
const {
  create_article,
  read_articles,
  read_article,
  update_article,
  delete_article
} = require('../../controllers/v1/articles.js')
const {
  get_article_author
} = require('../../controllers/v1/authors.js')
//const comment_controller = require('../../controllers/v1/comments.js')

dotenv.config()

const {
  IDENTIFICATION_URL
} = process.env

const router = Router()

const auth_options_strict = IDENTIFICATION_URL ? { url: IDENTIFICATION_URL } : undefined
const auth_options_lax = { ...auth_options_strict, lax: true }


router.route('/')
  .post(auth(auth_options_strict), create_article)
  .get(auth(auth_options_lax), read_articles)

router.route('/:article_id')
  .get(auth(auth_options_lax), read_article)
  .put(auth(auth_options_strict), update_article)
  .patch(auth(auth_options_strict), update_article)
  .delete(auth(auth_options_strict), delete_article)

module.exports = router
