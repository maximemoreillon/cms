import { Router } from "express"
import auth from "@moreillon/express_identification_middleware"
import dotenv from "dotenv"

import {
  create_tag,
  read_tags,
  read_tag,
  update_tag,
  delete_tag,
} from "../../controllers/v1/tags"

dotenv.config()

const { IDENTIFICATION_URL } = process.env

const router = Router()

const auth_options_strict = IDENTIFICATION_URL
  ? { url: IDENTIFICATION_URL }
  : undefined
const auth_options_lax = { ...auth_options_strict, lax: true }

router
  .route("/")
  .post(auth(auth_options_strict), create_tag)
  .get(auth(auth_options_lax), read_tags)

router
  .route("/:tag_id")
  .get(auth(auth_options_lax), read_tag)
  .put(auth(auth_options_strict), update_tag)
  .patch(auth(auth_options_strict), update_tag)
  .delete(auth(auth_options_strict), delete_tag)

export default router
