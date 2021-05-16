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
    var len=0
    it(`should log ${title}`, async () => {
        const contractInstance = await Operations.deployed();
        const experiments = [1];
        const experiment_results = [];
        
        for (var i=0;i<100;i++){
            for (const loop_num of experiments) {
                // open access of device to user0
                const user0 = user;
                // expire time is 1 hour later
                const uint256_expire = Math.round(Date.now() / 1000) + 3600;
                await contractInstance.addAccTab(uint32_id, user0.pubkey, user0.pubkey, uint256_expire, right, {
                    from: accounts[1]
                })            
                len=await contractInstance.getAccTabLength.call(uint32_id,{
                    from: accounts[1]
                });
             
            }

        }   
        
    });
    after(`experiment results of [${scriptName}]`, async () => {
        console.log("accTab length",len);
    });
    
});