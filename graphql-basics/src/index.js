import { GraphQLServer } from 'graphql-yoga'
import { v4 as uuidv4 } from 'uuid'

const users = [
  {
    id: '1',
    name: 'John Williams',
    email: 'jw@email.com',
    age: 30,
    posts: ['4'],
  },
  {
    id: '2',
    name: 'Tyl Lone',
    email: 'tl@email.com',
    age: 40,
    posts: ['5'],
  },
  {
    id: '3',
    name: 'Arby Myl',
    email: 'am@email.com',
    age: 50,
    posts: ['6'],
  },
]

let posts = [
  {
    id: '4',
    title: 'A new Hope',
    body: 'Star Wars IV A New Hope',
    published: true,
    author: '1',
    comments: ['1', '2'],
  },
  {
    id: '5',
    title: 'The Empire Strikes Back',
    body: 'Star Wars V The Empire Strikes Back',
    published: true,
    author: '2',
    comments: ['3'],
  },
  {
    id: '6',
    title: 'The Return Of The Jedi',
    body: 'Star Wars VI The Return Of The Jedi',
    published: false,
    author: '3',
    comments: ['4'],
  },
]

let comments = [
  {
    id: '1',
    text: 'asdfgh',
    author: '1',
    post: '4',
  },
  {
    id: '2',
    text: 'yutrewq',
    author: '2',
    post: '4',
  },
  {
    id: '3',
    text: 'oiuytres',
    author: '3',
    post: '5',
  },
  {
    id: '4',
    text: 'iuytre',
    author: '3',
    post: '6',
  },
]

const typeDefs = `
  type Query {
    post: Post!
    posts(query: String): [Post!]!
    comments: [Comment!]!
    users: [User!]!
  }

  type Mutation {
    createUser (input: CreateUserInput!): User!
    deleteUser (id: ID!): User!
    createPost (input: CreatePostInput!): Post!
    deletePost (id: ID!): Post!
    createComment (input: CreateCommentInput!): Comment!
    deleteComent (id: ID!): Comment!
  }

  input CreateUserInput {
    name: String!
    email: String
    age: Int
  }

  input CreatePostInput {
    title: String!
    body: String!
    published: Boolean!
    author: ID!
  }

  input CreateCommentInput {
    text: String!
    author: ID!
    post: ID!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
    posts: [Post!]!
    comments: [Comment!]!
  }

  type Post {
    id: ID!
    title: String!
    body: String!
    published: Boolean!
    author: User!
    comments: [Comment!]!
  }

  type Comment {
    id: ID!
    text: String!
    author: User!
    post: Post!
  }
`

const resolvers = {
  Query: {
    post: () => ({
      id: '1234',
      title: 'The Lost Sinner',
      body: 'blah blah blah',
      published: true,
    }),
    posts: (parent, args, ctx, info) => {
      const { query } = args
      if (!query) return posts

      const val = query.toLocaleLowerCase()
      return posts.filter(
        e =>
          e.title.toLocaleLowerCase().includes(val) ||
          e.body.toLocaleLowerCase().includes(val)
      )
    },
    comments: () => {
      return comments
    },
    users: () => {
      return users
    },
  },
  Mutation: {
    createUser(parent, args, ctx, info) {
      const { email } = args.input
      const emailTaken = users.some(user => user.email === email)

      if (emailTaken) {
        throw new Error('Email Taken')
      }

      const user = {
        id: uuidv4(),
        ...args.input,
      }

      users.push(user)

      return user
    },
    deleteUser(parent, args, ctx, info) {
      const { id: userId } = args

      const userIndex = users.findIndex(u => u.id === userId)
      if (userIndex === -1) {
        throw new Error('User not found')
      }
      const deletedUser = users.splice(userIndex, 1)

      posts = posts.filter(p => {
        const match = p.author === userId
        if (match) {
          comments = comments.filter(c => c.post !== p.id)
        }
        return !match
      })
      comments = comments.filter(c => c.author !== userId)

      return deletedUser.shift()
    },
    createPost(parent, args, ctx, info) {
      const { author } = args.input
      const userExists = users.some(user => user.id === author)

      if (!userExists) {
        throw new Error('User not found')
      }

      const post = {
        id: uuidv4(),
        ...args.input,
      }

      posts.push(post)

      return post
    },
    deletePost(parent, args, ctx, info) {
      const { id: postId } = args

      const postIndex = posts.findIndex(post => post.id === postId)
      if (postIndex === -1) {
        throw new Error('Post not found')
      }
      const deletedPost = posts.splice(postIndex, 1)

      comments = comments.filter(comment => comment.post !== postId)

      return deletedPost.shift()
    },
    createComment(parent, args, ctx, info) {
      const { author, post } = args.input

      const userExists = users.some(user => user.id === author)
      const postExists = posts.some(p => p.id === post && p.published)
      if (!userExists || !postExists) {
        throw new Error('Unable to find user and post')
      }

      const comment = {
        id: uuidv4(),
        ...args.input,
      }
      comments.push(comment)

      return comment
    },
    deleteComent(parent, args, ctx, info) {
      const { id: commentId } = args

      const commentIndex = comments.findIndex(
        comment => comment.id === commentId
      )
      if (commentIndex === -1) {
        throw new Error('Comment not found')
      }

      const deletedComment = comments.splice(commentIndex, 1)

      return deletedComment.shift()
    },
  },
  User: {
    posts(parent, args, ctx, info) {
      return posts.filter(post => post.author === parent.id)
    },
    comments(parent, args, ctx, info) {
      return comments.filter(comment => comment.author === parent.id)
    },
  },
  Post: {
    author(parent, args, ctx, info) {
      return users.find(user => user.id === parent.author)
    },
    comments(parent, args, ctx, info) {
      return comments.filter(comment => comment.post === parent.id)
    },
  },
  Comment: {
    author(parent, args, ctx, info) {
      return users.find(user => user.id === parent.author)
    },
    post(parent, args, ctx, info) {
      return posts.find(post => post.id === parent.post)
    },
  },
}

const server = new GraphQLServer({ typeDefs, resolvers })

server.start(() => {
  console.log('Up and running!')
})
