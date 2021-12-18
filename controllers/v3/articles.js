const {driver} = require('../../db.js')
const get_current_user_id = require('../../identification.js')
const {error_handling} = require('../../utils.js')

const get_article_id = (req) => {

  return req.query.id
    ?? req.query.article_id
    ?? req.params.article_id

}

exports.get_article = (req, res) => {
  // Route to get a single article using its ID

  const article_id = get_article_id(req)
  if(!article_id) return res.status(400).send(`Missing article ID`)

  const current_user_id = get_current_user_id(res)

  const query = `
    // Match article by ID
    MATCH (article:Article)
    WHERE article._id = $article_id

    // Show only published articles or articles written by current user
    WITH article
    MATCH (article)-[authorship:WRITTEN_BY]->(author:User)
    WHERE article.published = true
      ${res.locals.user ? 'OR author._id = $current_user_id' : ''}

    // Update view count
    SET article.views = coalesce(article.views, 0) + 1

    // Get the tags of the article
    // OPTIONAL MATCH because some articles might not have a tag
    WITH article, author, authorship
    OPTIONAL MATCH (tag:Tag)-[:APPLIED_TO]->(article)

    // Tags is an array
    RETURN
      properties(article) as article,
      properties(author) as author,
      properties(authorship) as authorship,
      collect(properties(tag)) as tags
    `

  const params = { current_user_id, article_id }

  const session = driver.session()
  session.run(query,params)
  .then(({records}) => {

    if (!records.length) throw {code: 404, message: `Article ${article_id} not found`}

    const record = records[0]

    // remove password_hashed
    const author = record.get('author')
    delete author.password_hashed

    const article = {
      ...record.get('article'),
      author,
      authorship: record.get('authorship'),
      tags: record.get('tags')
    }
    res.send(article)
    console.log(`Article ${article_id} queried`)
  })
  .catch(error => { error_handling(error, res) })
  .finally(() => { session.close() })

}



exports.create_article = (req, res) => {
  // Route to create an article

  const current_user_id = get_current_user_id(res)
  if(!current_user_id) {
    return res.status(403).send(`This action is restricted to authenticated users`)
  }

  const {
    article,
    tag_ids = []
  } = req.body
  
  if(!article) {
    return res.status(400).send(`Missing article in request body`)
  }


  const query = `
    // create the article node
    CREATE (article:Article)

    // Set initial properties
    SET article = $article
    SET article.views = 0
    SET article._id = randomUUID()

    // Add relationship to author
    WITH article
    MATCH (author:User)
    WHERE author._id = $author_id
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
    WHERE tag._id = tag_id
    WITH collect(tag) as tags, article
    FOREACH(tag IN tags | MERGE (article)<-[:APPLIED_TO]-(tag))

    // Return the article
    RETURN properties(article) AS article
    `

  const params = {
    author_id: current_user_id,
    article,
    tag_ids,
  }

  const session = driver.session()
  session.run(query, params)
  .then( ({records}) => {

    if(!records.length) throw {code: 400, message: `Article could not be created`}
    const article = records[0].get('article')
    console.log(`Article ${article._id} created`)
    res.send(article)

  })
  .catch(error => { error_handling(error, res) })
  .finally(() => { session.close() })
}

exports.update_article = (req, res) => {
  // Route to update an article

  const current_user_id = get_current_user_id(res)
  if(!current_user_id) {
    return res.status(403).send(`This action is restricted to authenticated users`)
  }

  const article_id = get_article_id(req)
  if(!article_id) {
    return res.status(400).send(`Missing article ID`)
  }

  // Not using the body directly because tag IDs is also provided
  const article_properties = req.body.article_properties
    || req.body.properties
    || req.body.article.properties

  // POTENTIALLY JUST BODY

  const query = `
    // Find the article node and update it
    MATCH (article:Article)-[rel:WRITTEN_BY]->(author:User)
    WHERE article._id = $article_id
      AND author._id = $author_id

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
    WHERE tag._id = tag_id
    WITH collect(tag) as tags, article
    FOREACH(tag IN tags | MERGE (article)<-[:APPLIED_TO]-(tag))

    // Return the article
    RETURN properties(article) AS article
    `

  const params = {
    author_id: current_user_id,
    article_id,
    article_properties,
    tag_ids: req.body.tag_ids,
  }

  const session = driver.session()
  session.run(query, params)
  .then( ({records}) => {

    if(!records.length ) {
      return res.status(400).send(`Article could not be updated, probably due to insufficient permissions`)
    }

    console.log(`Article ${article_id} updated`)
    res.send(records[0].get('article'))
  })

  .catch(error => {
    console.log(error)
    res.status(500).send(`Error updating article: ${error}`)
  })
  .finally(() => { session.close() })

}

