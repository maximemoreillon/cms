import neo4j from "neo4j-driver"

const {
  NEO4J_URL = "bolt://neo4j:7687",
  NEO4J_USERNAME = "neo4j",
  NEO4J_PASSWORD = "neo4jpassword",
} = process.env

const auth = neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD)
const options = { disableLosslessIntegers: true }
export const driver = neo4j.driver(NEO4J_URL, auth, options)

let connected = false
export const init = async () => {
  console.log("[Neo4J] Initializing DB")

  const id_setting_query = `
  MATCH (n)
  WHERE ((n:Article) or (n:Tag))
    AND n._id IS NULL
  SET n._id = toString(id(n))
  RETURN COUNT(n) as count
  `

  const session = driver.session()

  try {
    const { records } = await session.run(id_setting_query)
    const count = records[0].get("count")
    console.log(`[Neo4J] ID of ${count} nodes have been set`)
    // await session.run(index_query)
    // console.log(`[Neo4J] Index set on _id`)
    connected = true
    console.log(`[Neo4J] Connection established`)
  } catch (e) {
    console.log(e)
    console.log(`[Neo4J] init failed, retrying in 10s`)
    setTimeout(init, 10000)
  } finally {
    session.close()
  }
}

export const url = NEO4J_URL
export const get_connected = () => connected
