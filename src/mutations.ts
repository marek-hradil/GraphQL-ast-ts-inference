/* eslint-disable @typescript-eslint/no-unused-vars */
import { CosmonautType, gqlAppData } from './gql'
import {
  GraphQLString,
  gqlMutation,
  graphQLInputObjectType,
  graphQLNonNull,
} from './typedGqlTypes'

// async circular dependency
export const addAstronautMutation = () =>
  gqlMutation(
    {
      type: CosmonautType,
      args: {
        input: {
          type: graphQLNonNull(
            graphQLInputObjectType({
              name: 'logMutationInput',
              fields: () => ({
                firstName: {
                  type: graphQLNonNull(GraphQLString),
                },
                lastName: {
                  type: graphQLNonNull(GraphQLString),
                },
              }),
            })
          ),
        },
      },
    },
    args => {
      const cosmonautToAdd = {
        id: `${Math.random()}`,
        firstName: args.input.firstName,
        lastName: args.input.lastName,
        index: gqlAppData.cosmonauts.items.length,
      }

      gqlAppData.cosmonauts.items.push(cosmonautToAdd)

      return cosmonautToAdd
    }
  )
