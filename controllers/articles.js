const driver = require('../db_config.js')
const return_user_id = require('../identification.js')


const get_article_id = (req) => {

  return req.query.id
    || req.query.article_id
    || req.params.article_id

}

exports.get_article = (req, res) => {
  // Route to get a single article using its ID

  const article_id = req.query.id
    || req.query.article_id
    || req.params.article_id

  const session = driver.session()
  session
  .run(`
    // Match article by ID
    MATCH (article:Article)
    WHERE id(article) = toInteger($article_id)

    // Show only published articles or articles written by current user
    WITH article
    MATCH (article)-[authorship:WRITTEN_BY]->(author:User)
    WHERE article.published = true
      ${res.locals.user ? 'OR id(author)=toInteger($current_user_id)' : ''}

    // Update view count
    SET article.views = coalesce(article.views, 0) + 1

    // Get the tags of the article
    // OPTIONAL MATCH because some articles might not have a tag
    WITH article, author, authorship
    OPTIONAL MATCH (tag:Tag)-[:APPLIED_TO]->(article)

    // Tags is an array
    RETURN article, author, authorship, collect(tag) as tags
    `, {
    current_user_id: return_user_id(res),
    article_id: article_id,
  })
  .then(result => {
    console.log(`Article ${article_id} queried`)
    res.send(result.records)
  })
  .catch(error => {
    console.log(error)
    res.status(500).send(`Error getting article: ${error}`)
  })
  .finally(() => { session.close() })

}



exports.create_article = (req, res) => {
  // Route to create an article

  var session = driver.session()
  session
  .run(`
    // create the article node
    CREATE (article:Article)

    // Set properties
    SET article = $article.properties

    // Add relationship to author
    WITH article
    MATCH (author:User)
    WHERE id(author)=toInteger($author_id)
    MERGE (article)-[authorship:WRITTEN_BY]->(author)

    // Save dates in the relationship
    SET authorship.creation_date = date()
    SET authorship.edition_date = date()

    // Deal with tags
    // EMPTY LISTS ARE A PAIN
    WITH article

    UNWIND
      CASE
        WHEN $tag_ids = []
          THEN [null]
        ELSE $tag_ids
      END AS tag_id

    OPTIONAL MATCH (tag:Tag)
    WHERE id(tag) = toInteger(tag_id)
    WITH collect(tag) as tags, article
    FOREACH(tag IN tags | MERGE (article)<-[:APPLIED_TO]-(tag))

    // Return the article
    RETURN article

    `, {
      author_id: res.locals.user.identity.low,
      article: req.body.article,
      tag_ids: req.body.tag_ids,
  })
  .then(result => {
    console.log(`Article created`)
    res.send(result.records)
  })
  .catch(error => {
    console.log(error)
    res.status(500).send(`Error creating article: ${error}`)
  })
  .finally(() => { session.close() })
}

exports.update_article = (req, res) => {
  // Route to update an article

  const article_id = req.params.article_id
    || req.body.article_id
    || req.body.article.identity.low

  // Not using the body directly because tag IDs is also provided
  const article_properties = req.body.article_properties
    || req.body.properties
    || req.body.article.properties


  const session = driver.session()
  session
  .run(`
    // Find the article node and update it
    MATCH (article:Article)-[rel:WRITTEN_BY]->(author:User)
    WHERE id(article) = toInteger($article_id)
      AND id(author)=toInteger($author_id)

    // Remove previously set properties
    REMOVE article.thumbnail_src
    REMOVE article.summary
    REMOVE article.title

    // Set the new properties
    // Might be better with a +=
    SET article += $article_properties

    // Update the edition date
    SET rel.edition_date = date()

    // Delete all relationships to tags so as to recreate the necessary ones
    WITH article
    OPTIONAL MATCH (article)<-[r:APPLIED_TO]-(tag:Tag)
    DELETE r

    // Deal with tags
    // EMPTY LISTS ARE A PAIN
    WITH article

    UNWIND
      CASE
        WHEN $tag_ids = []
          THEN [null]
        ELSE $tag_ids
      END AS tag_id

    OPTIONAL MATCH (tag:Tag)
    WHERE id(tag) = toInteger(tag_id)
    WITH collect(tag) as tags, article
    FOREACH(tag IN tags | MERGE (article)<-[:APPLIED_TO]-(tag))

    // Return the article
    RETURN article
    `, {
      article_id: article_id,
      article_properties: article_properties,
      tag_ids: req.body.tag_ids,
      author_id: res.locals.user.identity.low,
  })
  .then(result => {

    if(result.records.length === 0 ) {
      return res.status(400).send(`Article could not be updated, probably due to insufficient permissions`)
    }

    console.log(`Article ${article_id} updated`)
    res.send(result.records) })
  .catch(error => {
    console.log(error)
    res.status(500).send(`Error updating article: ${error}`)
  })
  .finally(() => { session.close() })

}

