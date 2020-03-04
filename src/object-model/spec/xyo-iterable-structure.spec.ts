import { XyoBuffer } from '../xyo-buffer'
import { XyoIterableStructure } from '../xyo-iterable-structure'

describe('XyoBuffer', () => {
  it('Untyped 1', () => {
    const inputBuffer = Buffer.from('6041000a0044021400420237', 'hex')
    const buffer = new XyoBuffer(inputBuffer)
    const struct = new XyoIterableStructure(buffer)
    const it = struct.newIterator()
    let i = 0

    while (it.hasNext()) {
      if (i === 0) {
        const bytes = it
          .next()
          .value.getAll()
          .getContentsCopy()
          .toString('hex')
        expect(bytes).toEqual('00440214')
      } else if (i === 1) {
        const bytes = it
          .next()
          .value.getAll()
          .getContentsCopy()
          .toString('hex')
        expect(bytes).toEqual('00420237')
      } else {
        throw new Error('Index does not exist')
      }

      i += 1
    }

    expect(
      struct
        .getValue()
        .getContentsCopy()
        .toString('hex')
    ).toBe('0044021400420237')
  })

  it('Typed 1', () => {
    const inputBuffer = Buffer.from('304107004402130237', 'hex')
    const buffer = new XyoBuffer(inputBuffer)
    const struct = new XyoIterableStructure(buffer)
    const it = struct.newIterator()
    let i = 0

    while (it.hasNext()) {
      if (i === 0) {
        const bytes = it
          .next()
          .value.getAll()
          .getContentsCopy()
          .toString('hex')
        expect(bytes).toEqual('00440213')
      } else if (i === 1) {
        const bytes = it
          .next()
          .value.getAll()
          .getContentsCopy()
          .toString('hex')
        expect(bytes).toEqual('00440237')
      } else {
        throw new Error('Index does not exist')
      }

      i += 1
    }

    expect(
      struct
        .getValue()
        .getContentsCopy()
        .toString('hex')
    ).toBe('004402130237')
  })

  it('Validate true', () => {
    const inputBuffer = Buffer.from(
      // tslint:disable-next-line:max-line-length
      '60020214201574201944000C415974B572A832CB601FBDAEC67E912BA9671B771E032E8F82BD97E9A2D57B7F05A222F820415A132CEE730579B7B245D97E58354EC304C64D97D3E6B4A77AE7213008240010217FBC8759E2B6AE0A12ADCBB6ABEEF342219AFDC495C8D920072AE09C784DCED800030500000E0520155C300624001021F45D1235377FDE3C42FF7953F6579A1C57164D24FAAFD643D332179D9F56675F3008240010217FBC8759E2B6AE0A12ADCBB6ABEEF342219AFDC495C8D920072AE09C784DCED800030500000101201906000E0300002017EF2005E42002E1201574201944000C415974B572A832CB601FBDAEC67E912BA9671B771E032E8F82BD97E9A2D57B7F05A222F820415A132CEE730579B7B245D97E58354EC304C64D97D3E6B4A77AE7213008240010215BF936EEDE11E006D9E2A0E2FD4EAEBB8F2B648C949F8E8DEEE1C9B6F4611D9C00030500000D0420151000030500000000201906000E030000201709201A06000B03000020174B201A4800094521008285A4FA3933F42CBE16967CDFA2C05799976E8BA5E28E071A1990C59510E3642100C192599BE091DE79CA25BE6F0D31B76653F91142E3541A98CD5261836C0D802C201A06000B03000020174B201A480009452100FCFB0708A2503595F14F12855D52C62570C5BB7E90635AC2B85C9B206A18D2492100D2A52F6A3F338C32D58EE89E432065B0D876ECB39FB1C34F41E2B3C1D74FCC99',
      'hex'
    )
    const buffer = new XyoBuffer(inputBuffer)
    const struct = new XyoIterableStructure(buffer)

    expect(XyoIterableStructure.validate(struct)).toBe(true)
  })

  it('Validate false', () => {
    const inputBuffer = Buffer.from(
      // tslint:disable-next-line:max-line-length
      '600201A22015CB2019C8000C41170F9302323929FD3FD8A72851F73866A0BFC6D488040E9D921689E01B9E25E4393B0984576763DD9C5DA95E609A80B4CC12064758C1AEEE28AE264015BF474F000D8200AEB335766EC511499DDE566579B4ED1562079AA543388B2EDED68ED68363AE9DAE25E7E29B9A5607E670FF234B98891EE3FF99365A3CA6AB804173F1A8619934134A68F59FBDCA92E200C04A196D4A39C987C984E18B79D3EE81667DD92E962E6C630DB5D7BDCDB1988000A81713AB83E5D8B4EF6D2EAB4D70B61AADCA01E733CB0B3D072DE307CDBCD09F46D528A7159EB73DEBB018871E30D182F5BBB426689E758A7BFD4C51D0AD116CA621BF1C39DA49A837D525905D22BAB7C1874F6C7E6B4D56139A15C3BE1D1DC8E061C241C060A24B588217E37D6206AFE5D71F4698D42E25C4FCE996EECCF7690B900130200',
      'hex'
    )
    const buffer = new XyoBuffer(inputBuffer)
    const struct = new XyoIterableStructure(buffer)

    expect(XyoIterableStructure.validate(struct)).toBe(false)
  })
})
