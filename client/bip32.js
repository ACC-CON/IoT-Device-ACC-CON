const HDKey = require('ethereumjs-wallet/hdkey')
const bip39 = require('bip39')

// Generate mnemonic and seed
const mnemonic = bip39.generateMnemonic()
const seed = bip39.mnemonicToSeed(mnemonic)
console.log(`generated mnemonic:\n\t${mnemonic}\n`)

// Wallet from seed and get the public Extended key
const walletPriv = HDKey.fromMasterSeed(seed)
const pubExtKey = walletPriv.publicExtendedKey()
console.log(`public key:\n\t${pubExtKey}`)

// Wallet from public Extended key and derive children
const walletPub = HDKey.fromExtendedKey(pubExtKey)
// console.log(`\nchild keys from extended public:\n`)
var t1 = new Date().getTime();
n=10000
// for (var idx = 0; idx < n; idx++) {
// 	// walletPub
//  //        .deriveChild(idx)
//  //        .getWallet()
//  //        .getPublicKeyString()
//     walletPriv.deriveChild(idx)
//         .getWallet()
//         // .getPrivateKeyString()    
//         .getPublicKeyString()
// }
// var t2 = new Date().getTime();
// console.log(t1,(t2-t1)/n)



const crypto = require('crypto');
const buffer = require('buffer');
  
// Create a private key
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
});
var t1 = new Date().getTime();    
signature=""
for (var idx = 0; idx < n; idx++) {
	const data = Buffer.from("I Love GeeksForGeeks");
	const sign = crypto.sign("RSA-SHA3-256", data , privateKey);
	signature= sign.toString('base64');	
}
var t2 = new Date().getTime();
console.log(t1,(t2-t1)/n) 
console.log(`Signature:\n\n ${signature}`);
