/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  GraphQLString,
  gqlMutation,
  graphQLInputObjectTypeFactory,
  graphQLNonNullFactory,
} from './typedGqlTypes'
import { MeType, gqlAppData } from './gql'

// async circular dependency
export const addFriendMutation = () =>
  gqlMutation(
    {
      type: MeType,
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
      gqlAppData.friends.items.push({
        id: `${Math.random()}`,
        firstName: args.input.firstName,
        lastName: args.input.lastName,
      })

      return gqlAppData
    }
  )
