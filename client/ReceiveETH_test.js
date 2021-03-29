var Web3 = require('web3');
var web3 = new Web3('127.0.0.1:7545');

var Yamljs = require('yamljs')
yamljs = Yamljs.load('./address.yaml')
jsonStr = JSON.stringify(yamljs)
jsonObj = JSON.parse(jsonStr)
var contractAddress = jsonObj.contractAddress
var accountAddresses = json.account_addresses

var rentPoolContractAbi = require('../build/contracts/RentPool.json').abi
var rentPoolContract = new web3.eth.Contract(rentPoolContractAbi, contractAddress, {
    gasPrice: '20000000000',
    gas: 6721975,
});

rentPoolContract.methods.ReceiveETH().send({
    from: accountAddresses[0],
    gasPrice: '1000',
    gas: 1000000,
    value: web3.utils.toWei("2", "ether")
}).then(function (receipt) {
    console.log(receipt)
});