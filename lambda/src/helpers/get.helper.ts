import cheerio from 'cheerio'
import axios from 'axios'

const axiosOptions: any = {
  headers: {
    'user-agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.3',
    'Upgrade-Insecure-Requests': 1,
  },
  timeout: 5000,
  retries: 0,
}

export async function get(url: string): Promise<any> {
  const res = await axios.get(url, axiosOptions)
  return cheerio.load(res.data)
}
