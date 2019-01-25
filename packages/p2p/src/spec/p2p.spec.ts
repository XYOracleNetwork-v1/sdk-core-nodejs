
import { XyoPeerTransport, XyoPeerDiscoveryService, XyoP2PService } from "../"
import { encodeXyoTopicBuffer, decodeXyoTopicBuffer } from "../xyo-topic-buffer"
import { XyoPeerConnection } from "../xyo-peer-connection"
import { Socket } from "net"
import { EventEmitter } from "events"

interface IPeer {
  publicKey: string
  address: string
}

const createPeer = (port: number, i: number): IPeer => ({
  publicKey: `peer ${i}`,
  address: `/ip4/0.0.0.0/tcp/${port + i}`
})

const createP2PService = (peer: IPeer) => {
  const transport = new XyoPeerTransport(peer.address)
  const discovery = new XyoPeerDiscoveryService(peer.publicKey, peer.address, transport)
  const node = new XyoP2PService(discovery)
  return { transport, discovery, node }
}

const peer1 = {
  publicKey: 'I am peer 1',
  address: '/ip4/0.0.0.0/tcp/9595',
  peers: []
}

const peer2 = {
  publicKey: 'I am peer 2',
  address: '/ip4/0.0.0.0/tcp/9596',
  peers: []
}

const peer3 = {
  publicKey: 'I am peer 3',
  address: '/ip4/0.0.0.0/tcp/9597',
  peers: [peer1]
}

