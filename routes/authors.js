const express = require('express')
const auth = require('@moreillon/authentication_middleware')

const controller = require('../controllers/authors.js')

const router = express.Router()



router.route('/')
  //.get(controller.get_authors)

router.route('/:author_id')
  .get(controller.get_author)

module.exports = router
