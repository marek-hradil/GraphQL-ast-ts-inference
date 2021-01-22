import * as bodyParser from 'body-parser'
import { graphqlHTTP } from 'express-graphql'
import express from 'express'
import graphqlPlayground from 'graphql-playground-middleware-express'

import schema from './gql'

const port = process.env.PORT || 4444
const app = express()

app.use(bodyParser.json())
app.use(bodyParser.text({ type: 'application/graphql' }))

app.get(
  '/playground',
  graphqlPlayground({
    endpoint: '/graphql',
    subscriptionEndpoint: '/subscriptions',
  })
)

app.use(
  '/graphql',
  graphqlHTTP({
    schema,
  })
)

app.listen(port)

app.get('*', (req, res) => {
  res.send(`<h1>${Array.from({ length: 1000 }, () => ' 🤷‍♀️ ').join('404')}</h1>`)
})

console.info(`
--------- server is ready now ---------
GQL URL: http://localhost:${port}/graphql
Playground URL: http://localhost:${port}/playground
---------------------------------------
`)
