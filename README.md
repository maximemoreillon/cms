# CMS


[![pipeline status](https://gitlab.com/moreillon_k8s/cms/cms_back/badges/master/pipeline.svg)](https://gitlab.com/moreillon_k8s/cms/cms_back/-/commits/master)
[![coverage report](https://gitlab.com/moreillon_k8s/cms/cms_back/badges/master/coverage.svg)](https://gitlab.com/moreillon_k8s/cms/cms_back/-/commits/master)

A Simple CMS built using Neo4J and Express. It manages article and their tags as nodes of adirected graph.

![This is an image](https://myoctocat.com/assets/images/base-octocat.svg)

Project page: https://articles.maximemoreillon.com/articles/112

## API

### Articles
| Route | Method | query/body | Description |
| --- | --- | --- | --- |
| /articles | GET | - | Get article list |
| /articles | POST | coming soon | Create an article |
| /articles/{article ID} | GET | - | Get a single article |
| /articles/{article ID} | PUT | Coming soon | Updates a single article |
| /articles/{article ID} | DELETE | - | Deletes a single article |
| /articles/{article ID}/tags | GET | - | Get the tags of an article |
| /articles/{article ID}/author | GET | - | Get the author of an article |

### Tags
| Route | Method | query/body | Description |
| --- | --- | --- | --- |
| /tags | GET | - | Get tag list |
| /tags | POST | tag_name | Create a tag |
