const Operations = artifacts.require("Operations");
const utils = require("../utils")

const scriptName = utils.scriptName(__filename);
const testData = utils.testData;

const { uint32_id, string_name, uint32_price } = testData.device;

const bytes_type_owner= utils.str2bytes("owner");
const uint256_msg = testData.uint256_msg;
const uint256_expire = 10;
const right = true;

contract('Operations', (accounts) => {

    let title = `gas used by [${scriptName}]`
    
    var owner;
    var user;
    before(`init accounts in current network. [${scriptName}]`, async () => {
        owner = await utils.createAccount(web3, utils.prikeys[testData.ownerIndex]);
        user  = await utils.createAccount(web3, utils.prikeys[testData.userIndex]);
    });

    it(`should get ${title}`, async () => {
        const contractInstance = await Operations.deployed();
        
        // owner register a device
        await contractInstance.Register(owner.pubkey, uint32_id, string_name, uint32_price);
        const bytes64_pubkey_delegate_from = owner.pubkey

        // create user's proof
        const bytes64_pubkey_delegate_to = user.pubkey;
        const userProof = await contractInstance.CreateProof.call(user.prikey, uint256_msg);
        const bytes64_proofs_delegate_to = "0x" + userProof.out_s.toString(16) + userProof.out_e.toString(16);

        // owner delegate to user
        await contractInstance.Delegate(
            bytes_type_owner, 
            bytes64_pubkey_delegate_from, 
            uint256_msg, 
            uint32_id, 
            bytes64_pubkey_delegate_to,
            bytes64_proofs_delegate_to,
            uint256_expire,
            right
        );

        // owner revoke the user's right to use the device
        const response = await contractInstance.Revoke(owner.pubkey, user.pubkey, uint32_id);
        console.log(response.receipt.gasUsed, title)
        assert.notEqual(response.receipt.gasUsed, undefined, `wrong response: ${response}`);
    });
});