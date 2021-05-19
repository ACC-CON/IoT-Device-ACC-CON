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
        user = await utils.createAccount(web3, utils.prikeys[testData.userIndex]);
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

});