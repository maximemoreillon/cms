// NPM modules
const express = require('express')
const cors = require('cors')
const apiMetrics = require('prometheus-api-metrics')
const dotenv = require('dotenv')
const {version, author} = require('./package.json')
const {
  url: neo4j_url,
  connected: neo4j_connected,
  init: db_init,
 } = require('./db.js')


dotenv.config()

db_init()

const {
  APP_PORT = 80,
  IDENTIFICATION_URL,
} = process.env

const app = express()
app.use(express.json({limit: '50mb', extended: true}))
app.use(cors())
app.use(apiMetrics())

app.get('/', (req, res) => {
  res.send({
    application_name: 'CMS',
    author,
    version,
    neo4j: {
      url: neo4j_url,
      connected: neo4j_connected
    },
    auth: {
      identification_url: IDENTIFICATION_URL,
    }
    
  })
})

app.use('/', require('./routes/v1/index.js'))
app.use('/v1', require('./routes/v1/index.js')) // alias

// Express error handler
app.use((error, req, res, next) => {
  console.error(error)
  let { statusCode = 500, message = error } = error
  if(isNaN(statusCode) || statusCode > 600) statusCode = 500
  res.status(statusCode).send(message)
})

app.listen(APP_PORT, () => console.log(`CMS listening on port ${APP_PORT}`))

exports.app = app