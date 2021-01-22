import {
  GraphQLInt,
  graphQLInputObjectTypeFactory,
  graphQLListFactory,
  graphQLNonNullFactory,
  graphQLObjectTypeFactory,
} from './typedGqlTypes'

export const listPaginationArgs = (name: string) =>
  graphQLNonNullFactory(
    graphQLInputObjectTypeFactory({
      name: `${name}_pagination`,
      fields: () => ({
        offset: {
          type: graphQLNonNullFactory(GraphQLInt),
        },
        limit: {
          type: graphQLNonNullFactory(GraphQLInt),
        },
      }),
    })
  )

export const wrapPaginationList = <T>(name: string, type: T) =>
  graphQLObjectTypeFactory({
    name: `connection_${name}`,
    fields: () => ({
      totalCount: {
        type: GraphQLInt,
      },
      items: {
        type: graphQLListFactory(type),
      },
    }),
  })
