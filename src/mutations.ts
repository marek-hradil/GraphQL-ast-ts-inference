/* eslint-disable @typescript-eslint/no-unused-vars */
import { CosmonautType, gqlAppData } from './gql'
import {
  GraphQLString,
  gqlMutation,
  graphQLInputObjectTypeFactory,
  graphQLNonNullFactory,
} from './typedGqlTypes'

// async circular dependency
export const addAstronautMutation = () =>
  gqlMutation(
    {
      type: CosmonautType,
      args: {
        input: {
          type: graphQLNonNullFactory(
            graphQLInputObjectTypeFactory({
              name: 'logMutationInput',
              fields: () => ({
                firstName: {
                  type: graphQLNonNullFactory(GraphQLString),
                },
                lastName: {
                  type: graphQLNonNullFactory(GraphQLString),
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
