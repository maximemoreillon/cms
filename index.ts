import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { version, author } from "./package.json"
import {
  url as neo4j_url,
  get_connected as neo4j_connected,
  init as db_init,
} from "./db"
import { Request, Response, NextFunction } from "express"
import routerV1 from "./routes/v1"
import promBundle from "express-prom-bundle"

dotenv.config()

console.log(`CMS v${version}`)

db_init()

const { APP_PORT = 80, IDENTIFICATION_URL } = process.env
const promOptions = { includeMethod: true, includePath: true }

const app = express()
app.use(express.json({ limit: "50mb" }))
app.use(cors())
app.use(promBundle(promOptions))

app.get("/", (req, res) => {
  res.send({
    application_name: "CMS",
    author,
    version,
    neo4j: {
      url: neo4j_url,
      connected: neo4j_connected(),
    },
    auth: {
      identification_url: IDENTIFICATION_URL,
    },
  })
})

app.use("/", routerV1)
app.use("/v1", routerV1) // alias

// Express error handler
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error(error)
  let { statusCode = 500, message = error } = error
  if (isNaN(statusCode) || statusCode > 600) statusCode = 500
  res.status(statusCode).send(message)
})

app.listen(APP_PORT, () =>
  console.log(`[Express] listening on port ${APP_PORT}`)
)

export default app
