/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 13th September 2018 1:25:51 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-constants.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 17th September 2018 1:51:26 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

/**
 * Some very important magic numbers that factor into the
 * tcp negotiation protocol
 */

/** The current number of bytes that encode the length if the catalogue */
export const XYO_TCP_CATALOGUE_LENGTH_IN_BYTES = 4;

/** This number of bytes allowed to encode how big the catalogue can be */
export const XYO_TCP_CATALOGUE_SIZE_OF_SIZE_BYTES = 1;

/**
 * When a TCP payload is passed it is padded with the length of bytes of the payload.
 * It gets 4 bytes to do so
 */
export const XYO_TCP_SIZE_OF_TCP_PAYLOAD_BYTES = 4;
