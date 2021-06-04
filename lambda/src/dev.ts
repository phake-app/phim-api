import { handler } from './main'

const event = {
  queryStringParameters: {
    q: 'conan',
  },
}

handler(event)
  .then((res) => console.log(res))
  .catch((err) => console.log(err))
