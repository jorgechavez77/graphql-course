import { GraphQLServer } from 'graphql-yoga'
import { v4 as uuidv4 } from 'uuid'
import db from './db'

const resolvers = {
  Query: {
    users: (parent, args, { db }, info) => {
      if (!args.query) {
        return db.users
      }
      return db.users.filter(user =>
        user.name.toLowerCase().includes(args.query.toLowerCase())
      )
    },
    posts: (parent, args, { db }, info) => {
      const { query } = args
      if (!query) return db.posts

      const val = query.toLocaleLowerCase()
      return db.posts.filter(
        e =>
          e.title.toLocaleLowerCase().includes(val) ||
          e.body.toLocaleLowerCase().includes(val)
      )
    },
    comments: (parent, args, { db }, info) => {
      return db.comments
    },
    me: () => ({
      id: '1234',
      name: 'Me',
      email: 'me@email.com',
    }),
  },
  Mutation: {
    createUser(parent, args, { db }, info) {
      const { email } = args.input
      const emailTaken = db.users.some(user => user.email === email)

      if (emailTaken) {
        throw new Error('Email Taken')
      }

      const user = {
        id: uuidv4(),
        ...args.input,
      }

      db.users.push(user)

      return user
    },
    deleteUser(parent, args, { db }, info) {
      const { id: userId } = args

      const userIndex = db.users.findIndex(u => u.id === userId)
      if (userIndex === -1) {
        throw new Error('User not found')
      }
      const deletedUser = db.users.splice(userIndex, 1)

      db.posts = db.posts.filter(p => {
        const match = p.author === userId
        if (match) {
          db.comments = db.comments.filter(c => c.post !== p.id)
        }
        return !match
      })
      db.comments = db.comments.filter(c => c.author !== userId)

      return deletedUser.shift()
    },
    createPost(parent, args, { db }, info) {
      const { author } = args.input
      const userExists = db.users.some(user => user.id === author)

      if (!userExists) {
        throw new Error('User not found')
      }

      const post = {
        id: uuidv4(),
        ...args.input,
      }

      db.posts.push(post)

      return post
    },
    deletePost(parent, args, { db }, info) {
      const { id: postId } = args

      const postIndex = db.posts.findIndex(post => post.id === postId)
      if (postIndex === -1) {
        throw new Error('Post not found')
      }
      const deletedPost = db.posts.splice(postIndex, 1)

      db.comments = db.comments.filter(comment => comment.post !== postId)

      return deletedPost.shift()
    },
    createComment(parent, args, { db }, info) {
      const { author, post } = args.input

      const userExists = db.users.some(user => user.id === author)
      const postExists = db.posts.some(p => p.id === post && p.published)
      if (!userExists || !postExists) {
        throw new Error('Unable to find user and post')
      }

      const comment = {
        id: uuidv4(),
        ...args.input,
      }
      db.comments.push(comment)

      return comment
    },
    deleteComent(parent, args, { db }, info) {
      const { id: commentId } = args

      const commentIndex = db.comments.findIndex(
        comment => comment.id === commentId
      )
      if (commentIndex === -1) {
        throw new Error('Comment not found')
      }

      const deletedComment = db.comments.splice(commentIndex, 1)

      return deletedComment.shift()
    },
  },
  User: {
    posts(parent, args, { db }, info) {
      return db.posts.filter(post => post.author === parent.id)
    },
    comments(parent, args, { db }, info) {
      return db.comments.filter(comment => comment.author === parent.id)
    },
  },
  Post: {
    author(parent, args, { db }, info) {
      return db.users.find(user => user.id === parent.author)
    },
    comments(parent, args, { db }, info) {
      return db.comments.filter(comment => comment.post === parent.id)
    },
  },
  Comment: {
    author(parent, args, { db }, info) {
      return db.users.find(user => user.id === parent.author)
    },
    post(parent, args, { db }, info) {
      return db.posts.find(post => post.id === parent.post)
    },
  },
}

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: { db },
})

server.start(() => {
  console.log('Up and running!')
})
