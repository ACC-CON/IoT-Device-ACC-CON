var Yamljs = require('yamljs')
var environment = Yamljs.load('./environment.yaml')

var Web3 = require('web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(environment.protocol + '://' + environment.host_ip_address + ':' + environment.port_number));

var contractAddress = environment.contract_address
var accountAddresses = environment.account_addresses

var rentPoolContractAbi = require('../build/contracts/RentPool.json').abi
var rentPoolContract = new web3.eth.Contract(rentPoolContractAbi, contractAddress, {
    gasPrice: '20000000000',
    gas: 6721975,
});

rentPoolContract.methods.PayETH(web3.utils.toWei("1", "ether")).send({
    from: accountAddresses[0],
    gasPrice: '1000',
    gas: 1000000,
}).then(function (receipt) {
    console.log(receipt)
});