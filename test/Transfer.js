const Operations = artifacts.require("Operations");
const utils = require("../utils")

const scriptName = utils.scriptName(__filename);
const testData = utils.testData;

const { uint32_id, string_name, uint32_price } = testData.device;

contract('Operations', (accounts) => {
    let title = `gas used by [${scriptName}]`
    it(`should get ${title}`, async () => {
        const contractInstance = await Operations.deployed();
        // owner register a device
        const owner = await utils.createAccount(web3, utils.prikeys[testData.ownerIndex]);
        await contractInstance.Register(owner.pubkey, uint32_id, string_name, uint32_price);

        // buyer deposit for the device
        const buyer = await utils.createAccount(web3, utils.prikeys[testData.buyerIndex]);
        await contractInstance.Deposit(buyer.pubkey, uint32_id, {
            from: buyer.address,
            value: 6666
        });
        
        // owner transfer device to buyer
        const response = await contractInstance.Transfer(owner.pubkey, buyer.pubkey, uint32_id, {
            from: owner.address
        });
        console.log(response.receipt.gasUsed, title)
        assert.notEqual(response.receipt.gasUsed, undefined, `wrong response: ${response}`);
    });
});