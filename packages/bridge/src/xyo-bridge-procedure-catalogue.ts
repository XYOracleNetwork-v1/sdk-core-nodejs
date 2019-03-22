
import { IXyoNetworkProcedureCatalogue, CatalogueItem, IXyoNetworkProvider } from '@xyo-network/network'

export class XyoBrideProcedureCatalogue implements IXyoNetworkProcedureCatalogue {

  constructor(private advertising: CatalogueItem[]) {

  }

  public canDo (catalogueItem: CatalogueItem): boolean {
    if (catalogueItem === CatalogueItem.GIVE_ORIGIN_CHAIN) {
      return true
    }

    if (catalogueItem === CatalogueItem.TAKE_ORIGIN_CHAIN) {
      return true
    }

    if (catalogueItem === CatalogueItem.BOUND_WITNESS) {
      return true
    }

    return false
  }

  public getCurrentCatalogue (): CatalogueItem[] {
    return this.advertising
  }

  public setCatalogue (catalogue: CatalogueItem[]): void {
    throw Error("Bridge catalogue setting not supported")
  }
}
