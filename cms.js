// NPM modules
const path = require('path')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const pjson = require('./package.json')

dotenv.config()

const port = process.env.APP_PORT || 80

const app = express()
app.use(bodyParser.json({limit: '50mb', extended: true}))
app.use(cors())

app.get('/', (req, res) => {
  res.send({
    application_name: 'CMS',
    author: 'Maxime MOREILLON',
    version: pjson.version,
    neo4j_url: process.env.NEO4J_URL,
    authentication_api_url: process.env.AUTHENTICATION_API_URL,
  })
})

app.use('/', require('./routes/v1/index.js'))
app.use('/v1', require('./routes/v1/index.js'))
app.use('/v2', require('./routes/v2/index.js'))

app.listen(port, () => console.log(`CMS listening on port ${port}`))