describe(`P2P`, () => {
  it(`Should encode a topic buffer`, () => {
    const topic = 'topic'
    const message = 'Hello World'
    const buff = encodeXyoTopicBuffer(topic, Buffer.from(message))
    const topicLength = buff.readInt32BE(0)
    const messageLength = buff.readInt32BE(topicLength)
    const expectedBuff = [
      0,
      0,
      0,
      9,
      116,
      111,
      112,
      105,
      99,
      0,
      0,
      0,
      15,
      72,
      101,
      108,
      108,
      111,
      32,
      87,
      111,
      114,
      108,
      100
    ]

    expect(topicLength).toBe(9)
    expect(messageLength).toBe(15)
    expect(buff.slice(4, topicLength).toString()).toBe(topic)
    expect(buff.slice(4 + topicLength, topicLength + messageLength).toString()).toBe(message)
    expect(buff.toJSON().data).toEqual(expectedBuff)
  })

  it(`Should decode multiple topic buffers`, () => {
    const buff = encodeXyoTopicBuffer('topic1', Buffer.from('foo'))
    expect(decodeXyoTopicBuffer(buff)).toEqual({
      topic: 'topic1',
      message: 'foo',
      offset: 17
    })
  })

  it('Should wait for entire buffer', (done) => {
    const value1 = 'hello'
    const value2 = 'world'
    const emitter = new EventEmitter()
    const connection = new XyoPeerConnection(emitter as Socket)
    const received: any[] = []
    connection.onMessage((msg) => {
      received.push(msg)
      if (received.length === 1) {
        expect(msg.toString()).toBe(value1)
      }
      if (received.length === 2) {
        expect(msg.toString()).toBe(value2)
        done()
      }
    })

    const size1 = Buffer.alloc(4)
    const message1 = Buffer.from(value1.slice(0, 2))
    const message2 = Buffer.from(value1.slice(2))
    size1.writeUInt32BE(size1.length + message1.length + message2.length, 0)
    emitter.emit('data', size1)
    emitter.emit('data', message1)
    emitter.emit('data', message2)

    const size2 = Buffer.alloc(4)
    const message3 = Buffer.from(value2.slice(0, 2))
    const message4 = Buffer.from(value2.slice(2))
    size1.writeUInt32BE(size1.length + message3.length + message4.length, 0)
    emitter.emit('data', size1)
    emitter.emit('data', message3)
    emitter.emit('data', message4)
  })

  it(`Should create a transport`, () => {
    expect(new XyoPeerTransport(peer1.address)).toBeInstanceOf(XyoPeerTransport)
  })

  it(`Should concat buffers`, () => {
    const buff = Buffer.concat([Buffer.from('hello'), Buffer.from(';'), Buffer.from('world')])
    expect(buff.toString().split(';')).toEqual(['hello', 'world'])
  })

  it(`Should communicate`, async (done) => {
    const transport = new XyoPeerTransport(peer1.address)

    await transport.start()

    const order = jest.fn()

    transport.onConnection((connection) => {
      order(1)
      connection.onMessage((msg) => {
        const { type, data } = JSON.parse(msg.toString())
        switch (type) {
          case 2:
            order(3)
            return connection.write(Buffer.from(JSON.stringify({ type: 3 })))
          case 4:
            order(5)
            return connection.write(Buffer.from(JSON.stringify({ type: 5 })))
        }
      })
    })

    transport.dial(peer1.address).then((connection) => {
      order(2)
      connection.onMessage((msg) => {
        const { type, data } = JSON.parse(msg.toString())
        switch (type) {
          case 3:
            order(4)
            return connection.write(Buffer.from(JSON.stringify({ type: 4 })))
          case 5:
            order(6)
            return connection.close()
        }
      })

      connection.write(Buffer.from(JSON.stringify({ type: 2 })))

      connection.onClose(() => {
        transport.stop()
        order(7)
        expect(order.mock.invocationCallOrder).toEqual([1, 2, 3, 4, 5, 6, 7])
        done()
      })
    })
  })

  it(`Should discover peers`, async (done) => {
    const transport1 = new XyoPeerTransport(peer1.address)
    const discovery1 = new XyoPeerDiscoveryService(peer1.publicKey, peer1.address, transport1)

    const transport2 = new XyoPeerTransport(peer2.address)
    const discovery2 = new XyoPeerDiscoveryService(peer2.publicKey, peer2.address, transport2)

    const discovered = jest.fn()
    discovery2.addBootstrapNodes([peer1.address])
    await discovery1.start()
    await discovery2.start()

    discovery1.onDiscovery((conn) => {
      discovered(conn.publicKey)
    })
    discovery2.onDiscovery((conn) => {
      discovered(conn.publicKey)
      discovery1.stop()
      discovery2.stop()
      expect(discovered.mock.calls).toEqual([
        [peer2.publicKey],
        [peer1.publicKey],
      ])
      done()
    })
  })

  it(`Should create a new P2P Service`, async (done) => {
    const transport1 = new XyoPeerTransport(peer1.address)
    const discovery1 = new XyoPeerDiscoveryService(peer1.publicKey, peer1.address, transport1)
    const node1 = new XyoP2PService(discovery1)

    const transport2 = new XyoPeerTransport(peer2.address)
    const discovery2 = new XyoPeerDiscoveryService(peer2.publicKey, peer2.address, transport2)
    const node2 = new XyoP2PService(discovery2)

    const transport3 = new XyoPeerTransport(peer3.address)
    const discovery3 = new XyoPeerDiscoveryService(peer3.publicKey, peer3.address, transport3)
    const node3 = new XyoP2PService(discovery3)

    discovery1.start()
    discovery2.start()
    discovery3.start()
    discovery3.addBootstrapNodes([peer1.address, peer2.address])
    discovery1.onDiscovery((connection) => {
      expect(connection.publicKey).toBe(peer3.publicKey)
      expect(node1.getPeers().length).toBe(1)
      // expect(node3.getPeers().length).toBe(0)
    })

    discovery2.onDiscovery((connection) => {
      expect(connection.publicKey).toBe(peer3.publicKey)
      expect(node2.getPeers().length).toBe(1)
      // expect(node3.getPeers().length).toBe(1)
    })

    discovery3.onDiscovery((connection) => {
      expect([peer1.publicKey, peer2.publicKey]).toContain(connection.publicKey)
      if (node3.getPeers().length === 2) {
        discovery1.stop()
        discovery2.stop()
        discovery3.stop()
        done()
      }
    })
  })

  it('Should recursively discover peers of peers', async (done) => {
    const transport1 = new XyoPeerTransport(peer1.address)
    const discovery1 = new XyoPeerDiscoveryService(peer1.publicKey, peer1.address, transport1)
    const node1 = new XyoP2PService(discovery1)

    const transport2 = new XyoPeerTransport(peer2.address)
    const discovery2 = new XyoPeerDiscoveryService(peer2.publicKey, peer2.address, transport2)
    const node2 = new XyoP2PService(discovery2)

    const transport3 = new XyoPeerTransport(peer3.address)
    const discovery3 = new XyoPeerDiscoveryService(peer3.publicKey, peer3.address, transport3)
    const node3 = new XyoP2PService(discovery3)

    const discovered = jest.fn()
    await discovery1.start()
    await discovery2.start()
    await discovery3.start()

    discovery1.addBootstrapNodes([peer2.address])

    discovery2.onDiscovery((connection) => {
      discovered(peer2.publicKey, connection.publicKey)
    })

    discovery1.onDiscovery((connection) => {
      discovered(peer1.publicKey, connection.publicKey)
      discovery3.addBootstrapNodes([peer2.address])
    })

    discovery3.onDiscovery((connection) => {
      discovered(peer3.publicKey, connection.publicKey)
      if (node3.getPeers().length === 2) {
        complete()
      }
    })

    function complete() {
      discovery1.stop()
      discovery2.stop()
      discovery3.stop()
      expect(node1.getPeers().length).toBe(2)
      expect(node2.getPeers().length).toBe(2)
      expect(node3.getPeers().length).toBe(2)
      expect(discovered.mock.calls).toEqual([
        [peer2.publicKey, peer1.publicKey],
        [peer1.publicKey, peer2.publicKey],
        [peer2.publicKey, peer3.publicKey],
        [peer3.publicKey, peer2.publicKey],
        [peer1.publicKey, peer3.publicKey],
        [peer3.publicKey, peer1.publicKey],
      ])
      done()
    }

  })

  it('Should handle many connections', async () => {
    const port = 9000
    const count = 10
    const discovered = jest.fn()
    const bootstrapPeer = createPeer(port, 0)
    const create = (i: number): Promise<IPeer> => {
      return new Promise((resolve) => {
        const peer = createPeer(port, i)
        const { transport, discovery, node } = createP2PService(peer)
        discovery.start()
        discovery.addBootstrapNodes([bootstrapPeer.address])
        discovery.onDiscovery((connection) => {
          discovered(peer.publicKey, connection.publicKey)
          if (node.getPeers().length === count - 1) {
            discovery.stop()
            resolve(peer)
          }
        })
      })
    }

    const peers = await Promise.all([...Array(count)].map((_, i) => create(i)))
    expect(discovered).toBeCalledTimes(count * (count - 1))
    expect(discovered).toBeCalledWith(peers[0].publicKey, peers[1].publicKey)
    expect(discovered).toBeCalledWith(peers[0].publicKey, peers[2].publicKey)
    expect(discovered).toBeCalledWith(peers[0].publicKey, peers[3].publicKey)
    expect(discovered).toBeCalledWith(peers[0].publicKey, peers[4].publicKey)
    expect(discovered).toBeCalledWith(peers[0].publicKey, peers[5].publicKey)
    expect(discovered).toBeCalledWith(peers[0].publicKey, peers[6].publicKey)
    expect(discovered).toBeCalledWith(peers[0].publicKey, peers[7].publicKey)
    expect(discovered).toBeCalledWith(peers[0].publicKey, peers[8].publicKey)
    expect(discovered).toBeCalledWith(peers[0].publicKey, peers[9].publicKey)

    expect(discovered).toBeCalledWith(peers[1].publicKey, peers[0].publicKey)
    expect(discovered).toBeCalledWith(peers[2].publicKey, peers[0].publicKey)
    expect(discovered).toBeCalledWith(peers[3].publicKey, peers[0].publicKey)
    expect(discovered).toBeCalledWith(peers[4].publicKey, peers[0].publicKey)
    expect(discovered).toBeCalledWith(peers[5].publicKey, peers[0].publicKey)
    expect(discovered).toBeCalledWith(peers[6].publicKey, peers[0].publicKey)
    expect(discovered).toBeCalledWith(peers[7].publicKey, peers[0].publicKey)
    expect(discovered).toBeCalledWith(peers[8].publicKey, peers[0].publicKey)
    expect(discovered).toBeCalledWith(peers[9].publicKey, peers[0].publicKey)

    expect(discovered).toBeCalledWith(peers[1].publicKey, peers[2].publicKey)
    expect(discovered).toBeCalledWith(peers[1].publicKey, peers[3].publicKey)
    expect(discovered).toBeCalledWith(peers[1].publicKey, peers[4].publicKey)
    expect(discovered).toBeCalledWith(peers[1].publicKey, peers[5].publicKey)
    expect(discovered).toBeCalledWith(peers[1].publicKey, peers[6].publicKey)
    expect(discovered).toBeCalledWith(peers[1].publicKey, peers[7].publicKey)
    expect(discovered).toBeCalledWith(peers[1].publicKey, peers[8].publicKey)
    expect(discovered).toBeCalledWith(peers[1].publicKey, peers[9].publicKey)

    expect(discovered).toBeCalledWith(peers[2].publicKey, peers[3].publicKey)
    expect(discovered).toBeCalledWith(peers[2].publicKey, peers[4].publicKey)
    expect(discovered).toBeCalledWith(peers[2].publicKey, peers[5].publicKey)
    expect(discovered).toBeCalledWith(peers[2].publicKey, peers[6].publicKey)
    expect(discovered).toBeCalledWith(peers[2].publicKey, peers[7].publicKey)
    expect(discovered).toBeCalledWith(peers[2].publicKey, peers[8].publicKey)
    expect(discovered).toBeCalledWith(peers[2].publicKey, peers[9].publicKey)

    expect(discovered).toBeCalledWith(peers[3].publicKey, peers[4].publicKey)
    expect(discovered).toBeCalledWith(peers[3].publicKey, peers[5].publicKey)
    expect(discovered).toBeCalledWith(peers[3].publicKey, peers[6].publicKey)
    expect(discovered).toBeCalledWith(peers[3].publicKey, peers[7].publicKey)
    expect(discovered).toBeCalledWith(peers[3].publicKey, peers[8].publicKey)
    expect(discovered).toBeCalledWith(peers[3].publicKey, peers[9].publicKey)

    expect(discovered).toBeCalledWith(peers[4].publicKey, peers[5].publicKey)
    expect(discovered).toBeCalledWith(peers[4].publicKey, peers[6].publicKey)
    expect(discovered).toBeCalledWith(peers[4].publicKey, peers[7].publicKey)
    expect(discovered).toBeCalledWith(peers[4].publicKey, peers[8].publicKey)
    expect(discovered).toBeCalledWith(peers[4].publicKey, peers[9].publicKey)

    expect(discovered).toBeCalledWith(peers[5].publicKey, peers[6].publicKey)
    expect(discovered).toBeCalledWith(peers[5].publicKey, peers[7].publicKey)
    expect(discovered).toBeCalledWith(peers[5].publicKey, peers[8].publicKey)
    expect(discovered).toBeCalledWith(peers[5].publicKey, peers[9].publicKey)

    expect(discovered).toBeCalledWith(peers[6].publicKey, peers[7].publicKey)
    expect(discovered).toBeCalledWith(peers[6].publicKey, peers[8].publicKey)
    expect(discovered).toBeCalledWith(peers[6].publicKey, peers[9].publicKey)

    expect(discovered).toBeCalledWith(peers[7].publicKey, peers[8].publicKey)
    expect(discovered).toBeCalledWith(peers[7].publicKey, peers[9].publicKey)

    expect(discovered).toBeCalledWith(peers[8].publicKey, peers[9].publicKey)

    expect(discovered).toBeCalledWith(peers[2].publicKey, peers[1].publicKey)
    expect(discovered).toBeCalledWith(peers[3].publicKey, peers[1].publicKey)
    expect(discovered).toBeCalledWith(peers[4].publicKey, peers[1].publicKey)
    expect(discovered).toBeCalledWith(peers[5].publicKey, peers[1].publicKey)
    expect(discovered).toBeCalledWith(peers[6].publicKey, peers[1].publicKey)
    expect(discovered).toBeCalledWith(peers[7].publicKey, peers[1].publicKey)
    expect(discovered).toBeCalledWith(peers[8].publicKey, peers[1].publicKey)
    expect(discovered).toBeCalledWith(peers[9].publicKey, peers[1].publicKey)

    expect(discovered).toBeCalledWith(peers[3].publicKey, peers[2].publicKey)
    expect(discovered).toBeCalledWith(peers[4].publicKey, peers[2].publicKey)
    expect(discovered).toBeCalledWith(peers[5].publicKey, peers[2].publicKey)
    expect(discovered).toBeCalledWith(peers[6].publicKey, peers[2].publicKey)
    expect(discovered).toBeCalledWith(peers[7].publicKey, peers[2].publicKey)
    expect(discovered).toBeCalledWith(peers[8].publicKey, peers[2].publicKey)
    expect(discovered).toBeCalledWith(peers[9].publicKey, peers[2].publicKey)

    expect(discovered).toBeCalledWith(peers[4].publicKey, peers[3].publicKey)
    expect(discovered).toBeCalledWith(peers[5].publicKey, peers[3].publicKey)
    expect(discovered).toBeCalledWith(peers[6].publicKey, peers[3].publicKey)
    expect(discovered).toBeCalledWith(peers[7].publicKey, peers[3].publicKey)
    expect(discovered).toBeCalledWith(peers[8].publicKey, peers[3].publicKey)
    expect(discovered).toBeCalledWith(peers[9].publicKey, peers[3].publicKey)

    expect(discovered).toBeCalledWith(peers[5].publicKey, peers[4].publicKey)
    expect(discovered).toBeCalledWith(peers[6].publicKey, peers[4].publicKey)
    expect(discovered).toBeCalledWith(peers[7].publicKey, peers[4].publicKey)
    expect(discovered).toBeCalledWith(peers[8].publicKey, peers[4].publicKey)
    expect(discovered).toBeCalledWith(peers[9].publicKey, peers[4].publicKey)

    expect(discovered).toBeCalledWith(peers[6].publicKey, peers[5].publicKey)
    expect(discovered).toBeCalledWith(peers[7].publicKey, peers[5].publicKey)
    expect(discovered).toBeCalledWith(peers[8].publicKey, peers[5].publicKey)
    expect(discovered).toBeCalledWith(peers[9].publicKey, peers[5].publicKey)

    expect(discovered).toBeCalledWith(peers[7].publicKey, peers[6].publicKey)
    expect(discovered).toBeCalledWith(peers[8].publicKey, peers[6].publicKey)
    expect(discovered).toBeCalledWith(peers[9].publicKey, peers[6].publicKey)

    expect(discovered).toBeCalledWith(peers[8].publicKey, peers[7].publicKey)
    expect(discovered).toBeCalledWith(peers[9].publicKey, peers[7].publicKey)

    expect(discovered).toBeCalledWith(peers[9].publicKey, peers[8].publicKey)
  })
})
