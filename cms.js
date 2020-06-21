// NPM modules
const path = require('path')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const axios = require('axios')
const dotenv = require('dotenv')

const auth = require('@moreillon/authentication_middleware')


const article_management = require('./article_management.js')
const tag_management = require('./tag_management.js')
const comment_management = require('./comment_management.js')

dotenv.config();

// Parameters
const port = process.env.APP_PORT || 80

const driver = require('./db_config.js')
const return_user_id = require('./identification.js')

// Express configuration
const app = express()
app.use(bodyParser.json({limit: '50mb', extended: true}))
app.use(cors())


app.get('/', (req, res) => {
  res.send(`CMS API, Maxime MOREILLON`)
})

app.use('/article', article_management)
app.use('/tag', tag_management)
app.use('/comment', comment_management)






app.get('/author', (req, res) => {
  // Route to get an author using his ID
  var session = driver.session()
  session
  .run(`
    MATCH (author:User)
    WHERE id(author) = toInt({author_id})
    RETURN author
    `, {
    author_id: req.query.author_id,
  })
  .then(result => { res.send(result.records[0].get('author')) })
  .catch(error => { res.status(500).send(`Error getting author: ${error}`) })
  .finally( () => { session.close() })
})






app.listen(port, () => console.log(`CMS listening on port ${port}`))
