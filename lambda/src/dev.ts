import { handler } from './main'

const event = {
  queryStringParameters: {
    q: 'conan tap 1006',
  },
}

handler(event)
  .then((res) => console.log(res))
  .catch((err) => console.log(err))
