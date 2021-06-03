import { BaseProvider } from '../interface/provider.interface'
import PhephimProvider from './phephim.provider'

export default class PhimFactory {
  protected provider: BaseProvider

  constructor(provider: BaseProvider = new PhephimProvider()) {
    this.provider = provider
  }

  public search(q: string, enableSmartSearch: boolean | string): Promise<any> {
    return this.provider.search(q, enableSmartSearch)
  }
}
