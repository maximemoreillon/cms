import Ajv from "ajv"
const ajv = new Ajv() // options can be passed, e.g. {allErrors: true}

const schema = {
  type: "object",
  properties: {
    title: { type: "string" },
    summary: { type: "string" },
    thumbnail_src: { type: "string" },
    content: { type: "string" },
    published: { type: "boolean" },
  },
  additionalProperties: false,
}

const validate = ajv.compile(schema)

export default validate
