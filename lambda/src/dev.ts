import { handler } from './main'

const event = {
  queryStringParameters: {
    // q: 'conan',
    id: 21447,
  },
}

handler(event)
  .then((res) => console.log(JSON.parse(res.body)))
  .catch((err) => console.log(err))
