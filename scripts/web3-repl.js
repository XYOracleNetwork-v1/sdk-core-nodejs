/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Friday, 1st February 2019 2:59:46 pm
 * @Email:  developer@xyfindables.com
 * @Filename: web3-repl
 
 * @Last modified time: Friday, 1st February 2019 3:30:27 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

/** Bootstrap a web3 repl environment */

const Web3 = require('web3')
const { HttpProvider } = require('web3-providers')
const web3 = new Web3(new HttpProvider('http://0.0.0.0:8545'))
const repl = require('repl');

repl.start('> ').context.web3 = web3;