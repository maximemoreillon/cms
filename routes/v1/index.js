const { Router } = require('express')

const router = Router()

router.use('/articles', require('./articles.js'))
router.use('/tags', require('./tags.js'))
router.use('/authors',require('./authors.js'))
//router.use('/comments', require('./comments.js'))


module.exports = router
