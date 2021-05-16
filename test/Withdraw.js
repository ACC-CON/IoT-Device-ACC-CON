const Operations = artifacts.require("Operations");
const utils = require("../utils")

const scriptName = utils.scriptName(__filename);
const testData = utils.testData;
const { uint32_id, string_name, uint32_price } = testData.device;


contract('Operations', (accounts) => {
    let title = `gas used by [${scriptName}]`
    it(`should get ${title}`, async () => {
        const contractInstance = await Operations.deployed();
        const buyer = await utils.createAccount(web3, utils.prikeys[testData.buyerIndex]);

        // buyer deposit for device
        const a = await Operations.defaults({
            from: buyer.address,
            value: 654321
        })
        await contractInstance.Deposit(buyer.pubkey, uint32_id);

        // buyer withdraw
        const response = await contractInstance.Withdraw(2);
        console.log(response.receipt.gasUsed, title)
        assert.notEqual(response.receipt.gasUsed, undefined, `wrong response: ${response}`);
    });
});