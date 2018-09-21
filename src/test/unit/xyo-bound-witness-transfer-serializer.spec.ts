/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 21st September 2018 11:18:27 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-previous-hash-serializer.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 21st September 2018 11:51:13 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoDefaultPackerProvider } from '../../xyo-packer/xyo-default-packer-provider';
import { XyoBoundWitnessTransfer } from '../../components/bound-witness/xyo-bound-witness-transfer';

describe('XyoBoundWitnessTransferSerializer', () => {
  it(`Should serialize and deserialize`, () => {
    // tslint:disable-next-line:max-line-length
    const boundWitnessTransferHex = '0000014c01010b02020107040301030082a358accb2a006d4441bb8e8f4e2f4dac9cf34d0e350b0112c60400e4f09ae73426c208bc103081f7aba5cf776a1baab3fe2b9ff79f7daee90ce7ad05a0dbf46eb2cca076f2ea0ed500124ed52074019a9e4b011e23da9734e335b119f5c838028568e45621b0066b14b948f5e494946e726977bb74080753bd15e8ccf20325c8d606328bedb5a839a46ec0bf5810c9d8d8e9fe9111c005823531c16fb6f393e1de2828035b5b0dac593bf797571ed435798b671813ffd14e69c6ec44d0b3ca57e546b8b55ff34352f204fd516ac80610268e3a679b846cb1a78783af6d5153420b3205e5842031a907c78e71df16508024bccab77c0f46319b95f08d6d509f0000003c0204000000360000002e020600220305acb09624db8485d9a176d742b02cad9c128e872da0131c98c3abab110a8302050000000100000004';
    const boundWitnessTransferBuffer = Buffer.from(boundWitnessTransferHex, 'hex');
    const packer = new XyoDefaultPackerProvider().getXyoPacker();
    const serializer = packer.getSerializerByName(XyoBoundWitnessTransfer.name);
    serializer.deserialize(boundWitnessTransferBuffer, packer);
  });
});
