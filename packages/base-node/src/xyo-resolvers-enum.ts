/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 13th February 2019 10:28:51 am
 * @Email:  developer@xyfindables.com
 * @Filename: resolvers-enum
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 13th February 2019 2:42:08 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export enum IResolvers {
  SIGNERS = 'signers',
  NETWORK = 'network',
  PEER_CONNECTION_DELEGATE = 'peerConnectionDelegate',
  PEER_TRANSPORT = 'peerTransport',
  NODE_RUNNER_DELEGATE = 'nodeRunnerDelegate',
  NODE_NETWORK = 'nodeNetwork',
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
  NETWORK_PROCEDURE_CATALOGUE = 'networkProcedureCatalogue'
}
