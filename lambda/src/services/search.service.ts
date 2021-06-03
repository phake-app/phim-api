import PhimFactory from '../providers/phim.factory'

export function search(q: string, smartSearch: boolean | string): Promise<any> {
  const searchProvider = new PhimFactory()
  return searchProvider.search(q, smartSearch)
}
