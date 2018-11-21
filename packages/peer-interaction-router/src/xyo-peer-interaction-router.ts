/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 21st November 2018 10:54:00 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-peer-interaction-router.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 21st November 2018 11:19:03 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoCategoryRouter, IXyoCatalogueResolver } from '@xyo-network/peer-connections'
import { IXyoBoundWitnessHandlerProvider } from '@xyo-network/peer-interaction'
import { XyoBase } from '@xyo-network/base'
import { CatalogueItem } from '@xyo-network/network'

/**
 * A simple router to register handlers by route category.
 *
 * Uses `connect-like` or `express-like` like API to mount handlers.
 *
 * ```javascript
 *  router.use(category, handler)
 * ```
 */
export class XyoPeerInteractionRouter extends XyoBase implements IXyoCategoryRouter, IXyoCatalogueResolver {

  private readonly handlersByCategory: {[s: string]: handlerFactoryFn} = {}

  /**
   * Creates an instance of XyoPeerInteractionRouter.
   * @param {IXyoCatalogueResolver} [catalogueResolver] If a catalogue resolver is supplied, it will be
   * used as a delegate to decide which category to choose in the event of a negotiation
   *
   * @memberof XyoPeerInteractionRouter
   */
  constructor (private readonly catalogueResolver?: IXyoCatalogueResolver) {
    super()
  }

  /**
   * Registers a handler for a particular category
   *
   * @param {CatalogueItem} catalogueItem
   * @param {handlerFactoryFn} handlerFactory
   * @memberof XyoPeerInteractionRouter
   */
  public use(catalogueItem: CatalogueItem, handlerFactory: handlerFactoryFn) {
    this.handlersByCategory[catalogueItem] = handlerFactory
  }

  /**
   * Resolves a handler a based on a catalogue item.
   *
   * @param {CatalogueItem} catalogueItem
   * @returns {(IXyoBoundWitnessHandlerProvider | undefined)}
   * @memberof XyoPeerInteractionRouter
   */
  public getHandler(catalogueItem: CatalogueItem): IXyoBoundWitnessHandlerProvider | undefined {
    const handlerFn = this.handlersByCategory[catalogueItem]
    if (!handlerFn) {
      return undefined
    }

    return handlerFn()
  }

  /**
   * Resolves to a category when multiple category options are available
   *
   * @param {CatalogueItem[]} catalogueItems
   * @returns {(CatalogueItem | undefined)}
   * @memberof XyoPeerInteractionRouter
   */

  public resolveCategory(catalogueItems: CatalogueItem[]): CatalogueItem | undefined {
    if (this.catalogueResolver) {
      return this.catalogueResolver.resolveCategory(catalogueItems)
    }

    return (catalogueItems && catalogueItems.length > 0 && catalogueItems[0]) || undefined
  }
}

export type handlerFactoryFn = () => IXyoBoundWitnessHandlerProvider
