import { handler } from './main'

const event = {
  queryStringParameters: {
    q: 'conan',
    // id: '117679',
  },
}

handler(event)
  .then((res) => console.log(res))
  .catch((err) => console.log(err))