exports.delete_article = (req, res) => {

  const current_user_id = get_current_user_id(res)
  if(!current_user_id) {
    return res.status(403).send(`This action is restricted to authenticated users`)
  }

  const article_id = req.params.article_id
  if(!article_id) {
    return res.status(400).send(`Missing article ID`)
  }

  const session = driver.session()

  const query = `
    MATCH (article:Article)-[:WRITTEN_BY]->(author:User)
    WHERE article._id = $article_id
      AND author._id = $author_id

    // Deal with comments
    WITH article
    OPTIONAL MATCH (comment:Comment)-[:ABOUT]->(article)
    DETACH DELETE comment

    // Delete article itself
    DETACH DELETE article
    RETURN $article_id as article_id
    `

  const params = {
    author_id: current_user_id,
    article_id,
  }

  session.run(query,params)
  .then( ({records}) => {

    if(!records.length) throw {code: 400, message: `Article could not be deleted, probably due to insufficient permissions`}


    console.log(`Article ${article_id} deleted`)
    res.send({article_id})

  })
  .catch(error => {error_handling(error, res)})
  .finally(() => { session.close() })
}


exports.get_article_list = (req, res) => {
    // Route to get multiple articles

    const current_user = res.locals.user
    const current_user_id = get_current_user_id(res)

    const {
      author_id,
      tag_id,
      search,
      sort,
      order = 'DESC',
      start_index = 0,
      batch_size = 10,
    } = req.query


    const sorting = () => {


      let sorting = 'authorship.creation_date'
      const sorting_lookup = {date : 'authorship.creation_date', title: 'article.title', views: 'article.views'}

      if(sort && sorting_lookup[sort]) sorting = sorting_lookup[sort]

      return sorting
    }


    const batching = () => {
      return `WITH article_count,
        article_collection[toInteger(${start_index})..toInteger(${start_index})+toInteger(${batch_size})] AS articles`
    }



    const query = `
      // Get all articles and teir author
      MATCH (article:Article)-[:WRITTEN_BY]->(author:User)

      // Show only published articles or articles written by user
      WHERE article.published = true
      ${current_user ? `OR author._id = $current_user_id` : ``}

      // Using search bar to find matching titles
      WITH article
      ${search ?  `WHERE toLower(article.title) CONTAINS toLower($search)` : ``}

      // Filter by tag if provided
      WITH article
      ${tag_id ? 'MATCH (tag:Tag)-[:APPLIED_TO]->(article) WHERE tag._id = $tag_id' : ''}

      // Filter by user if provided
      WITH article
      ${author_id ? 'MATCH (author:User)<-[WRITTEN_BY]-(article) WHERE author._id = $author_id' : ''}

      // Get tags
      WITH article
      OPTIONAL MATCH (tag:Tag)-[:APPLIED_TO]->(article)

      // Author
      WITH article, COLLECT(properties(tag)) AS  tags
      MATCH (article)-[authorship:WRITTEN_BY]->(author:User)

      // Sorting and ordering
      // Can sort by views, date or title (alphabetically)
      WITH article, authorship, author, tags
      ORDER BY ${sorting()} ${order === 'ASC' ? 'ASC' : 'DESC'}



      // Collect everything for count and batching
      WITH COUNT(DISTINCT(article)) AS article_count,
        COLLECT({
          article: properties(article),
          author: properties(author),
          authorship: properties(authorship),
          tags: tags
        }) AS article_collection

      // Return only articles by batch
      ${batching()}

      // Return articles
      RETURN article_count, articles
      `

    //


    const params = {
        current_user_id,
        author_id,
        tag_id,
        search,
        sort,
        order,
        start_index,
        batch_size,
      }



    const session = driver.session()
    session.run(query , params)
    .then(({records}) => {

      // TODO: remove user password!

      const output = {
        article_count: records[0].get('article_count'),
        articles: records[0].get('articles').map(a => ({
          ...a.article,
          author: a.author,
          authorship: a.authorship,
          tags: a.tags,
        })),
      }

      output.articles.forEach((article) => {
        delete article.author.password_hashed
      })



      res.send(output)
      console.log(`Queried article list`)
    })
    .catch(error => {
      console.log(error)
      res.status(500).send(`Error getting articles: ${error}`)
    })
    .finally(() => { session.close() })
}
