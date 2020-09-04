const Query = {
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
}

export default Query
