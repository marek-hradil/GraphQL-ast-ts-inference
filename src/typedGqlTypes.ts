import {
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
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

type GetReturnTypeIfFunction<T> = T extends () => any ? ReturnType<T> : T
type WrapMaybePromise<T> = Promise<T> | T

export const graphQLNonNullFactory = <T>(arg: T | null | undefined): T =>
  // @ts-expect-error
  new GraphQLNonNull(arg)

export const graphQLListFactory = <T>(arg: T): T[] =>
  // @ts-expect-error
  new GraphQLList(arg)

export const graphQLInputObjectTypeFactory = <
  Data extends {
    name: string
    fields: () => Record<string, { type: any }>
  }
>(
  gqlShape: Data
):
  | {
      [K in keyof ReturnType<Data['fields']>]: GetReturnTypeIfFunction<
        ReturnType<Data['fields']>[K]['type']
      >
    }
  | undefined =>
  // @ts-expect-error
  new GraphQLInputObjectType(gqlShape)

export const graphQLObjectTypeFactory = <
  Data extends {
    name: string
    interfaces?: any[]
    isTypeOf?: any
    fields: () => Record<
      string,
      {
        type: any
        args?: any
      }
    >
  }
>(
  gqlShape: Data,
  resolvers?: {
    [K in keyof ReturnType<Data['fields']>]?: {
      resolve: (
        parent: {
          [NK in keyof ReturnType<Data['fields']>]?: GetReturnTypeIfFunction<
            ReturnType<Data['fields']>[NK]['type']
          >
        },
        args: {
          [AK in keyof ReturnType<Data['fields']>[K]['args']]: GetReturnTypeIfFunction<
            ReturnType<Data['fields']>[K]['args'][AK]['type']
          >
        },
        context: any
      ) => WrapMaybePromise<ReturnType<typeof gqlShape['fields']>[K]['type']>
    }
  }
):
  | {
      [K in keyof ReturnType<Data['fields']>]?: GetReturnTypeIfFunction<
        ReturnType<Data['fields']>[K]['type']
      >
    }
  | undefined => {
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

  return graphQLEnumTypeFactory(typeName, simplifiedObj)
}

export const graphQLEnumTypeFactory = <T extends string>(
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
