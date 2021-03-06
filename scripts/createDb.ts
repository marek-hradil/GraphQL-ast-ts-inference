import { Client } from 'pg'
import { appEnvs } from '../src/appEnvs'
import { dbConnection } from '../src/database/dbCore'
import { getConnection } from 'typeorm'
import { knex } from 'knex'

const clientToPostgresDb = knex({
  client: 'pg',
  connection: {
    host: appEnvs.pgDb.HOST,
    user: appEnvs.pgDb.USER,
    password: appEnvs.pgDb.PASSWORD,
    // do i need to connect directly into `postgres` database?
    database: 'postgres',
  },
})

const createDb = async () => {
  if (appEnvs.ENVIRONMENT === 'production') {
    throw new Error(`Can't change prod database`)
  }

  try {
    console.time('create/renew-database')

    const databaseName = appEnvs.pgDb.DB_NAME

    try {
      await clientToPostgresDb.raw(`DROP DATABASE IF EXISTS ${databaseName};`)
    } catch (e) {
      console.info('ups... something is wrong. Cant drop database')
    }
    try {
      await clientToPostgresDb.raw(`CREATE DATABASE ${databaseName};`)
    } catch (e) {
      console.info('CREATE DB err -> this is probably not error... just db is already created')
    }

    const clientToDb = new Client({
      host: appEnvs.pgDb.HOST,
      user: appEnvs.pgDb.USER,
      password: appEnvs.pgDb.PASSWORD,
      database: appEnvs.pgDb.DB_NAME,
    })

    clientToDb.connect()
    await clientToDb.query(`CREATE EXTENSION IF NOT EXISTS unaccent;`)

    // ----- Drop all tables ------
    await dbConnection
    // https://stackoverflow.com/a/63112753
    const tableEntities = await Promise.all(
      getConnection().entityMetadatas.map(e => getConnection().getRepository(e.name))
    )

    const tableNames = tableEntities.map(r => r.metadata.tableName)

    clientToDb.query(`DROP TABLE ${tableNames.join(', ')}`)
    console.timeEnd('create/renew-database')
  } catch (e) {
    console.error(e)
  }
}

export default createDb
