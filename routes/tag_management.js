const express = require('express')
const auth = require('@moreillon/authentication_middleware')

const driver = require('../db_config.js')
const return_user_id = require('../identification.js')

var router = express.Router()

let get_tag = (req, res) => {
  // Route to get a single tag using its ID
  var session = driver.session()
  session
  .run(`
    MATCH (tag:Tag)
    WHERE id(tag) = toInt({tag_id})
    RETURN tag
    `, {
    tag_id: req.query.tag_id,
  })
  .then(result => { res.send(result.records[0].get('tag')) })
  .catch(error => { res.status(500).send(`Error getting tag: ${error}`) })
  .finally(() => { session.close() })
}

let create_tag = (req, res) => {
  // Route to create a single tag

  var session = driver.session()
  session
  .run(`
    MERGE (tag:Tag {name:{tag_name}})
    RETURN tag
    `, {
    tag_name: req.body.tag_name,
  })
  .then(result => { res.send(result.records) })
  .catch(error => { res.status(500).send(`Error creating tag: ${error}`) })
  .finally(() => { session.close() })
}

let update_tag = (req, res) => {
  // Route to update a single tag using

  if(!res.locals.user.properties.isAdmin) return res.status(403).send('Only an administrator can perform this operation')

  var session = driver.session()
  session
  .run(`
    MATCH (tag:Tag)
    WHERE id(tag) = toInt({tag}.identity.low)
    SET tag = {tag}.properties
    RETURN tag
    `, {
    tag: req.body.tag,
  })
  .then(result => { res.send(result.records) })
  .catch(error => { res.status(500).send(`Error updating tag: ${error}`) })
  .finally(() => { session.close() })
}

let delete_tag = (req, res) => {
  // Route to delete a single tag

  if(!res.locals.user.properties.isAdmin) return res.status(403).send('Only an administrator can perform this operation')

  var session = driver.session()
  session
  .run(`
    MATCH (tag:Tag)
    WHERE id(tag) = toInt({tag_id})
    DETACH DELETE tag
    `, {
    tag_id: req.query.tag_id,
  })
  .then(result => { res.send("Tag deleted successfully") })
  .catch(error => {
    console.error(error)
    res.status(500).send(`Error deleting tag: ${error}`)
  })
  .finally(() => { session.close() })
}

let get_tag_list = (req, res) => {
  // Route to get all tags

  var session = driver.session()
  session
  .run(`
    MATCH (tag:Tag)
    RETURN tag
    `, {})
  .then(result => { res.send(result.records) })
  .catch(error => { res.status(500).send(`Error getting tag list: ${error}`) })
  .finally(() => { session.close() })
}

let get_pinned_tags = (req, res) => {
  // Route to get navbar items
  var session = driver.session()
  session
  .run(`
    MATCH (tag:Tag {navigation_item: true})
    RETURN tag
    `, {})
  .then(result => { res.send(result.records) })
  .catch(error => { res.status(500).send(`Error getting navigation items: ${error}`) })
  .finally(() => { session.close() })
}

router.route('/')
  .get(get_tag)
  .post(auth.authenticate, create_tag)
  .put(auth.authenticate, update_tag)
  .delete(auth.authenticate, delete_tag)

router.route('/list')
  .get(get_tag_list)

router.route('/pinned')
  .get(get_pinned_tags)

module.exports = router
