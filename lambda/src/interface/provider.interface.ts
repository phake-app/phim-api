import { get } from '../helpers/get.helper'
import { nonAccentVietnamese } from '../helpers/string.helper'

export interface ProviderConfig {
  searchUrl: string
}

export interface RawMovie {
  url: string
  title: string
  titleEng: string
  thumbnail: string
  isMovieSeries: boolean
  isMovieTrailer: boolean
  lastEpisode: number
}

export interface RawEpisode {
  host: string
  mid: string
}

export abstract class BaseProvider {
  protected searchUrl: string
  protected searchString?: string
  protected enableSmartSearch: boolean = true
  protected episode?: number | null

  constructor(config: ProviderConfig) {
    this.searchUrl = config.searchUrl
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  abstract domHandler(dom: any): RawMovie[]

  abstract getEpisode(url: string, episode: number | boolean): Promise<RawEpisode | null>

  /**
   *
   * @param searchString string
   * @param smartSearch boolean | string
   * @returns Promise<any>
   */
  public async search(searchString: string, smartSearch: boolean | string = true): Promise<any> {
    const queryString = nonAccentVietnamese(searchString)
    this.searchString = queryString
    this.enableSmartSearch = smartSearch === true || smartSearch === 'true'
    this.episode = null

    if (queryString.indexOf('tap') !== -1) {
      const searchParts = queryString.split('tap')
      this.episode = parseInt(searchParts[1].trim())
      this.searchString = searchParts[0]
    }

    const $: any = await get(`${this.searchUrl.replace('{query}', this.searchString)}`)
    let movies = this.domHandler($).filter((e: any) => typeof e !== 'undefined' && e.title !== '' && !e.isMovieTrailer)

    // If query string does not contains 'tap' or this request is not smart search
    if (this.episode === null && !this.enableSmartSearch) {
      movies = movies.filter((e: any) => e.isMovieSeries !== true)
    }

    return Promise.all(
      movies.map(async (movie: any): Promise<any> => {
        const currentEpisode = this.episode ? this.episode : movie.lastEpisode ? movie.lastEpisode : null

        const vid = await this.getEpisode(movie.url, currentEpisode)
        if (vid !== null && vid.host !== null) {
          const vod = 2
          const m3u8Url = `${vid.host}/vod/v${vod}/packaged:mp4/${vid.mid}/playlist.m3u8`
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
          }
        }
      })
    )
  }
}
