import { GqlUser } from './GqlUser'
import { entities } from '../../database/entities'
import { getRepository } from 'typeorm'
import { graphQLNonNull, graphqlSubQueryType } from '../../libs/gqlLib/typedGqlTypes'
import { listPaginationArgs, wrapPaginationList } from '../../gqlPagination'

export const userQueryFields = () =>
  graphqlSubQueryType(
    {
      users: {
        args: {
          pagination: {
            type: listPaginationArgs('usersQuery'),
          },
        },
        type: wrapPaginationList('users', graphQLNonNull(GqlUser)),
      },
    },
    {
      users: {
        resolve: async args => {
          const repository = getRepository(entities.User)

          const [users, count] = await repository.findAndCount({
            skip: args.pagination.offset,
            take: args.pagination.limit,
          })

          return {
            count,
            items: users,
          }
        },
      },
    }
  )
