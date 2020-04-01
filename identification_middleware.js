const axios = require('axios')

// secret set by the application
exports.authentication_api_url = undefined

exports.middleware = (req, res, next) => {

  // check if the API URL is defined
  if(!exports.authentication_api_url){
    console.log(new Error("Authentication API URL not set"))
    return res.status(500).send('Authentication API URL not set in the server-side application')
  }

  if(!('authorization' in req.headers)) return next()

  let token = req.headers.authorization.split(" ")[1];
  if(!token) return next()

  axios.post(exports.authentication_api_url, { jwt: token })
  .then(response => {
    res.locals.user = response.data
  })
  .catch( () => { })
  .finally( () => {return next()})

}
