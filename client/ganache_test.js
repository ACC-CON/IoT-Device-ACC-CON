var Web3 = require('web3');

var web3 = new Web3('ws://localhost:7545');

var account1_address = '0x2bb6ab549fFaa4da73C529e3E2bE29d319385e38'
var account2_address = '0x3B473ffE5200Eb16b98BBfEB1a311f8436214E69'

web3.eth.sendTransaction({
    to: account1_address,
    from: account2_address,
    value: web3.utils.toWei("0.5", "ether")
})