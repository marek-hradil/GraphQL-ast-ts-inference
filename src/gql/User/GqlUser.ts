/* eslint-disable @typescript-eslint/no-unused-vars */
import { GqlPost } from '../Post/GqlPost'
import {
  GraphQLID,
  GraphQLInt,
  GraphQLString,
  graphQLSimpleEnum,
} from '../../libs/gqlLib/typedGqlTypes'
import { UserRole } from '../../database/EntityUser'
import { entities } from '../../database/entities'
import { getRepository } from 'typeorm'
import { graphQLNonNull, graphQLObjectType } from '../../libs/gqlLib/typedGqlTypes'
import { listPaginationArgs, wrapPaginationList } from '../../gqlPagination'

const GqlUserRole = graphQLSimpleEnum(
  'UserRoleEnum',
  // TODO: Object.entries is not working for Typescript enum type
  Object.fromEntries(Object.values(UserRole).map(i => [i, i]))
)

export const GqlUser = graphQLObjectType(
  {
    name: 'User',
    fields: () => ({
      id: {
        type: graphQLNonNull(GraphQLID),
      },
      firstName: {
        type: GraphQLString,
      },
      email: {
        type: GraphQLString,
      },
      age: {
        type: GraphQLInt,
      },
      profileImgUrl: {
        type: GraphQLString,
      },
      lastName: {
        type: GraphQLString,
      },
      fullName: {
        type: GraphQLString,
      },
      index: {
        type: GraphQLInt,
      },
      role: {
        type: GqlUserRole,
      },
      posts: {
        args: {
          pagination: {
            type: listPaginationArgs('user_posts_args'),
          },
        },
        type: wrapPaginationList('user_posts', graphQLNonNull(GqlPost)),
      },
    }),
  },
  {
    id: {
      resolve: p => `User:${p.id}`,
    },
    fullName: {
      resolve: p => `${p.firstName} ${p.lastName}`,
    },
    posts: {
      resolve: async (p, args) => {
        const repository = getRepository(entities.Post)

        const [posts, count] = await repository.findAndCount({
          skip: args.pagination.offset,
          take: args.pagination.limit,
          where: {
            authorId: parseInt(p.id!, 10),
          },
        })

        return {
          count,
          items: posts,
        }
      },
    },
  }
)
