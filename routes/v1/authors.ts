import { Router } from "express"

import { read_authors, read_author } from "../../controllers/v1/authors"

const router = Router()

router.route("/").get(read_authors)

router.route("/:author_id").get(read_author)

export default router
