import { Router } from "express"
import articlesRouter from "./articles"
import authorsRouter from "./authors"
import tagsRouter from "./tags"

const router = Router()

router.use("/articles", articlesRouter)
router.use("/tags", tagsRouter)
router.use("/authors", authorsRouter)
//router.use('/comments', require('./comments.js'))

export default router
