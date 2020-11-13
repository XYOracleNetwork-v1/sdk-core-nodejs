import { XyoJsonBoundWitnessCreator } from '../index'
describe('Json to BoundWitness', () => {
  it('2 Party Block', () => {
    const boundWitnessBytes =
      '[\
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
    const createdBoundWitness = jsonCreator.createBlocksFromJson(
      boundWitnessBytes
    )
    expect(createdBoundWitness[0].getIsCompleted())
    expect(createdBoundWitness[1].getIsCompleted())
  })

  it('1 Party Block', () => {
    const boundWitnessBytes =
      '[\
      {\
      "partyD":{\
        "rssi": 30\
      }}\
    ]'
    const jsonCreator = new XyoJsonBoundWitnessCreator()
    const createdBoundWitness = jsonCreator.createBlocksFromJson(
      boundWitnessBytes
    )
    expect(createdBoundWitness[0].getIsCompleted())
  })
})
