import { Wizard } from "./base"
import { PortWizard } from "./port"

export interface IIpfsConfig {
  host: string,
  port: number,
  protocol: string
}

export class IpfsWizard extends Wizard {

  public async start(): Promise<IIpfsConfig> {
    const { host } = await this.prompt<{ host: string }>({
      type: 'input',
      name: 'ipfsHost',
      message: 'What is the IPFS host value',
      initial: 'ipfs.layerone.co',
    })

    const port = await (new PortWizard('What is the IPFS port value', 5002).start())

    const { protocol } = await this.prompt<{ protocol: string }>({
      initial: 'https',
      type: 'select',
      choices: ['https', 'http'],
      message: `What is the IPFS protocol?`,
      name: 'ipfsProtocol',
    })

    return { host, port, protocol }
  }
}
