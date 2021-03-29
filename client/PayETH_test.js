var Web3 = require('web3');
var Yamljs = require('yamljs')

var addresses = Yamljs.load('./address.yaml')
var contractAddress = addresses.contract_address
var accountAddresses = addresses.account_addresses

var web3 = new Web3('ws://localhost:7545');
var rentPoolContractAbi = require('../build/contracts/RentPool.json').abi
var rentPoolContract = new web3.eth.Contract(rentPoolContractAbi, contractAddress, {
    gasPrice: '20000000000',
    gas: 6721975,
});

rentPoolContract.methods.PayETH().send({
    from: accountAddresses[0],
    gasPrice: '1000',
    gas: 1000000,
    value: web3.utils.toWei("10", "ether")
}).then(function (receipt) {
    console.log(receipt)
});