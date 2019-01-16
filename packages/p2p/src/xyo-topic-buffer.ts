interface IXyoTopic {
  topic: string
  message: string
  offset: number
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

export const decodeAllXyoTopicBuffers = (buffer: Buffer): IXyoTopic[] => {
  const topics = []
  let offset = 0
  while (offset < buffer.length) {
    const next = decodeXyoTopicBuffer(buffer, offset)
    topics.push(next)
    offset = next.offset
  }
  return topics
}
