const {Router} = require('express')
const auth = require('@moreillon/express_identification_middleware')

const {
  get_tag_list,
  get_tag,
  create_tag,
  update_tag,
  delete_tag,
} = require('../../controllers/v3/tags.js')

const router = Router()

let auth_options_strict
if(process.env.IDENTIFICATION_URL) auth_options_strict = { url: `${process.env.IDENTIFICATION_URL}` }
else auth_options_strict = { url: `${process.env.AUTHENTICATION_API_URL}/v3/whoami` }

router.route('/')
  .get(get_tag_list)
  .post(auth(auth_options_strict), create_tag)


router.route('/:tag_id')
  .get(get_tag)
  .put(auth(auth_options_strict), update_tag)
  .patch(auth(auth_options_strict), update_tag)
  .delete(auth(auth_options_strict), delete_tag)



module.exports = router
