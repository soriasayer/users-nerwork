const graphql = require('graphql')
const _ = require('lodash')
const axios = require('axios')
const { response } = require('express')

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull
} = graphql

const CompanyType = new GraphQLObjectType({
  name: 'Company',
  fields: () => ({
    id: {type: GraphQLString},
    name: {type: GraphQLString},
    description: {type: GraphQLString},
    users: {
      type: new GraphQLList(UserType),
      async resolve(parentValue){
        const response = await axios.get(`http://localhost:3000/companies/${parentValue.id}/users`)
        return response.data
      }
    }
  })
})

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: {type: GraphQLString},
    firstName: {type: GraphQLString},
    age: {type: GraphQLInt},
    company: {
      type: CompanyType,
      async resolve(parentValue){
        const response = await axios.get(`http://localhost:3000/companies/${parentValue.companyId}`)
        return response.data
      }
    }
  })
})

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: {id: {type: GraphQLString}},
      async resolve (_parentValue, args){
        const response = await axios.get(`http://localhost:3000/users/${args.id}`)
        return response.data
      }
    },
    company: {
      type: CompanyType,
      args: {id: {type: GraphQLString}},
      async resolve (_parentValue, args){
        const response = await axios.get(`http://localhost:3000/companies/${args.id}`)
        return response.data
      }
    }
  }
})

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addUser: {
      type: UserType,
      args: {
        firstName: {type: new GraphQLNonNull(GraphQLString)},
        age: {type: new GraphQLNonNull(GraphQLInt)},
        companyId: {type: GraphQLString}
      },
      async resolve(_parentValue, {firstName, age, companyId}){
        const response = await axios.post('http://localhost:3000/users', {firstName, age, companyId})
        return response.data
      }
    },
    deleteUser: {
      type: UserType,
      args: {id: {type: new GraphQLNonNull(GraphQLString)}},
      async resolve(_parentValue, args){
        const response = await axios.delete(`http://localhost:3000/users/${args.id}`)
        return response.data
      }
    },
    editUser: {
      type: UserType,
      args: {
        id: {type: new GraphQLNonNull(GraphQLString)},
        firstName: {type: GraphQLString},
        age: {type: GraphQLInt},
        companyId: {type: GraphQLString}
      },
      async resolve(_parentValue, args){
        const response = await axios.patch(`http://localhost:3000/users/${args.id}`, args)
          return response.data
      }
    }
  }
})

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation
})