interface IXyoTopic {
  topic: string
  message: string
  offset: number
}

const SIZE_OF_SIZE = 4

export const encodeXyoBuffer = (msg: Buffer): Buffer => {
  const size = Buffer.alloc(SIZE_OF_SIZE)
  size.writeUInt32BE(size.length + msg.length, 0)
  return Buffer.concat([size, msg])
}

export const encodeXyoTopicBuffer = (topic: string, messageBuff: Buffer): Buffer => {
  const topicSize = Buffer.alloc(SIZE_OF_SIZE)
  const messageSize = Buffer.alloc(SIZE_OF_SIZE)
  const topicBuff = Buffer.from(topic)
  topicSize.writeUInt32BE(topicSize.length + topicBuff.length, 0)
  messageSize.writeUInt32BE(messageSize.length + messageBuff.length, 0)
  return Buffer.concat([topicSize, topicBuff, messageSize, messageBuff])
}

export const decodeXyoTopicBuffer = (buffer: Buffer, offset: number = 0): IXyoTopic => {
  const topicLength = buffer.readUInt32BE(offset)
  const messageLength = buffer.readUInt32BE(offset + topicLength)
  const topic = buffer.slice(SIZE_OF_SIZE + offset, offset + topicLength).toString()
  const message = buffer.slice(SIZE_OF_SIZE + offset + topicLength, offset + topicLength + messageLength).toString()
  return { topic, message, offset: offset + topicLength + messageLength }
}

export function accumulateChunks(cb: (msg: Buffer) => void): (chunk: Buffer) => void {
  let acc = Buffer.alloc(0)

  return (chunk: Buffer) => {
    acc = Buffer.concat([acc, chunk])

    if (acc.length < SIZE_OF_SIZE) {
      return
    }

    const sizeOfPayload = acc.readUInt32BE(0)

    if (acc.length < sizeOfPayload) {
      return
    }

    cb(acc.slice(SIZE_OF_SIZE, sizeOfPayload))
    acc = acc.slice(sizeOfPayload)
  }
}
