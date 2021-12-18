const request = require("supertest")
const {expect} = require("chai")
const {app} = require("../cms.js")
const axios = require('axios')
const dotenv = require('dotenv')

dotenv.config()

const {
  LOGIN_URL,
  IDENTIFICATION_URL,
  TEST_USER_USERNAME = 'admin',
  TEST_USER_PASSWORD = 'admin',
} = process.env

const login = async () => {
  const body = {username: TEST_USER_USERNAME, password: TEST_USER_PASSWORD}
  const {data: {jwt}} = await axios.post(LOGIN_URL,body)
  return jwt
}

const whoami = async (jwt) => {
  const headers = {authorization: `bearer ${jwt}`}
  const {data: user} = await axios.get(IDENTIFICATION_URL,{headers})
  return user
}



// We will test for api users
describe("/v3/", () => {

  let user, jwt, article_id


  before( async () => {
    //console.log = function () {}
    jwt = await login()
    user = await whoami(jwt)

  })

  describe("POST /v3/articles", () => {
    it("Should allow the creation of an article", async () => {

      const article = {title: 'tdd'}
      const {status, body} = await request(app)
        .post("/v3/articles")
        .send({article})
        .set('Authorization', `Bearer ${jwt}`)

      article_id = body._id

      expect(status).to.equal(200)
    })
  })

  describe("GET /v3/articles/", () => {
    it("Should allow the query of articles", async () => {

      const {status, body} = await request(app)
        .get(`/v3/articles`)
        .set('Authorization', `Bearer ${jwt}`)

      expect(status).to.equal(200)
    })
  })

  describe("GET /v3/articles/:article_id", () => {
    it("Should allow the query of an article", async () => {

      const {status, body} = await request(app)
        .get(`/v3/articles/${article_id}`)
        .set('Authorization', `Bearer ${jwt}`)

      article_id = body._id

      expect(status).to.equal(200)
    })
  })

  describe("DELETE /v3/articles/:article_id", () => {
    it("Should allow the deletion of an article", async () => {

      const {status, body} = await request(app)
        .delete(`/v3/articles/${article_id}`)
        .set('Authorization', `Bearer ${jwt}`)

      article_id = body._id

      expect(status).to.equal(200)
    })
  })
})
