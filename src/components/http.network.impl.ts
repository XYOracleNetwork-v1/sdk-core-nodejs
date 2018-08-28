/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 20th August 2018 12:42:51 pm
 * @Email:  developer@xyfindables.com
 * @Filename: http.network.impl.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 28th August 2018 8:51:43 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { INetwork, IReceiver, IListenerConnection } from '../types/network';
import http from 'http';

export class HttpNetwork implements INetwork {

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
