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

const posts = [
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

const comments = [
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

const db = {
  users,
  posts,
  comments,
}

export default db
