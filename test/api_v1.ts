import request from "supertest"
import { expect } from "chai"
import app from "../index"
import axios from "axios"
import dotenv from "dotenv"

dotenv.config()

const {
  LOGIN_URL = "undefined",
  IDENTIFICATION_URL = "undefined",
  TEST_USER_USERNAME = "admin",
  TEST_USER_PASSWORD = "admin",
} = process.env

const login = async () => {
  const body = { username: TEST_USER_USERNAME, password: TEST_USER_PASSWORD }
  const {
    data: { jwt },
  } = await axios.post(LOGIN_URL, body)
  return jwt
}

const whoami = async (jwt: string) => {
  const headers = { authorization: `bearer ${jwt}` }
  const { data: user } = await axios.get(IDENTIFICATION_URL, { headers })
  return user
}

// We will test for api users
describe("/v1/", () => {
  let user, jwt: string, article_id: string, tag_id: string

  before(async () => {
    //console.log = function () {}
    jwt = await login()
    user = await whoami(jwt)
  })

  describe("POST /v1/tags", () => {
    it("Should allow the creation of a tag", async () => {
      const tag = { name: "tdd" }
      const { status, body } = await request(app)
        .post("/v1/tags")
        .send(tag)
        .set("Authorization", `Bearer ${jwt}`)

      tag_id = body._id

      expect(status).to.equal(200)
    })
  })

  describe("GET /v1/tags", () => {
    it("Should allow the query of tags", async () => {
      const { status, body } = await request(app)
        .get("/v1/tags")
        .set("Authorization", `Bearer ${jwt}`)

      expect(status).to.equal(200)
      expect(body).to.have.lengthOf.above(0)
    })
  })

  describe("PATCH /v1/tags", () => {
    it("Should allow the update of a tag", async () => {
      const properties = { name: "tdd_updated" }
      const { status, body } = await request(app)
        .patch(`/v1/tags/${tag_id}`)
        .send(properties)
        .set("Authorization", `Bearer ${jwt}`)

      expect(status).to.equal(200)
    })
  })

  describe("POST /v1/articles", () => {
    it("Should allow the creation of an article", async () => {
      const article = { title: "tdd", published: false }
      const { status, body } = await request(app)
        .post("/v1/articles")
        .send({ ...article, tag_ids: [tag_id] })
        .set("Authorization", `Bearer ${jwt}`)

      article_id = body._id

      expect(status).to.equal(200)
    })
  })

  describe("GET /v1/articles/", () => {
    it("Should allow the query of articles", async () => {
      const { status, body } = await request(app)
        .get(`/v1/articles`)
        .set("Authorization", `Bearer ${jwt}`)

      expect(status).to.equal(200)
    })

    it("Should allow the anonymous query of articles", async () => {
      const { status, body } = await request(app).get(`/v1/articles`)

      expect(status).to.equal(200)
    })
  })

  describe("GET /v1/articles/:article_id", () => {
    it("Should allow the query of an article", async () => {
      const { status, body } = await request(app)
        .get(`/v1/articles/${article_id}`)
        .set("Authorization", `Bearer ${jwt}`)

      expect(status).to.equal(200)
    })

    it("Should prevent the anonymous query of a private article", async () => {
      const { status, body } = await request(app).get(
        `/v1/articles/${article_id}`
      )

      expect(status).to.not.equal(200)
    })
  })

  describe("GET /v1/authors", () => {
    it("Should allow the query of all authors", async () => {
      const { status, body } = await request(app).get(`/v1/authors`)

      expect(status).to.equal(200)
    })
  })

  describe("PATCH /v1/articles/:article_id", () => {
    it("Should allow the update of an article", async () => {
      const { status, body } = await request(app)
        .patch(`/v1/articles/${article_id}`)
        .send({ published: true })
        .set("Authorization", `Bearer ${jwt}`)

      article_id = body._id

      expect(status).to.equal(200)
    })
  })

  describe("GET /v1/articles/:article_id", () => {
    it("Should allow the anonymous query of a public article", async () => {
      const { status, body } = await request(app).get(
        `/v1/articles/${article_id}`
      )

      expect(status).to.equal(200)
    })
  })

  describe("DELETE /v1/articles/:article_id", () => {
    it("Should allow the deletion of an article", async () => {
      const { status, body } = await request(app)
        .delete(`/v1/articles/${article_id}`)
        .set("Authorization", `Bearer ${jwt}`)

      article_id = body._id

      expect(status).to.equal(200)
    })
  })

  describe("DELETE /v1/tags", () => {
    it("Should allow the deletion of a tag", async () => {
      const { status, body } = await request(app)
        .delete(`/v1/tags/${tag_id}`)
        .set("Authorization", `Bearer ${jwt}`)

      expect(status).to.equal(200)
    })
  })
})
