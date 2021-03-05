import * as bodyParser from 'body-parser'
import { appConfig } from './config'
import { graphqlHTTP } from 'express-graphql'
import express from 'express'
import graphqlPlayground from 'graphql-playground-middleware-express'
import schema from './gql'

const app = express()

process.on('uncaughtException', err => {
  console.error(err)
})
process.on('unhandledRejection', err => {
  console.error(err)
})

const startServer = async () => {
  const port = appConfig.PORT
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
}

const stopServer = async (server: any) => {
  // TODO: TypeError: Cannot read property 'close' of undefined
  server.close()
  if (appConfig.ENVIRONMENT !== 'production') {
    console.info('----------- server stopped ------------')
  }
}

export { startServer, stopServer }
