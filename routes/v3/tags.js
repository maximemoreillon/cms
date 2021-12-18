const express = require('express')
const auth = require('@moreillon/express_identification_middleware')

const controller = require('../../controllers/v3/tags.js')

const router = express.Router()

const auth_options_strict = { url: `${process.env.IDENTIFICATION_URL}` }


router.route('/')
  .get(controller.get_tag_list)
  .post(auth(auth_options_strict), controller.create_tag)

router.route('/pinned')
  .get(controller.get_pinned_tags)

router.route('/:tag_id')
  .get(controller.get_tag)
  .put(auth(auth_options_strict), controller.update_tag)
  .patch(auth(auth_options_strict), controller.update_tag)
  .delete(auth(auth_options_strict), controller.delete_tag)



module.exports = router
