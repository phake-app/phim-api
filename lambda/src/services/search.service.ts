import PhimFactory from '../providers/phim.factory'

export function search(q: string, smartSearch: boolean | string): Promise<any> {
  const searchProvider = new PhimFactory()
  return searchProvider.search(q, smartSearch)
}

export function findMovieById(id: number): Promise<any> {
  const provider = new PhimFactory()
  return provider.findById(id)
}
