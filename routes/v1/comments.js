const express = require('express')
const auth = require('@moreillon/express_identification_middleware')



const {
  create_comment,
  delete_comment
} = require('../../controllers/v1/comments.js')

const {
  IDENTIFICATION_URL
} = process.env

const router = express.Router()


const auth_options_strict = IDENTIFICATION_URL ? { url: IDENTIFICATION_URL } : undefined
const auth_options_lax = { ...auth_options_strict, lax: true }

router.route('/')
  .post(auth(auth_options_lax), create_comment)

router.route('/:comment_id')
  .delete(auth(auth_options_strict), delete_comment)

module.exports = router
