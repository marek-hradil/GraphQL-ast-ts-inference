/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  GraphQLID,
  GraphQLInt,
  GraphQLString,
  circularDependencyTsHack,
  graphQLListFactory,
  graphQLScalarTypeFactory,
} from './typedGqlTypes'
import { GraphQLObjectType, GraphQLSchema } from 'graphql'
import { addAstronautMutation } from './mutations'
import { graphQLNonNullFactory, graphQLObjectTypeFactory, graphQLSimpleEnum } from './typedGqlTypes'
import { listPaginationArgs, wrapPaginationList } from './gqlPagination'

const oddValue = (value: number) => (value % 2 === 1 ? value : null)

// ## data
const OddType = graphQLScalarTypeFactory<number>({
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

const authHOF = <Args extends any[], T>(fn: (...args: Args) => T) => (...args: Args) => {
  // TODO: auth from context monkey patch
  // TODO: context
  // args[3]

  return fn(...args)
}
// // auth from context monkey patch
// const authHOF = <T>(config: T) => <Args extends any[]>(
//   fn: (parent: Args[0], args: Args[1], context: T) => any
// ) => (...args: Args) => {
//   // throw error if user has no access
//   console.info(config)

//   return fn(parent, args, config)
// }

// ## Gql Types

export const CosmonautType = graphQLObjectTypeFactory(
  {
    name: 'Cosmonaut',
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
            type: graphQLListFactory(graphQLNonNullFactory(GraphQLString)),
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
        type: wrapPaginationList(
          'friends',
          graphQLListFactory(circularDependencyTsHack(() => CosmonautType))
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
      // it just returns mock data
      resolve: () => [{ id: '1' }] as any,
    },
  }
)

const engineTypeEnum = Object.freeze({
  SolidFuel: 'SolidFuel',
  LiquidFuel: 'LiquidFuel',
  Ion: 'Ion',
  Plasma: 'Plasma',
} as const)

const EngineType = graphQLSimpleEnum('EngineTypeEnum', engineTypeEnum)

export const RocketType = graphQLObjectTypeFactory(
  {
    name: 'Rocket',
    fields: () => ({
      id: {
        type: graphQLNonNullFactory(GraphQLID),
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
            type: listPaginationArgs('cosmonauts'),
          },
        },
        type: wrapPaginationList('cosmonauts', graphQLNonNullFactory(CosmonautType)),
      },
    }),
  },
  {
    id: {
      resolve: parent => `Rocket:${parent.id}`,
    },
    cosmonauts: {
      // resolve: authHOF({ x: 'config' as const })((parent, args, context) => {
      resolve: (parent, args, context) => {
        const offset = args.pagination.offset ?? 0
        return {
          totalCount: parent.cosmonauts?.items?.length ?? 0,
          items: parent.cosmonauts?.items?.slice(offset, offset + args.pagination.limit),
        }
      },
    },
  }
)

// ## schema

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    // @ts-ignore
    fields: () => ({
      currentRocket: {
        type: RocketType,
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
      addAstronautMutation: addAstronautMutation(),
    }),
  }),
})

export default schema
