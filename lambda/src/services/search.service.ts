import axios from 'axios'
import { get } from '../helpers/get.helper'
import { nonAccentVietnamese } from '../helpers/string.helper'

const getEpisode = async (url: string, episode: number | boolean): Promise<any> => {
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

export async function search(q: string, smartSearch: boolean | string): Promise<any> {
  const queryString = nonAccentVietnamese(q)
  let searchString = queryString
  const isSmartSearch = smartSearch === true || smartSearch === 'true'
  let episode: any = null

  if (queryString.indexOf('tap') !== -1) {
    const searchParts = queryString.split('tap')
    episode = parseInt(searchParts[1].trim())
    searchString = searchParts[0]
  }

  const $ = await get(`https://phephimz.net/tim-kiem?q=${searchString}`)

  let movies = $('#slide-episodes')
    .find(' > div')
    .map((i: any, elem: any) => {
      const url = $(elem).find('a.film-title').attr('href')
      const title = $(elem).find('a.film-title').text()
      const titleEng = $(elem).find('a.film-title').next().text()
      const subText = $(elem).find('div.film-tag > .sub').text()
      let lastEpisode = null
      let thumbnail = $(elem).find('a.film-cover > .poster').css('background-image')

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
    .filter((e: any) => typeof e !== 'undefined' && e.title !== '' && !e.isMovieTrailer)

  // If query string does not contains 'tap' or this request is not smart search
  if (episode === null && !isSmartSearch) {
    movies = movies.filter((e: any) => e.isMovieSeries !== true)
  }

  return Promise.all(
    movies.map(async (movie: any): Promise<any> => {
      const currentEpisode = episode ? episode : movie.lastEpisode ? movie.lastEpisode : null
      const vid = await getEpisode(movie.url, currentEpisode)
      if (vid !== null && vid.data !== null) {
        const vod = 2
        const m3u8Url = `${vid.host}/vod/v${vod}/packaged:mp4/${vid.mid}/playlist.m3u8`
        return {
          title: episode !== null ? `${movie.title} - Tập ${episode}` : movie.title,
          titleEng: episode !== null ? `${movie.titleEng} - Episode ${episode}` : movie.titleEng,
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
