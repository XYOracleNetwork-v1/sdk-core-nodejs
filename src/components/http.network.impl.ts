/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 20th August 2018 12:42:51 pm
 * @Email:  developer@xyfindables.com
 * @Filename: http.network.impl.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 28th August 2018 3:57:43 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { INetwork, IReceiver, IListenerConnection } from '../types/network';
import http from 'http';

/**
 * An `HttpNetwork` is an http implementation of INetwork.
 * It provides the hooks for `Receiver` and `Listener` consumer via
 * traditional http client & server constructs
 */

export class HttpNetwork implements INetwork {

  /**
   * Will register a receiver to listen at the id specified. In this case, the
   * id should correspond to a URL.
   *
   * @param id An ip address with a host and  port, such as `127.0.0.1:8080`
   * @param receiver The receiver that will handle incoming messages.
   */

  public registerReceiver(id: string, receiver: IReceiver): boolean {
    const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
      const body: Buffer[] = [];
      let bodyStr = '';

      req.on('data', (chunk: Buffer) => {
        body.push(chunk);
      });

      req.on('end', async () => {
        bodyStr = Buffer.concat(body).toString();
        const result = await receiver.onDataReceive(bodyStr, 'utf8');
        res.write(result);
        res.end();
      });
    });

    server.listen(id.split(':')[1]);

    return true;
  }

  /**
   * Requests a connection from the network to a given id, in this case, id should
   * correspond to a URL.
   * @param id An ip address with a host and port value i.e. 127.0.0.1:8080
   * @returns Will returns an IListenerConnection that can be used to send messages
   *          to the receivers specified by the `id` parameter
   */

  public async requestConnection(id: string): Promise<IListenerConnection | null> {
    return {
      send: async (data: any, encoding: string) => {
        return new Promise((resolve) => {
          const req = http.request({
            hostname: id.split(':')[0],
            port: id.split(':')[1],
            method: 'POST',
          }, (res) => {
            res.setEncoding(encoding);
            let resBody = '';

            res.on('data', (chunk) => {
              resBody += chunk;
            });

            res.on('end', () => {
              return resolve(resBody);
            });
          });

          req.write(data);
          req.end();
        });
      },
      disconnect: async () => {
        return true;
      }
    };
  }
}
