import { GqlUser } from './GqlUser'
import {
  GraphQLInt,
  GraphQLString,
  gqlMutation,
  graphQLInputObjectType,
  graphQLNonNull,
} from '../../libs/gqlLib/typedGqlTypes'
import { User } from '../../database/EntityUser'
import { entities } from '../../database/entities'
import { getRepository } from 'typeorm'

// async circular dependency
export const addUserMutation = () =>
  gqlMutation(
    {
      type: GqlUser,
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
                age: {
                  type: graphQLNonNull(GraphQLInt),
                },
              }),
            })
          ),
        },
      },
    },
    async args => {
      const repository = getRepository(User)

      const user = new entities.User()
      user.firstName = args.input.firstName
      user.lastName = args.input.lastName
      user.age = args.input.age

      return repository.save(user)
    }
  )
