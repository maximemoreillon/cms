const {Router} = require('express')
const auth = require('@moreillon/express_identification_middleware')
const dotenv = require('dotenv')

const {
  create_tag,
  read_tags,
  read_tag,
  update_tag,
  delete_tag,
} = require('../../controllers/v1/tags.js')

dotenv.config()

const {
  IDENTIFICATION_URL
} = process.env

const router = Router()

const auth_options_strict = IDENTIFICATION_URL ? { url: IDENTIFICATION_URL } : undefined
const auth_options_lax = { ...auth_options_strict, lax: true }

router.route('/')
  .post(auth(auth_options_strict), create_tag)
  .get(auth(auth_options_lax),read_tags)


router.route('/:tag_id')
  .get(auth(auth_options_lax),read_tag)
  .put(auth(auth_options_strict), update_tag)
  .patch(auth(auth_options_strict), update_tag)
  .delete(auth(auth_options_strict), delete_tag)



module.exports = router
