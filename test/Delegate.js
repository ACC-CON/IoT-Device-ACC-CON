const Operations = artifacts.require("Operations");
const utils = require("../utils")

const scriptName = utils.scriptName(__filename);
const testData = utils.testData;

const { uint32_id, string_name, uint32_price } = testData.device;
const bytes_type_owner= utils.str2bytes("owner");
const bytes_type_user= utils.str2bytes("user");
const uint256_msg = testData.uint256_msg;
const uint256_expire = 10;
const right = true;

contract('Operations', (accounts) => {

    let title = `gas used by [${scriptName}]`

    var owner;
    var user;
    var user1;
    before(`init accounts in current network. [${scriptName}]`, async () => {
        owner = await utils.createAccount(web3, utils.prikeys[testData.ownerIndex]);
        user  = await utils.createAccount(web3, utils.prikeys[testData.userIndex]);
        user1 = await utils.createAccount(web3, utils.prikeys[testData.userIndex + 2]);
    });

    it(`should log ${title} <type is owner>`, async () => {
        const contractInstance = await Operations.deployed();

        // owner register a device
        await contractInstance.Register(owner.pubkey, uint32_id, string_name, uint32_price);
        const bytes64_pubkey_delegate_from = owner.pubkey

        // create user's proof
        const bytes64_pubkey_delegate_to = user.pubkey;
        const userProof = await contractInstance.CreateProof.call(user.prikey, uint256_msg);
        const bytes64_proofs_delegate_to = "0x" + userProof.out_s.toString(16) + userProof.out_e.toString(16);
        // console.log(bytes64_proofs_delegate_to)
        
        // delegate from owner to user
        const response = await contractInstance.Delegate(
            bytes_type_owner, 
            bytes64_pubkey_delegate_from, 
            uint256_msg, 
            uint32_id, 
            bytes64_pubkey_delegate_to,
            bytes64_proofs_delegate_to,
            uint256_expire,
            right
        );
        console.log(response.receipt.gasUsed, title)
        assert.notEqual(response.receipt.gasUsed, undefined, `wrong response: ${response}`);
    });

    it(`should log ${title} <type is user>`, async () => {
        const contractInstance = await Operations.deployed();

        // open access of device to user0
        const user0 = user;
        // expire time is 1 hour later
        const uint256_expire = Math.round(Date.now() / 1000) + 3600;
        await contractInstance.addAccTab(uint32_id, user0.pubkey, user0.pubkey, uint256_expire, right, {
            from: accounts[1]
        })
        const bytes64_pubkey_delegate_from = user0.pubkey

        // create user1's proof 
        // FIXME: testData.userIndex + 1 checkK is false
        const bytes64_pubkey_delegate_to = user1.pubkey;
        const user1Proof = await contractInstance.CreateProof.call(user1.prikey, uint256_msg, {
            from: accounts[2]
        });
        const bytes64_proofs_delegate_to = "0x" + user1Proof.out_s.toString(16) + user1Proof.out_e.toString(16);

        // delegate from user0 to user1
        const response = await contractInstance.Delegate(
            bytes_type_user,
            bytes64_pubkey_delegate_from,
            uint256_msg,
            uint32_id,
            bytes64_pubkey_delegate_to,
            bytes64_proofs_delegate_to,
            uint256_expire,
            right
        );
        console.log(response.receipt.gasUsed, title)
        assert.notEqual(response.receipt.gasUsed, undefined, `wrong response: ${response}`);
    });

    const experiments = [0, 1, 10, 50, 100, 500, 1000, 5000, 10000];
    const experiment_results = [];

    for (const loop_num of experiments) {
        it(`should log ${title} <type is user>, length of accTab[IoTid] is ${loop_num}`, async () => {
            const contractInstance = await Operations.deployed();
    
            // open access of device to user0
            const user0 = user;
            // expire time is 1 hour later
            const uint256_expire = Math.round(Date.now() / 1000) + 3600;
            await contractInstance.addAccTab(uint32_id, user0.pubkey, user0.pubkey, uint256_expire, right, {
                from: accounts[1]
            })
            const bytes64_pubkey_delegate_from = user0.pubkey
    
            // create user1's proof 
            // FIXME: testData.userIndex + 1 checkK is false
            const bytes64_pubkey_delegate_to = user1.pubkey;
            const user1Proof = await contractInstance.CreateProof.call(user1.prikey, uint256_msg, {
                from: accounts[2]
            });
            const bytes64_proofs_delegate_to = "0x" + user1Proof.out_s.toString(16) + user1Proof.out_e.toString(16);
    
            // delegate from user0 to user1
            const response = await contractInstance.LoopToDelegate(
                bytes_type_user,
                bytes64_pubkey_delegate_from,
                uint256_msg,
                uint32_id,
                bytes64_pubkey_delegate_to,
                bytes64_proofs_delegate_to,
                uint256_expire,
                right,
                loop_num
            );
            experiment_results.push({
                length: loop_num,
                gasUsed: response.receipt.gasUsed
            })
            assert.notEqual(response.receipt.gasUsed, undefined, `wrong response: ${response}`);
        });
    }

    after(`experiment results of [${scriptName}]`, async () => {
        console.table(experiment_results);
    });
});