const { Router } = require('express')

const {
  get_author
} = require('../../controllers/v1/authors.js')

const router = Router()



router.route('/')
  //.get(get_authors)

router.route('/:author_id')
  .get(get_author)

module.exports = router
