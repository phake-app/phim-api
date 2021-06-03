/* eslint-disable class-methods-use-this */
import axios from 'axios'
import { nonAccentVietnamese } from '../helpers/string.helper'
import { BaseProvider, RawEpisode, RawMovie } from '../interface/provider.interface'

export default class PhephimProvider extends BaseProvider {
  constructor() {
    super({ searchUrl: 'https://phephimz.net/tim-kiem?q=' })
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public domHandler(dom: any): RawMovie[] {
    return dom('#slide-episodes')
      .find(' > div')
      .map((i: any, elem: any) => {
        const url = dom(elem).find('a.film-title').attr('href')
        const title = dom(elem).find('a.film-title').text()
        const titleEng = dom(elem).find('a.film-title').next().text()
        const subText = dom(elem).find('div.film-tag > .sub').text()
        let lastEpisode = null
        let thumbnail = dom(elem).find('a.film-cover > .poster').css('background-image')

        if (thumbnail) {
          thumbnail = thumbnail.replace('url(', '').replace(')', '').replace(/\\"/gi, '')
        }
        const isMovieSeries = nonAccentVietnamese(subText).indexOf('tap') !== -1

        if (isMovieSeries) {
          const lastEpisodeNum = nonAccentVietnamese(subText)?.match(/\d+/)
          lastEpisode = lastEpisodeNum ? parseInt(lastEpisodeNum[0]) : null
        }

        const isMovieTrailer = nonAccentVietnamese(subText).indexOf('trailer') !== -1

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

  public async getEpisode(url: string, episode: number | boolean): Promise<RawEpisode | null> {
    let path = 'xem-phim.html'
    if (episode) {
      path = `tap-${episode}.html`
    }
    const response = await axios(`${url}/${path}`)
    const dom = response.data
    const arr = dom.match(/var EpisodeID = (.*);/)
    if (!arr || !arr[1]) {
      return null
    }
    const episodeId = parseInt(arr[1])
    const videoUrl = `https://phephim.xyz/api/getvinfo?callback=json&vid=${episodeId}`
    const videoResponse = await axios(videoUrl)
    return videoResponse.data && videoResponse.data.code === 0 && videoResponse.data.data
      ? {
          host: videoResponse.data.data.host,
          mid: videoResponse.data.data.mid,
        }
      : {
          host: null,
          mid: null,
        }
  }
}
