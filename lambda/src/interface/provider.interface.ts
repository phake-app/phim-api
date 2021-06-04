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

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  abstract getEpisode(movie: any): Promise<any>

  abstract findById(id: number): Promise<any>

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

    return Promise.all(movies.map(async (movie: any): Promise<any> => this.getEpisode(movie)))
  }
}
