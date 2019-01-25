interface IXyoTopic {
  topic: string
  message: string
  offset: number
}

export const encodeXyoBuffer = (msg: Buffer): Buffer => {
  const size = Buffer.alloc(4)
  size.writeUInt32BE(size.length + msg.length, 0)
  return Buffer.concat([size, msg])
}

export const encodeXyoTopicBuffer = (topic: string, messageBuff: Buffer): Buffer => {
  const topicSize = Buffer.alloc(4)
  const messageSize = Buffer.alloc(4)
  const topicBuff = Buffer.from(topic)
  topicSize.writeUInt32BE(topicSize.length + topicBuff.length, 0)
  messageSize.writeUInt32BE(messageSize.length + messageBuff.length, 0)
  return Buffer.concat([topicSize, topicBuff, messageSize, messageBuff])
}

export const decodeXyoTopicBuffer = (buffer: Buffer, offset: number = 0): IXyoTopic => {
  const topicLength = buffer.readUInt32BE(offset)
  const messageLength = buffer.readUInt32BE(offset + topicLength)
  const topic = buffer.slice(4 + offset, offset + topicLength).toString()
  const message = buffer.slice(4 + offset + topicLength, offset + topicLength + messageLength).toString()
  return { topic, message, offset: offset + topicLength + messageLength }
}

export function accumulateChunks(cb: (msg: Buffer) => void): (chunk: Buffer) => void {
  let acc = Buffer.alloc(0)

  return (chunk: Buffer) => {
    acc = Buffer.concat([acc, chunk])

    if (acc.length < 4) {
      return
    }

    const sizeOfPayload = acc.readUInt32BE(0)

    if (acc.length < sizeOfPayload) {
      return
    }

    cb(acc.slice(4, sizeOfPayload))
    acc = acc.slice(sizeOfPayload)
  }
}
