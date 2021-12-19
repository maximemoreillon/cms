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

  let user, jwt, article_id, tag_id


  before( async () => {
    //console.log = function () {}
    jwt = await login()
    user = await whoami(jwt)

  })

  describe("POST /v3/tags", () => {
    it("Should allow the creation of a tag", async () => {

      const tag = {name: 'tdd'}
      const {status, body} = await request(app)
        .post("/v3/tags")
        .send(tag)
        .set('Authorization', `Bearer ${jwt}`)

      tag_id = body._id

      expect(status).to.equal(200)
    })
  })

  describe("GET /v3/tags", () => {
    it("Should allow the query of tags", async () => {

      const {status, body} = await request(app)
        .get("/v3/tags")
        .set('Authorization', `Bearer ${jwt}`)

      expect(status).to.equal(200)
      expect(body).to.have.lengthOf.above(0)
    })
  })

  describe("PATCH /v3/tags", () => {
    it("Should allow the update of a tag", async () => {

      const properties = {name: 'tdd_updated'}
      const {status, body} = await request(app)
        .patch(`/v3/tags/${tag_id}`)
        .send(properties)
        .set('Authorization', `Bearer ${jwt}`)

      expect(status).to.equal(200)
    })
  })

  describe("POST /v3/articles", () => {
    it("Should allow the creation of an article", async () => {

      const article = {title: 'tdd'}
      const {status, body} = await request(app)
        .post("/v3/articles")
        .send({...article, tag_ids: [tag_id]})
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

      expect(status).to.equal(200)
    })
  })

  describe("PATCH /v3/articles/:article_id", () => {
    it("Should allow the update of an article", async () => {

      const {status, body} = await request(app)
        .patch(`/v3/articles/${article_id}`)
        .send({title: 'tdd-edited'})
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

  describe("DELETE /v3/tags", () => {
    it("Should allow the deletion of a tag", async () => {

      const {status, body} = await request(app)
        .delete(`/v3/tags/${tag_id}`)
        .set('Authorization', `Bearer ${jwt}`)

      expect(status).to.equal(200)
    })
  })
})
