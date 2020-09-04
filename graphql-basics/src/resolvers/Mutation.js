import { v4 as uuidv4 } from 'uuid'

const Mutation = {
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
}

export default Mutation
