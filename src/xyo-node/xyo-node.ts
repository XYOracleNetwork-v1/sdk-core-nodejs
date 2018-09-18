/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 7th September 2018 9:54:53 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-archivist.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 18th September 2018 5:29:46 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoNetworkProviderInterface, XyoNetworkProcedureCatalogue } from '../network/xyo-network';
import { CatalogueItem } from '../network/xyo-catalogue-item';
import { XyoBoundWitnessInteraction } from './xyo-bound-witness-interaction';
import { XyoOriginChainNavigator } from './origin-chain/xyo-origin-chain-navigator';
import { XyoOriginChainStateManager } from './origin-chain/xyo-origin-chain-state-manager';
import { XYOStorageProvider } from '../storage/xyo-storage-provider';
import { XyoBoundWitness } from '../components/bound-witness/xyo-bound-witness';
import { XyoPayload } from '../components/xyo-payload';
import { XyoObject } from '../components/xyo-object';
import { XyoHashProvider } from '../hash-provider/xyo-hash-provider';
import { XyoPacker } from '../xyo-packer/xyo-packer';
import { XyoSingleTypeArrayInt } from '../components/arrays/xyo-single-type-array-int';
import { XyoMultiTypeArrayInt } from '../components/arrays/xyo-multi-type-array-int';
import { XyoSigner } from '../signing/xyo-signer';

const logger = console;

/**
 * An XyoNode represents a node in the xyo-network system.
 * A node can communicate with other nodes, in general, through
 * bound-witness interactions. What differentiates a sentinel
 * from a bridge from an archivist is their role in the system
 * and what their prerogative is at any given time.
 */

export class XyoNode {

  /** The origin blocks for this particular node */
  private readonly originBlocks: XyoOriginChainNavigator;

  /** The current state of the origin chain */
  private readonly originState = new XyoOriginChainStateManager(0);

  /** A mapping of name to heuristic-providers */
  private readonly heuristicsProviders: {[s: string]: () => Promise<XyoObject>} = {};

  /** Some instance variables for managing the xyo-node loop */
  private isLooping: boolean = false;
  private shouldStopLooping: boolean = false;

  /**
   * Creates an instance of a XyoNode
   *
   * @param xyoPacker a packer for serializing and deserializing values
   * @param network A network provider to communicate with other peers
   * @param catalogue A catalogue that'll be used for determining operations with other nodes
   * @param signers A list of signers that will partake in bound-witnesses
   * @param storageProvider A storage-provider for persistence
   * @param hashingProvider A hash provider to provide hashing services
   */

  constructor(
    private readonly xyoPacker: XyoPacker,
    private readonly network: XyoNetworkProviderInterface,
    private readonly catalogue: XyoNetworkProcedureCatalogue,
    private readonly signers: XyoSigner[],
    private readonly storageProvider: XYOStorageProvider,
    private readonly hashingProvider: XyoHashProvider,
  ) {
    this.originBlocks = new XyoOriginChainNavigator(this.xyoPacker, this.storageProvider, this.hashingProvider);
  }

  /**
   * Calling start will place the xyo-node in loop mode
   */
  public start() {
    this.loop();
  }

  /**
   * Calling stop will remove the xyo-node from loop mode
   */

  public stop() {
    this.shouldStopLooping = true;
    return this.network.stopServer();
  }

  /**
   * Register a heuristics provider with the xyo-node. The values of the heuristic
   * provider will be placed in the bound-witness
   *
   * @param name The name of the heuristics provider
   * @param providerFn A callback function that asynchronously returns a value
   */

  public addHeuristicsProvider(name: string, providerFn: () => Promise<XyoObject>) {
    this.heuristicsProviders[name] = providerFn;
  }

  /**
   * Defines an xyo-node's in loop. Once an iteration of the loop is completed it will
   * scheduled immediately for another iteration of the loop unless `stop` is called.
   */

  private async loop() {
    if (this.isLooping && this.shouldStopLooping) {
      return;
    }

    logger.info(`Starting XyoArchivist loop`);

    const networkPipeResult = await this.network.find(this.catalogue);

    const networkPipe = networkPipeResult;
    if (!networkPipe.otherCatalogue || networkPipe.otherCatalogue.length < 1) {
      logger.error(`XyoArchivist requires peer catalogue`);
      await networkPipe.close();
      setImmediate(this.loop.bind(this));
      return;
    }

    const category = this.resolveCategory(networkPipe.otherCatalogue!);
    if (!category) {
      logger.error(`XyoArchivist can not resolve a valid catalogue item`);
      await networkPipe.close();
      setImmediate(this.loop.bind(this));
      return;
    }

    switch (category) {
      case CatalogueItem.BOUND_WITNESS:
        try {
          const payload = await this.getBoundWitnessPayload();
          const boundWitnessInteraction = new XyoBoundWitnessInteraction(
            this.xyoPacker,
            networkPipe,
            this.signers,
            payload
          );
          const boundWitness = await boundWitnessInteraction.run();
          await this.handleBoundWitnessSuccess(boundWitness);
        } catch (err) {
          logger.error(`There was an doing a bound witness`, err);
          throw err;
        }

        break;
    }

    setImmediate(this.loop.bind(this));
  }

