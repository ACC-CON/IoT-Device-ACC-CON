var Yamljs = require('yamljs')
var environment = Yamljs.load('./environment.yaml')

var Web3 = require('web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(environment.protocol + '://' + environment.host_ip_address + ':' + environment.port_number));

var contractAddress = environment.contract_address
var accountAddresses = environment.account_addresses

var CKDPubContractAbi = require('../build/contracts/CKDPub.json').abi
var CKDPubContract = new web3.eth.Contract(CKDPubContractAbi, contractAddress, {
    gasPrice: '20000000000',
    gas: 6721975,
});

// var bytes_input_hex = "0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"
// CKDPubContract.methods.SHA512(bytes_input_hex).call({
//     from: accountAddresses[1]
// }, function (error, result) {
//     console.log(result)
//     // should be: b69044b0e9bd4a9c37b9d3e25ac3edaa2b535f93894c2ea5a4ccfc3c4746d7eab3bd3169c6faa568f798bfab82198bc55f83a6c3534c5a24c5b839175c13c3f5
//     // [passed]
// });

// var uint256_private_key = "0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"
// CKDPubContract.methods.point(uint256_private_key).call({
//     from: accountAddresses[0]
// }, function (error, result) {
//     console.log(result)
//  
//     // Result {
//     //   '0': '41368939038460017089690463593392860417892426308765457203329747030588589193225',
//     //   '1': '35702972027818625020095973668955176075740885849864829235584237564223564379706'
//     // }
//     // [passed]
// });

// CKDPubContract.methods.ser32("0x1").call({
//     from: accountAddresses[1]
// }, function (error, result) {
//     console.log(result)
//     // should be: 00000001
//     // [passed]
// });

// var uint256_ser256_input = "82358703335270431014669253699111608378020585721534450150290191601091026375577"
// CKDPubContract.methods.ser256(uint256_ser256_input).call({
//     from: accountAddresses[1]
// }, function (error, result) {
//     console.log(result)
//     // should be: b6155fc9bcfe6df3af81aec97b12e1de938a842898e9eecec00c573a9c3c5399
//     // [passed]
// });

// var x_serp_input = "82358703335270431014669253699111608378020585721534450150290191601091026375577"
// var y_serp_input = "11859627817656909157111608906621721568122988392175529961634750220809629926685"
// CKDPubContract.methods.serp(x_serp_input, y_serp_input).call({
//     from: accountAddresses[1]
// }, function (error, result) {
//     console.log(result)
//     // should be: 03b6155fc9bcfe6df3af81aec97b12e1de938a842898e9eecec00c573a9c3c5399
//     // [passed]
// });

// var bytes32_parse256_input = "0x5af087b978d59330e6012c1f97c409c3b884abe087fef0b24fe476ca366a622c"
// CKDPubContract.methods.parse256(bytes32_parse256_input).call({
//     from: accountAddresses[1]
// }, function (error, result) {
//     console.log(result)
//     // should be: 41133136404113071986416133398245636481513716992809347954319015993198133273132
//     // [passed]
// });

// var bytes32_input_1 = "0x5af087b978d59330e6012c1f97c409c3b884abe087fef0b24fe476ca366a622c"
// var bytes32_input_2 = "0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"
// CKDPubContract.methods.bytesXOR(bytes32_input_1, bytes32_input_2).call({
//     from: accountAddresses[1]
// }, function (error, result) {
//     console.log(result)
//     // should be: 0x234ee1c78109289cb3a14e8a594302c4ba1f573baa30d86b1616f791209275b400000000000...
//     // [passed]
// });

// var uint256_input_key = "0xe6352421628682b1d4dcab3d37b93a6c5edb530451b3c94e3ec1adac1f1d6a7a"
// var bytes32_input_data = "0x03b6155fc9bcfe6df3af81aec97b12e1de938a842898e9eecec00c573a9c3c539900000000"
// CKDPubContract.methods.HMAC_SHA512(uint256_input_key, bytes32_input_data).call({
//     from: accountAddresses[1]
// }, function (error, result) {
//     console.log(result)
//     // should be: 
//     //   - L: 5af087b978d59330e6012c1f97c409c3b884abe087fef0b24fe476ca366a622c
//     //   - R: 787a3c08aa6fa9606bf642b1c46f1770430541f6a77679750c7bb040cb99e2c2
//     // [passed]
// });

// reference: https://stackoverflow.com/questions/18626844/convert-a-large-integer-to-a-hex-string-in-javascript
function dec2hex(str){ // .toString(16) only works up to 2^53
    var dec = str.toString().split(''), sum = [], hex = [], i, s
    while(dec.length){
        s = 1 * dec.shift()
        for(i = 0; s || i < sum.length; i++){
            s += (sum[i] || 0) * 10
            sum[i] = s % 16
            s = (s - sum[i]) / 16
        }
    }
    while(sum.length){
        hex.push(sum.pop().toString(16))
    }
    return hex.join('')
}

var uint256_pubkey_x = "0xb6155fc9bcfe6df3af81aec97b12e1de938a842898e9eecec00c573a9c3c5399";
var uint256_pubkey_y = "0x1a384fbc760f019e0fdf80f55113a9cef5039077a8dd31968b7ce6258a61051d";
var uint256_chain_code = "0xe6352421628682b1d4dcab3d37b93a6c5edb530451b3c94e3ec1adac1f1d6a7a";
var index = "0x00000000"
CKDPubContract.methods.driveChildPub(uint256_pubkey_x, uint256_pubkey_y, uint256_chain_code, index).estimateGas({
    from: accountAddresses[1]
}, function (error, result) {
    console.log(error, result)
    // console.log("Ki_x", dec2hex(result['Ki_x']))
    // console.log("Ki_y", dec2hex(result['Ki_y']))
    // console.log("ci  ", dec2hex(result['ci']))
    // should be: 
    // - Ki_x: 28b5222c6f87e07afaf9ab8d8b9edd64652289f7f71716adcf093f66fbfbe4f9
    // - Ki_y: fedd2a2cb7454870b1df21c047d5df61f1afb5313e7f0b277a820b9e5557d481
    // - ci  : 787a3c08aa6fa9606bf642b1c46f1770430541f6a77679750c7bb040cb99e2c2
    // [passed]
});
