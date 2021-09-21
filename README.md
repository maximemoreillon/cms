# CMS
A Simple CMS built built using Neo4J, Express and TipTap

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
| /articles/{article ID}/comments | GET | - | Get the comments of an article |
| /articles/{article ID}/author | GET | - | Get the author of an article |

### Tags
| Route | Method | query/body | Description |
| --- | --- | --- | --- |
| /tags | GET | - | Get tag list |
| /tags | POST | tag_name | Create a tag |
