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

    if (!videoResponse.data || !videoResponse.data.data) {
      throw new Error('Không tìm thấy phim.')
    }
    const videoData = videoResponse.data.data

    const m3u8Header =
      '#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:10\n#EXT-X-MEDIA-SEQUENCE:0\n#EXT-X-PLAYLIST-TYPE:VOD'
    const m3u8Body = videoData.hls.map(
      (o: any) => `\n#EXTINF:${o.t},\n${videoData.host}/vod/v2/packaged:mp4/${videoData.mid}/${o.n}.ts?e=${o.i}`
    )
    const m3u8Footer = '\n#EXT-X-ENDLIST'
    const rawMovie =
      videoResponse.data && videoResponse.data.code === 0 && videoData
        ? {
            host: videoData.host,
            mid: videoData.mid,
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
        quality: videoData.vrl,
        resolution: videoData.rsl,
        _m3u8: {
          header: m3u8Header,
          body: m3u8Body,
          footer: m3u8Footer,
        },
      }
    }
  }

  public async getEpisodeId(watchUrl: string, episode: number): Promise<any> {
    const path = episode ? `tap-${episode}.html` : 'xem-phim.html'
    const response = await axios(`${watchUrl}/${path}`)
    const domRaw = response.data

    // If the movie is movie series
    if (episode) {
      const vDom = load(domRaw)
      const episodeId: any = vDom('.list-epi > a.active').attr('data-id')
      return {
        episodeId: parseInt(episodeId),
        episodeList: vDom('.list-epi > a')
          .map((_i: number, elem: any) => {
            return {
              label: vDom(elem).text(),
              id: vDom(elem).attr('data-id'),
            }
          })
          .get(),
      }
    }

    // If the movie is not movie series
    const arr = domRaw.match(/var EpisodeID = (.*);/)
    if (!arr || !arr[1]) {
      return null
    }

    return {
      episodeId: parseInt(arr[1]),
      episodeList: [],
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public async getEpisode(movie: any): Promise<any> {
    const currentEpisode = this.episode ? this.episode : movie.lastEpisode ? movie.lastEpisode : null
    const episodeData = await this.getEpisodeId(movie.url, currentEpisode)

    return {
      ...episodeData,
      title: movie.title,
      titleEng: movie.titleEng,
      thumbnail: movie.thumbnail,
      currentEpisode: currentEpisode,
      lastEpisode: movie.lastEpisode,
      isMovieSeries: movie.isMovieSeries,
      isMovieTrailer: movie.isMovieTrailer,
    }
  }
}
