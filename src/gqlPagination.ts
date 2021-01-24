import {
  GraphQLInt,
  graphQLInputObjectType,
  graphQLList,
  graphQLNonNull,
  graphQLObjectType,
} from './typedGqlTypes'

export const listPaginationArgs = (name: string) =>
  graphQLNonNull(
    graphQLInputObjectType({
      name: `${name}_pagination`,
      fields: () => ({
        offset: {
          type: graphQLNonNull(GraphQLInt),
        },
        limit: {
          type: graphQLNonNull(GraphQLInt),
        },
      }),
    })
  )

export const wrapPaginationList = <T>(name: string, type: T) =>
  graphQLObjectType({
    name: `connection_${name}`,
    fields: () => ({
      totalCount: {
        type: GraphQLInt,
      },
      items: {
        type: graphQLList(type),
      },
    }),
  })
