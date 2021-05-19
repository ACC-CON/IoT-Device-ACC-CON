const Operations = artifacts.require("Operations");
const utils = require("../utils")

const scriptName = utils.scriptName(__filename);
const testData = utils.testData;

const { uint32_id, string_name, uint32_price } = testData.device;
const right = true;

contract('Operations', (accounts) => {

    let title = `gas used by [${scriptName}]`

    var user;
    before(`init accounts in current network. [${scriptName}]`, async () => {
        user = await utils.createAccount(web3, utils.prikeys[testData.userIndex]);
    });
    var len = 0
    it(`should log ${title}`, async () => {
        const contractInstance = await Operations.deployed();

        // expire time is 1 hour later
        const uint256_expire = Math.round(Date.now() / 1000) + 3600;

        var tasks = [];

        for (var i = 0; i < 100; i++) {
            tasks.push(contractInstance.addAccTab(uint32_id, user.pubkey, user.pubkey, uint256_expire, right, {
                from: accounts[1]
            }));
        }

        await Promise.all(tasks).then((results) => {
            console.log(results.length);
        });


    });

    after(`experiment results of [${scriptName}]`, async () => {
        console.log("accTab length", len);
    });

});