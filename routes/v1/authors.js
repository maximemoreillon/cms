const { Router } = require('express')

const {
  read_authors,
  read_author,
} = require('../../controllers/v1/authors.js')

const router = Router()

router.route('/')
  .get(read_authors)

router.route('/:author_id')
  .get(read_author)

module.exports = router
