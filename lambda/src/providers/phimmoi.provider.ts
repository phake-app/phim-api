/* eslint-disable class-methods-use-this */
import axios from 'axios'
import { nonAccentVietnamese } from '../helpers/string.helper'
import { BaseProvider, RawEpisode, RawMovie } from '../interface/provider.interface'

export default class PhimMoiProvider extends BaseProvider {
  constructor() {
    super({
      searchUrl: 'https://phimmoii.net/tim-kiem/{query}.html',
    })
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public domHandler(dom: any): RawMovie[] {
    return dom('ul.list-movie')
      .find('li.movie-item')
      .map((i: any, elem: any) => {
        const url = dom(elem).find('a.block-wrapper').attr('href')
        const title = dom(elem).find('span.movie-title-1').text()
        const titleEng = dom(elem).find('span.movie-title-2').text()
        const movieTag = dom(elem).find('span.ribbon').text()

        let lastEpisode = null
        let thumbnail = dom(elem).find('div.movie-thumbnail').css('background')

        if (thumbnail) {
          thumbnail = thumbnail
            .replace('url(', '')
            .replace(')', '')
            .replace(/\\"/gi, '')
            .replace(
              'https://images2-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&gadget=a&no_expand=1&refresh=604800&url=',
              ''
            )
        }
        const isMovieSeries =
          nonAccentVietnamese(movieTag).indexOf('tap') !== -1 || nonAccentVietnamese(movieTag).indexOf('full') !== -1

        if (isMovieSeries) {
          const lastEpisodeNum = nonAccentVietnamese(movieTag)?.match(/\d+/)
          lastEpisode = lastEpisodeNum ? parseInt(lastEpisodeNum[0]) : null
        }

        const isMovieTrailer = nonAccentVietnamese(movieTag).indexOf('trailer') !== -1

        return {
          url,
          title,
          titleEng,
          thumbnail,
          isMovieSeries,
          isMovieTrailer,
          lastEpisode,
        }
      })
      .get()
  }

  public async getEpisode(url: string): Promise<RawEpisode | null> {
    const response = await axios(url)
    const dom = response.data
    const arr = dom.match(/var Slug = '(.*)',/)
    if (!arr || !arr[1]) {
      return null
    }

    const arr2 = dom.match(/EpisodeID = '(.*)',/)
    if (!arr2 || !arr2[1]) {
      return null
    }
    const movieId = !isNaN(parseInt(arr[1])) ? parseInt(arr[1]) : 0
    const episodeId = !isNaN(parseInt(arr2[1])) ? parseInt(arr2[1]) : 0
    const videoUrl = 'https://phimmoii.net/ajax/player'

    const videoResponse = await axios.post(videoUrl, { id: movieId, ep: episodeId, sv: 0 })
    const dom2 = videoResponse.data
    const arr3 = dom2.match(/src="(.*)"/)

    if (!arr3 || !arr3[1]) {
      return null
    }

    const hlsUrl = arr3[1].split('/').pop()

    return {
      host: hlsUrl ?? null,
      mid: '',
    }
  }
}
