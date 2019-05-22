import { XyoJsonBoundWitnessCreator } from '../index'
// import { XyoZigZagBoundWitness } from '../../bound-witness/index'
import { XyoZigZagBoundWitness } from '../../bound-witness/xyo-zig-zag-bound-witness'
describe('Json to BoundWitness', () => {

  it('2 Party Block', () => {
    const boundWitnessBytes = '[\
      {\
        "partyA":{\
          "time": 2\
        },\
        "partyB":{\
          "rssi": 3\
        }\
      },\
      {\
        "partyA":{\
          "time": 30\
        },\
        "partyC":{\
          "time": 50\
        }\
      }\
    ]'

    const jsonCreator = new XyoJsonBoundWitnessCreator()
    const createdBoundWitness = jsonCreator.createBlocksFromJson(boundWitnessBytes)
    const bw1: XyoZigZagBoundWitness = createdBoundWitness[0]
    const bw2: XyoZigZagBoundWitness = createdBoundWitness[1]
    expect(bw1.getIsCompleted())
    expect(bw2.getIsCompleted())

  })

})
