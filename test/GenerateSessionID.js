const Operations = artifacts.require("Operations");
const utils = require("../utils")

const scriptName = utils.scriptName(__filename);
const testData = utils.testData;

const { uint32_id, string_name, uint32_price } = testData.device;
const right = true;

contract('Operations', (accounts) => {

    let title = `gas used by [${scriptName}]`

    var owner;
    var user;
    before(`init accounts in current network. [${scriptName}]`, async () => {
        owner = await utils.createAccount(web3, utils.prikeys[testData.ownerIndex]);
        user  = await utils.createAccount(web3, utils.prikeys[testData.userIndex]);
    });

    it(`should get ${title}, <accTab is null>`, async () => {
        const contractInstance = await Operations.deployed();

        const response = await contractInstance.GenerateSessionID(user.pubkey, uint32_id);
        console.log(response.receipt.gasUsed, title)
        assert.notEqual(response.receipt.gasUsed, undefined, `wrong response: ${response}`);
    });

    it(`should get ${title}`, async () => {
        const contractInstance = await Operations.deployed();

        // expire time is 1 hour later
        const uint256_expire = Math.round(Date.now() / 1000) + 3600;
        // open access of device to user
        await contractInstance.addAccTab(uint32_id, owner.pubkey, user.pubkey, uint256_expire, right)

        const response = await contractInstance.GenerateSessionID(user.pubkey, uint32_id);
        console.log(response.receipt.gasUsed, title)
        assert.notEqual(response.receipt.gasUsed, undefined, `wrong response: ${response}`);
    });

    const experiments = [0, 1, 10, 50, 100, 500, 1000, 5000, 10000];
    const experiment_results = [];

    for (const loop_num of experiments) {
        it(`should get ${title}, length of accTab[IoTid] is ${loop_num}`, async () => {
            const contractInstance = await Operations.deployed();
    
            // expire time is 1 hour later
            const uint256_expire = Math.round(Date.now() / 1000) + 3600;
            // add the one we need to find
            await contractInstance.addAccTab(uint32_id, user.pubkey, user.pubkey, uint256_expire, right)
    
            // add a number of fake public key into accTab[IoTid]
            const response = await contractInstance.LoopToGenerateSessionID(user.pubkey, uint32_id, loop_num);
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

// contract('Operations', (accounts) => {

//     let title = `gas used by [${scriptName}]`

//     const fakePubkey = utils.str2bytes("fakePubkey");

//     const length1 = 100;
//     it(`should get ${title}, length of accTab[IoTid] is ${length1}`, async () => {
//         const contractInstance = await Operations.deployed();

//         // expire time is 1 hour later
//         const uint256_expire = Math.round(Date.now() / 1000) + 3600;

//         // make one rich
//         const richman = accounts[3];
//         // for (let i = 0; i < 5; i++) {
//         //     await web3.eth.sendTransaction({
//         //         from: accounts[4 + i],
//         //         to: richman,
//         //         value: web3.utils.toWei("90", "ether")
//         //     });
//         // }
//         // console.log("rich man has", await web3.eth.getBalance(richman));

//         // add a number of fake public key into accTab[IoTid]
//         const result = await contractInstance.addFakeItemsInAccTab(uint32_id, length1 - 1, {
//             from: richman,
//             gas: 850000000000,
//             gasPrice: 200
//         })
//         console.log("[addFakeItemsInAccTab] used ", result.receipt.gasUsed, "gas")

//         // add the one we need to find
//         await contractInstance.addAccTab(uint32_id, user.pubkey, user.pubkey, uint256_expire, right)

//         const response = await contractInstance.GenerateSessionID(user.pubkey, uint32_id);
//         console.log(response.receipt.gasUsed, title)
//         assert.notEqual(response.receipt.gasUsed, undefined, `wrong response: ${response}`);
//     });
// });