import { appEnvs } from '../appEnvs'
import { createConnection } from 'typeorm'
import { entities } from './entities'

export const dbConnection = createConnection({
  type: 'postgres',
  host: appEnvs.pgDb.HOST,
  port: appEnvs.pgDb.PORT,
  username: appEnvs.pgDb.USER,
  password: appEnvs.pgDb.PASSWORD,
  database: appEnvs.pgDb.DB_NAME,

  entities: Object.values(entities),

  // TODO: how to live with synchronize? TODO: add env?
  synchronize: appEnvs.ENVIRONMENT === 'dev' && appEnvs.NODE_ENV === 'development',
}).catch(error => console.error(error))
