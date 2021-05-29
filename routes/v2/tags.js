const express = require('express')
const auth = require('@moreillon/authentication_middleware')

const controller = require('../../controllers/v2/tags.js')

const router = express.Router()



router.route('/')
  .get(controller.get_tag_list)
  .post(auth.authenticate, controller.create_tag)

router.route('/pinned')
  .get(controller.get_pinned_tags)

router.route('/:tag_id')
  .get(controller.get_tag)
  .put(auth.authenticate, controller.update_tag)
  .delete(auth.authenticate, controller.delete_tag)



module.exports = router
