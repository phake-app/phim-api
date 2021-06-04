/* eslint-disable class-methods-use-this */
import axios from 'axios'
import { load } from 'cheerio'
import { nonAccentVietnamese } from '../helpers/string.helper'
import { BaseProvider, RawMovie } from '../interface/provider.interface'

export default class PhephimProvider extends BaseProvider {
  constructor() {
    super({ searchUrl: 'https://phephimz.net/tim-kiem?q={query}' })
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
        const subTextNonAccent = nonAccentVietnamese(subText)
        const isMovieSeries = subTextNonAccent.indexOf('tap') !== -1 || subTextNonAccent.indexOf('full') !== -1

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

  async findById(id: number): Promise<any> {
    const videoUrl = `https://phephim.xyz/api/getvinfo?callback=json&vid=${id}`
    const videoResponse = await axios(videoUrl)
    const rawMovie =
      videoResponse.data && videoResponse.data.code === 0 && videoResponse.data.data
        ? {
            host: videoResponse.data.data.host,
            mid: videoResponse.data.data.mid,
          }
        : {
            host: null,
            mid: null,
          }

    if (rawMovie !== null && rawMovie.host !== null) {
      const vod = 2
      const m3u8Url = `${rawMovie.host}/vod/v${vod}/packaged:mp4/${rawMovie.mid}/playlist.m3u8`

      return {
        url: m3u8Url,
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async extractEpisode(url: string, episode: number | null) {
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
    let episodeId: any = parseInt(arr[1])
    let anotherEpisodes: any = []

    if (episode) {
      const vDom = load(response.data)
      episodeId = vDom('.list-epi > a.active').attr('data-id')
      anotherEpisodes = vDom('.list-epi > a')
        .map((i: number, elem: any) => {
          return {
            label: vDom(elem).text(),
            id: vDom(elem).attr('data-id'),
          }
        })
        .get()
    }

    const videoUrl = `https://phephim.xyz/api/getvinfo?callback=json&vid=${episodeId}`
    const videoResponse = await axios(videoUrl)
    return videoResponse.data && videoResponse.data.code === 0 && videoResponse.data.data
      ? {
          host: videoResponse.data.data.host,
          mid: videoResponse.data.data.mid,
          extra: { listEpisodes: anotherEpisodes },
        }
      : {
          host: null,
          mid: null,
          extra: {},
        }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public async getEpisode(movie: any): Promise<any> {
    const currentEpisode = this.episode ? this.episode : movie.lastEpisode ? movie.lastEpisode : null
    let meta = {}

    const vid = await this.extractEpisode(movie.url, currentEpisode)
    if (vid !== null && vid.host !== null) {
      const vod = 2
      const m3u8Url = `${vid.host}/vod/v${vod}/packaged:mp4/${vid.mid}/playlist.m3u8`

      if (movie.isMovieSeries) {
        meta = {
          movieSeries: {
            episodes: vid.extra.listEpisodes,
          },
        }
      }
      return {
        title: movie.title,
        titleEng: movie.titleEng,
        thumbnail: movie.thumbnail,
        url: m3u8Url,
        cdn: vid.host,
        currentEpisode: currentEpisode,
        lastEpisode: movie.lastEpisode,
        isMovieSeries: movie.isMovieSeries,
        isMovieTrailer: movie.isMovieTrailer,
        meta,
      }
    }
  }
}
