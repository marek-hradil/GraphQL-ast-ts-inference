import { GraphQLID, GraphQLInt, GraphQLString, graphQLListFactory } from './typedGqlTypes'
import { GraphQLObjectType, GraphQLSchema } from 'graphql'
import { addFriendMutation } from './mutations'
import { graphQLNonNullFactory, graphQLObjectTypeFactory, graphQLSimpleEnum } from './typedGqlTypes'
import { listPaginationArgs, wrapPaginationList } from './gqlPagination'
//// data

export const gqlAppData = {
  id: '1',
  firstName: 'Jakub',
  lastName: 'Švehla',
  role: undefined,
  friends: {
    totalCount: 10,
    items: Array.from({ length: 3 }, (_, index) => ({
      id: `User${index}`,
      firstName: `${index} firstName`,
      lastName: `${index} lastName`,
    })),
  },
}

const authHOF = <Args extends any[], T>(fn: (...args: Args) => T) => (...args: Args) => {
  // TODO: auth from context monkey patch
  // TODO: context
  // args[3]

  return fn(...args)
}

// shapes

const UserObject = graphQLObjectTypeFactory(
  {
    name: 'User',
    fields: () => ({
      id: {
        type: graphQLNonNullFactory(GraphQLID),
      },
      firstName: {
        type: GraphQLString,
      },
      age: {
        type: GraphQLInt,
      },
      lastName: {
        type: GraphQLString,
      },
      fullName: {
        args: {
          prefix: {
            type: graphQLNonNullFactory(graphQLListFactory(graphQLNonNullFactory(GraphQLString))),
          },
        },
        type: GraphQLString,
      },
      // TODO: add runtime circular dependencies
      // user2: {
      //   type: UserObject2,
      // },
    }),
  },
  {
    id: {
      resolve: parent => `Friend:${parent.id}`,
    },
    fullName: {
      resolve: (parent, args) => `${args.prefix.join('-')} ${parent.firstName} ${parent.lastName}`,
    },
  }
)

const roleEnum = Object.freeze({
  admin: 'admin',
  developer: 'developer',
} as const)

const RoleType = graphQLSimpleEnum('enumType', roleEnum)

export const MeType = graphQLObjectTypeFactory(
  {
    name: 'Me',
    fields: () => ({
      id: {
        type: graphQLNonNullFactory(GraphQLID),
      },
      firstName: {
        type: GraphQLString,
      },
      lastName: {
        type: GraphQLString,
      },
      name: {
        type: GraphQLString,
      },
      role: {
        type: RoleType,
      },
      friends: {
        args: {
          pagination: {
            type: listPaginationArgs('users'),
          },
        },
        type: wrapPaginationList('users', graphQLNonNullFactory(UserObject)),
      },
    }),
  },
  {
    id: {
      resolve: parent => `Me:${parent.id}`,
    },
    name: {
      resolve: parent => `${parent.firstName} ${parent.lastName}`,
    },
    friends: {
      resolve: authHOF((parent, args) => {
        const offset = args.pagination.offset ?? 0
        return {
          totalCount: parent.friends?.items?.length ?? 0,
          items: parent.friends?.items?.slice(offset, offset + args.pagination.limit),
        }
      }),
    },
  }
)

const me = {
  id: '1',
  firstName: 'Jakub',
  lastName: 'Švehla',
  age: 1,
  role: roleEnum.admin,
  friends: {
    items: Array.from({ length: 10 }, (_, index) => ({
      id: index,
      firstName: `${index} firstName`,
      lastName: `${index} lastName`,
    })),
  },
}

// TODO: add mutations POC
const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    // @ts-ignore
    fields: () => ({
      me: {
        type: MeType,
        resolve() {
          return gqlAppData
        },
      },
    }),
  }),
  mutation: new GraphQLObjectType({
    name: 'RootMutationType',
    // @ts-ignore
    fields: () => ({
      addFriendMutation: addFriendMutation(),
    }),
  }),
})

export default schema
