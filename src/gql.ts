/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  GraphQLID,
  GraphQLInt,
  GraphQLString,
  circularDependencyTsHack,
  graphQLList,
  graphQLScalarType,
  graphqlSubQueryType,
} from './typedGqlTypes'
import { GraphQLObjectType, GraphQLSchema } from 'graphql'
import { addAstronautMutation } from './mutations'
import { graphQLNonNull, graphQLObjectType, graphQLSimpleEnum } from './typedGqlTypes'
import { listPaginationArgs, wrapPaginationList } from './gqlPagination'
import { pipe } from 'ramda'

const oddValue = (value: number) => (value % 2 === 1 ? value : null)

// ## data
const OddType = graphQLScalarType<number>({
  name: 'Odd',
  serialize: oddValue,
  parseValue: oddValue,
  parseLiteral(ast) {
    // @ts-expect-error
    if (ast.kind === Kind.INT) {
      // @ts-expect-error
      return oddValue(parseInt(ast.value, 10))
    }
    return null
  },
})

export const gqlAppData = {
  id: 'R:1',
  firstName: 'John',
  lastName: 'Wick',
  role: undefined,
  cosmonauts: {
    totalCount: 3,
    items: Array.from({ length: 3 }, (_, index) => ({
      id: `C:${index}`,
      firstName: `${index} firstName`,
      lastName: `${index} lastName`,
      index,
    })),
  },
}

const authDecorator = (_config: { auth: string }) => <Parent, Args, T>(
  fn: (p: Parent, args: Args, context: any) => T
) => (p: Parent, args: Args, context: any) => {
  if (_config.auth === 'developer') {
    throw new Error('developer has no access')
  }

  return fn(p, args, context)
}

export const CosmonautType = graphQLObjectType(
  {
    name: 'Cosmonaut',
    fields: () => ({
      peta: {
        type: graphQLNonNull(GraphQLString),
      },
      id: {
        type: graphQLNonNull(GraphQLID),
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
            type: graphQLList(graphQLNonNull(GraphQLString)),
          },
        },
        type: GraphQLString,
      },
      index: {
        type: GraphQLInt,
      },
      showOnlyOddIds: {
        type: OddType,
      },
      friends: {
        type: circularDependencyTsHack(() =>
          wrapPaginationList('friends_cosmonauts', CosmonautType)
        ),
      },
    }),
  },
  {
    id: {
      resolve: parent => `Cosmonaut:${parent.id}`,
    },
    fullName: {
      resolve: (parent, args) => `${args.prefix.join('-')} ${parent.firstName} ${parent.lastName}`,
    },
    showOnlyOddIds: {
      resolve: parent => parent.index!,
    },
    friends: {
      resolve: () => [{ id: '1' }],
    },
  },
  {
    globalResolverDecorator: pipe(
      authDecorator({ auth: '1111' }),
      authDecorator({ auth: 'xxx-developer' }),
      authDecorator({ auth: '3' })
    ),
  }
)

const engineTypeEnum = Object.freeze({
  SolidFuel: 'SolidFuel',
  LiquidFuel: 'LiquidFuel',
  Ion: 'Ion',
  Plasma: 'Plasma',
} as const)

const EngineType = graphQLSimpleEnum('EngineTypeEnum', engineTypeEnum)

export const RocketType = graphQLObjectType(
  {
    name: 'Rocket',
    fields: () => ({
      id: {
        type: graphQLNonNull(GraphQLID),
      },
      name: {
        type: GraphQLString,
      },
      engineType: {
        type: EngineType,
      },
      cosmonauts: {
        args: {
          pagination: {
            type: listPaginationArgs('arg_cosmonauts'),
          },
        },
        type: wrapPaginationList('cosmonauts', graphQLNonNull(CosmonautType)),
      },
    }),
  },
  {
    id: {
      resolve: parent => `Rocket:${parent.id}`,
    },
    cosmonauts: {
      resolve: pipe(
        authDecorator({ auth: 'admin' }),
        authDecorator({ auth: 'user' })
      )((parent, args) => {
        const offset = args.pagination.offset ?? 0
        return {
          totalCount: parent.cosmonauts?.items?.length ?? 0,
          items: parent.cosmonauts?.items?.slice(offset, offset + args.pagination.limit),
        }
      }),
    },
  }
)

// ## schema

const currentRocketQuery = () =>
  graphqlSubQueryType(
    {
      currentRocket: {
        type: RocketType,
      },
    },
    {
      currentRocket: {
        resolve: () => {
          return gqlAppData
        },
      },
    }
  )

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    // @ts-ignore
    fields: () => ({
      ...currentRocketQuery(),
    }),
  }),
  mutation: new GraphQLObjectType({
    name: 'RootMutationType',
    // @ts-ignore
    fields: () => ({
      addAstronautMutation: addAstronautMutation(),
    }),
  }),
})

export default schema
