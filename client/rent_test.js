var Web3 = require('web3');

var web3 = new Web3('ws://localhost:7545');

var jsonInterface = require('../build/contracts/RentPool.json').abi;

var contract_address = '0x835F4C5337Ca5Cd42C58d25F768a0058b17745D9'

var contract = new web3.eth.Contract(jsonInterface, contract_address, {
    gasPrice: '20000000000', // The gas price in wei to use for transactions.
    gas: '6721975',          // The maximum gas provided for a transaction (gas limit).
});

var account1_address = '0x2bb6ab549fFaa4da73C529e3E2bE29d319385e38'
var account2_address = '0x3B473ffE5200Eb16b98BBfEB1a311f8436214E69'

// contract.methods.ReceiveETH().call({
//     from: account1_address,        // The address the transaction should be sent from.
//     gasPrice: '200',               // The gas price in wei to use for this transaction.
//     gas: '100000',                 // The maximum gas provided for this transaction (gas limit).
//     value: web3.utils.toWei("10", "ether")     // The value transferred for the transaction in wei.
// }, function (err, value) {
//     console.log(err, value)
// });

// // using the promise
// contract.methods.ReceiveETH().send({
//     from: account2_address,        // The address the transaction should be sent from.
//     gasPrice: '200',               // The gas price in wei to use for this transaction.
//     gas: '100000',                 // The maximum gas provided for this transaction (gas limit).
//     value: web3.utils.toWei("5", "ether")    
// })
// .then(function(receipt){
//     console.log(receipt)
// });

var account2_address = '0x3B473ffE5200Eb16b98BBfEB1a311f8436214E69'

contract.methods.PayETH(web3.utils.toWei("1", "ether")).send({
    from: account2_address,          // The address the transaction should be sent from.
    gasPrice: '200',                 // The gas price in wei to use for this transaction.
    gas: '100000',                   // The maximum gas provided for this transaction (gas limit).
    value: web3.utils.toWei("1", "ether")     // The value transferred for the transaction in wei.
}).then(function(receipt){
    console.log(receipt)
});











