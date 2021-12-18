const express = require('express')
const auth = require('@moreillon/authentication_middleware')

const controller = require('../../controllers/v3/comments.js')

const router = express.Router()

router.route('/')
  .post(controller.create_comment)

router.route('/:comment_id')
  .delete(auth.authenticate, controller.delete_comment)

module.exports = router
