import {
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLBoolean as _GraphQLBoolean,
  GraphQLFloat as _GraphQLFloat,
  GraphQLID as _GraphQLID,
  GraphQLInt as _GraphQLInt,
  GraphQLString as _GraphQLString,
} from 'graphql'

export const GraphQLInt = (_GraphQLInt as any) as number | undefined | null
export const GraphQLID = (_GraphQLID as any) as string | undefined | null
export const GraphQLString = (_GraphQLString as any) as string | undefined | null
export const GraphQLBoolean = (_GraphQLBoolean as any) as boolean | undefined | null
export const GraphQLFloat = (_GraphQLFloat as any) as number | undefined | null

type ReturnTypeIfFn<T> = T extends (...args: any[]) => any ? ReturnType<T> : T
// type MaybePromise<T> = Promise<T> | T

export const graphQLNonNull = <T>(arg: T | null | undefined): T =>
  // @ts-expect-error
  new GraphQLNonNull(arg)

export const graphQLList = <T>(arg: T): T[] =>
  // @ts-expect-error
  new GraphQLList(arg)

export const graphQLInputObjectType = <Fields extends Record<string, { type: any }>>(gqlShape: {
  name: string
  fields: () => Fields
}): { [K in keyof Fields]: ReturnTypeIfFn<Fields[K]['type']> } | undefined =>
  // @ts-expect-error
  new GraphQLInputObjectType(gqlShape)

export const graphQLObjectType = <Fields extends Record<string, { type: any; args?: any }>>(
  gqlShape: {
    name: string
    interfaces?: any[]
    isTypeOf?: any
    fields: () => Fields
  },
  resolvers?: {
    [K in keyof Fields]?: {
      resolve: (
        parent: {
          [NestedKey in keyof Fields]?: ReturnTypeIfFn<Fields[NestedKey]['type']>
        },
        args: {
          [ArgKey in keyof Fields[K]['args']]: ReturnType<
            typeof gqlShape['fields']
          >[K]['args'][ArgKey]['type']
        },
        context: any
      ) => any
      // ) => MaybePromise<ReturnTypeIfFn<Fields[K]['type']>>
    }
  }
): { [K in keyof Fields]?: ReturnTypeIfFn<Fields[K]['type']> } | undefined => {
  const a = new GraphQLObjectType({
    ...gqlShape,
    fields: () => {
      const fieldsWithResolvers: Record<string, any> = {}

      const gqlFields = gqlShape.fields()

      for (const key in gqlFields) {
        fieldsWithResolvers[key] = {
          ...gqlFields[key],
          // TODO:
          // > add support for recursive
          // > check if type is fn and get return value
          resolve: resolvers?.[key]?.resolve,
        }
      }

      return fieldsWithResolvers
    },
  }) as any

  return a
}

// ------------- enums -------------
export const graphQLSimpleEnum = <T extends string>(
  typeName: string,
  _possibleValues: Record<T, any>
) => {
  const simplifiedObj = Object.fromEntries(
    Object.entries(_possibleValues).map(([k, value]) => [k, { value }])
  ) as {
    [K in T]: { value: K }
  }

  return graphQLEnumType(typeName, simplifiedObj)
}

export const graphQLEnumType = <T extends string>(
  name: string,
  values: Record<T, { value: any }>
): T | undefined =>
  // @ts-expect-error
  new GraphQLEnumType({
    name,
    values,
  })

// mutations

export const gqlMutation = <
  Config extends {
    type: any
    args: Record<string, { type: any }>
  }
>(
  config: Config,
  resolve: (
    args: { [K in keyof Config['args']]: Config['args'][K]['type'] },
    context: any
  ) => Config['type']
) => {
  return {
    ...config,
    resolve: (a: undefined, ...rest: Parameters<typeof resolve>) => resolve(...rest),
  }
}

export const graphQLScalarType = <T>(
  config: ConstructorParameters<typeof GraphQLScalarType>[0]
): T =>
  // @ts-expect-error
  new GraphQLScalarType(config)

// is used to be resolved by `ReturnTypeIfFn<...>` generic
export const circularDependencyTsHack = <T>(arg: T): T => {
  const shittyCode = arg as any
  return shittyCode()
}
