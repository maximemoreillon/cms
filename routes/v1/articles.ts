import auth from "@moreillon/express_identification_middleware"
import dotenv from "dotenv"
import { Router } from "express"
import {
  create_article,
  read_articles,
  read_article,
  update_article,
  delete_article,
} from "../../controllers/v1/articles"
// import { get_article_author } from "../../controllers/v1/authors"
//const comment_controller from '../../controllers/v1/comments.js')

dotenv.config()

const { IDENTIFICATION_URL } = process.env

const router = Router()

const auth_options_strict = IDENTIFICATION_URL
  ? { url: IDENTIFICATION_URL }
  : undefined
const auth_options_lax = { ...auth_options_strict, lax: true }

router
  .route("/")
  .post(auth(auth_options_strict), create_article)
  .get(auth(auth_options_lax), read_articles)

router
  .route("/:article_id")
  .get(auth(auth_options_lax), read_article)
  .put(auth(auth_options_strict), update_article)
  .patch(auth(auth_options_strict), update_article)
  .delete(auth(auth_options_strict), delete_article)

export default router
