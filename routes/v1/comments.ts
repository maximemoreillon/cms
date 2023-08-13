import { Router } from "express"
import auth from "@moreillon/express_identification_middleware"
import { create_comment, delete_comment } from "../../controllers/v1/comments"

const { IDENTIFICATION_URL } = process.env

const router = Router()

const auth_options_strict = IDENTIFICATION_URL
  ? { url: IDENTIFICATION_URL }
  : undefined
const auth_options_lax = { ...auth_options_strict, lax: true }

router.route("/").post(auth(auth_options_lax), create_comment)

router.route("/:comment_id").delete(auth(auth_options_strict), delete_comment)

export default router