  /**
   * A helper function for processing successful bound witnesses
   */

  private async handleBoundWitnessSuccess(boundWitness: XyoBoundWitness): Promise<void> {
    const hashValue = await boundWitness.getHash(this.hashingProvider);
    logger.info(hashValue.hash.toString('hex'));
    this.originState.newOriginBlock(hashValue);
    await this.originBlocks.addBoundWitness(boundWitness);

    const nestedBoundWitnesses: XyoBoundWitness[] = [];
    this.extractNestedBoundWitnesses(boundWitness, nestedBoundWitnesses);
    await Promise.all(nestedBoundWitnesses.map((nestedBoundWitness) => {
      return this.originBlocks.addBoundWitness(nestedBoundWitness);
    }));

    return;
  }

  /**
   * Often bound-witness pass around origin-chains in their unsigned payloads so they can bridged or
   * archived. This helper function recursively extracts out those origin chains so they can be processed.
   */
  private extractNestedBoundWitnesses(boundWitness: XyoBoundWitness, boundWitnessContainer: XyoBoundWitness[]) {
    boundWitness.payloads.forEach((payload) => {
      payload.unsignedPayload.array.forEach((unsignedPayloadItem) => {
        const xyoObjectId = unsignedPayloadItem.id;
        const singleTypeArrayMajorMinor = this.xyoPacker.getMajorMinor(XyoSingleTypeArrayInt.name);
        const boundWitnessMajorMinor = this.xyoPacker.getMajorMinor(XyoBoundWitness.name);
        if (
          xyoObjectId[0] === singleTypeArrayMajorMinor.major &&
          xyoObjectId[1] === singleTypeArrayMajorMinor.minor &&
          (unsignedPayloadItem as XyoSingleTypeArrayInt).elementMajor === boundWitnessMajorMinor.major &&
          (unsignedPayloadItem as XyoSingleTypeArrayInt).elementMinor === boundWitnessMajorMinor.minor
        ) {
          const nestedBoundWitnessArray = unsignedPayloadItem as XyoSingleTypeArrayInt;
          nestedBoundWitnessArray.array.forEach((nestedObj) => {
            const nestedBoundWitness = nestedObj as XyoBoundWitness;
            boundWitnessContainer.push(nestedBoundWitness);
            this.extractNestedBoundWitnesses(nestedBoundWitness, boundWitnessContainer);
          });
        }
      });
    });
  }

  /**
   * Given a list of catalogue items a peer is willing to do, this resolves to a particular
   * catalogue item.
   */

  private resolveCategory(otherCatalogueItems: CatalogueItem[]): CatalogueItem | undefined {
    const boundWitnessCatalogueItem = otherCatalogueItems.find((catalogueItem) => {
      return catalogueItem === CatalogueItem.BOUND_WITNESS;
    });

    return boundWitnessCatalogueItem;
  }

  /**
   * A helper function for composing the payload values that will go
   * inside a bound witness
   */

  private async getBoundWitnessPayload(): Promise<XyoPayload> {
    const heuristics = await this.getHeuristics();
    const unsignedPayloads: XyoObject[] = ([] as XyoObject[]).concat(heuristics);
    const signedPayloads: XyoObject[] = [];

    const previousHash = this.originState.previousHash;
    const index = this.originState.index;
    const nextPublicKey = this.originState.nextPublicKey;

    if (previousHash) {
      signedPayloads.push(previousHash);
    }

    if (nextPublicKey) {
      signedPayloads.push(nextPublicKey);
    }

    signedPayloads.push(index);
    return new XyoPayload(
      new XyoMultiTypeArrayInt(signedPayloads),
      new XyoMultiTypeArrayInt(unsignedPayloads)
    );
  }

  /**
   * Iterates through the heuristics providers and resolves
   * their values
   */

  private async getHeuristics(): Promise<XyoObject[]> {
    if (Object.keys(this.heuristicsProviders).length === 0) {
      return [];
    }

    return Promise.all(
      Object.keys(this.heuristicsProviders).map((heuristicName) => {
        const providerFn = this.heuristicsProviders[heuristicName];
        return providerFn();
      })
    );
  }
}
