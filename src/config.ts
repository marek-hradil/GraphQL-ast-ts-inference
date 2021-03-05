import {
  getNumberFromEnvParser,
  getStringEnumFromEnvParser,
  getStringFromEnvParser,
} from './config/configEnvParsers'
import { validateConfig } from './config/validateConfig'

export const appConfig = validateConfig({
  PORT: getNumberFromEnvParser('PORT'),
  NAME: getStringFromEnvParser('NAME'),
  ENVIRONMENT: getStringEnumFromEnvParser('ENVIRONMENT', [
    'production',
    'stage-1',
    'stage-2',
  ] as const),
  NODE_ENV: getStringEnumFromEnvParser('NODE_ENV', ['production', 'development'] as const),
})
