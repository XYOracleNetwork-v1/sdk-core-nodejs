/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Wednesday, 13th February 2019 10:28:51 am
 * @Email:  developer@xyfindables.com
 * @Filename: resolvers-enum

 * @Last modified time: Monday, 4th March 2019 12:50:40 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export enum IResolvers {
  SIGNERS = 'signers',
  NETWORK = 'network',
  PEER_CONNECTION_DELEGATE = 'peerConnectionDelegate',
  PEER_TRANSPORT = 'peerTransport',
  NODE_NETWORK_FROM = 'nodeNetworkFrom',
  RUNNABLES = 'nodeRunnerDelegates',
  P2P_SERVICE = 'p2pService',
  DISCOVERY_NETWORK = 'discovery',
  SERIALIZATION_SERVICE = 'serializationService',
  HASH_PROVIDER = 'hashProvider',
  ORIGIN_CHAIN_REPOSITORY = 'originChainRepository',
  ORIGIN_BLOCK_REPOSITORY = 'originBlockRepository',
  BOUND_WITNESS_PAYLOAD_PROVIDER = 'boundWitnessPayloadProvider',
  BOUND_WITNESS_SUCCESS_LISTENER = 'boundWitnessSuccessListener',
  BOUND_WITNESS_VALIDATOR = 'boundWitnessValidator',
  TRANSACTION_REPOSITORY = 'transactionRepository',
  NETWORK_PROCEDURE_CATALOGUE = 'networkProcedureCatalogue',
  ARCHIVIST_REPOSITORY = 'archivistRepository',
  ARCHIVIST_NETWORK = 'archivistNetwork',
  QUESTION_SERVICE = 'questionService',
  QUESTIONS_PROVIDER = 'questionsProvider',
  ABOUT_ME_SERVICE = 'aboutMeService',
  GRAPHQL = 'graphql',
  WEB3_SERVICE = 'web3Service',
  CONTENT_ADDRESSABLE_SERVICE = "contentAddressableService",
  CONSENSUS_PROVIDER = "consensusProvider",
  BLOCK_PRODUCER = "blockProducer",
  BLOCK_WITNESS = "blockWitness"
}
