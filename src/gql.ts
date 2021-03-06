/* eslint-disable @typescript-eslint/no-unused-vars */
import { GraphQLObjectType, GraphQLSchema } from 'graphql'
import { addUserMutation } from './gql/User/userMutations'
import { userQueryFields } from './gql/User/QueryUser'

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    // @ts-ignore
    fields: () => ({
      ...userQueryFields(),
    }),
  }),
  mutation: new GraphQLObjectType({
    name: 'RootMutationType',
    // @ts-ignore
    fields: () => ({
      addUserMutation: addUserMutation(),
    }),
  }),
})

export default schema