exports.delete_article = (req, res) => {

  let article_id = req.query.article_id
    || req.query.id
    || req.params.article_id

  var session = driver.session()
  session
  .run(`
    MATCH (article:Article)-[:WRITTEN_BY]->(author:User)
    WHERE id(article) = toInteger($article_id)
      AND id(author)=toInteger($author_id)

    // Deal with comments
    WITH article
    OPTIONAL MATCH (comment:Comment)-[:ABOUT]->(article)
    DETACH DELETE comment

    // Delete article itself
    DETACH DELETE article
    RETURN 'success'
    `, {
    author_id: res.locals.user.identity.low,
    article_id: article_id,
  })
  .then(result => {

    if(result.records.length === 0 ) {
      return res.status(400).send(`Article could not be deleted, probably due to insufficient permissions`)
    }

    console.log(`Article ${article_id} deleted`)
    res.send("Article deleted successfully")

  })
  .catch(error => {
    console.log(error)
    res.status(500).send(`Error deleting article: ${error}`)
  })
  .finally(() => { session.close() })
}


exports.get_article_list = (req, res) => {

    // Route to get multiple articles

    const privacy_query = () => {
      if(res.locals.user) return `OR id(author)=toInteger($current_user_id)`
      else return ``
    }

    const keyword_query = () => {
      if(req.query.search)  return `WHERE toLower(article.title) CONTAINS toLower($search)`
      else return ``
    }

    const sorting = () => {

      let sorting = 'authorship.edition_date'

      if(req.query.sort) {
        const sorting_lookup = {date : 'authorship.edition_date', title: 'article.title', views: 'article.views'}

        if(sorting_lookup[req.query.sort]) {
          console.log(`Valid sorting: ${sorting_lookup[req.query.sort]}`)
          sorting = sorting_lookup[req.query.sort]
        }
        else {
          console.log(`Invalid sorting: ${req.query.sort}`)
        }
      }

      return sorting
    }

    const ordering = () => {
      return req.query.order === 'ASC' ? 'ASC' : 'DESC'
    }

    var session = driver.session()
    session
    .run(`
      // Get all articles and teir author
      MATCH (article:Article)-[:WRITTEN_BY]->(author:User)

      // Show only published articles or articles written by user
      WHERE article.published = true
      ${privacy_query()}

      // Using search bar to find matching titles
      WITH article
      ${keyword_query()}

      // Filter by tag if provided
      WITH article
      ${req.query.tag_id ? 'MATCH (tag:Tag)-[:APPLIED_TO]->(article) WHERE id(tag) = toInteger($tag_id)' : ''}

      // Filter by user if provided
      WITH article
      ${req.query.author_id ? 'MATCH (author:User)<-[WRITTEN_BY]-(article) WHERE id(author) = toInteger($author_id)' : ''}

      // Sorting and ordering
      // THIS IS A MESS BECAUSE NEO4J DOES NOT PARSE PARAMETERS PROPERLY HERE
      WITH article
      MATCH (article)-[authorship:WRITTEN_BY]->(:User)
      WITH article, authorship
      ORDER BY ${sorting()} ${ordering()}

      // Collect everything for count
      WITH count(article) as article_count, collect(article) as article_collection

      // Return only articles by batch
      WITH article_count,
      article_collection[${req.query.start_index ? 'toInteger($start_index)' : '0' }..${req.query.start_index ? 'toInteger($start_index)' : '0' }+${req.query.batch_size ? 'toInteger($batch_size)' : '10' }]
      AS article_batch
      UNWIND article_batch AS article

      // Get the author and its relationship to author
      WITH article, article_count
      MATCH (article)-[authorship:WRITTEN_BY]->(author:User)

      // Get the tags of the article
      // OPTIONAL MATCH because some articles have no tag
      WITH article, article_count, author, authorship
      OPTIONAL MATCH (tag:Tag)-[:APPLIED_TO]->(article)

      // Return articles
      RETURN article, article_count, author, authorship, collect(tag) as tags
      `, {
        current_user_id: return_user_id(res),
        author_id: req.query.author_id,
        tag_id: req.query.tag_id,
        start_index: req.query.start_index,
        search: req.query.search,
        sorting: req.query.sort,
        order: req.query.order,
        batch_size: req.query.batch_size,
      })
    .then(result => {
      console.log(`Requested article list`)
      res.send(result.records)
    })
    .catch(error => {
      console.log(error)
      res.status(500).send(`Error getting articles: ${error}`)
    })
    .finally(() => { session.close() })
}
