const Operations = artifacts.require("Operations");
const utils = require("../utils")

const scriptName = utils.scriptName(__filename);
const testData = utils.testData;

const { uint32_id, string_name, uint32_price } = testData.device;

contract('Operations', (accounts) => {
    let title = `gas used by [${scriptName}]`
    it(`should log ${title}`, async () => {
        const contractInstance = await Operations.deployed();

        const owner = await utils.createAccount(web3, utils.prikeys[testData.ownerIndex]);
        
        const response = await contractInstance.Register(owner.pubkey, uint32_id, string_name, uint32_price);
        console.log(response.receipt.gasUsed, title)
        assert.notEqual(response.receipt.gasUsed, undefined, `wrong response: ${response}`);
    });
});