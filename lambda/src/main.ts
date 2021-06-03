import { search } from './services/search.service'
import { responseError, responseSuccess } from './helpers/response.helper'

export const handler = async (event: any = {}): Promise<any> => {
  const q: string | null =
    event['queryStringParameters'] && event['queryStringParameters']['q'] ? event['queryStringParameters']['q'] : null

  if (!q) {
    return responseError('Nhập từ khóa để tìm kiếm.')
  }

  return search(q, true)
    .then((movies) => movies.filter((e: any) => typeof e !== 'undefined' && e.cdn !== null))
    .then((movies) => responseSuccess(movies))
    .catch((err) => responseError(err.message))
}
