const express = require('express')

const router = express.Router()

router.use('/articles', require('./articles.js'))
router.use('/tags', require('./tags.js'))
//router.use('/comments', require('./comments.js'))
router.use('/authors',require('./authors.js'))


module.exports = router
