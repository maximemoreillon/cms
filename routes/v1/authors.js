// THIS FILE MIGHT NOT BE USED

const { Router } = require('express')

const controller = require('../../controllers/v1/authors.js')

const router = Router()



router.route('/')
  //.get(controller.get_authors)

router.route('/:author_id')
  .get(controller.get_author)

module.exports = router
