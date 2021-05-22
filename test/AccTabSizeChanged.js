const Operations = artifacts.require("Operations");
const utils = require("../utils")

const scriptName = utils.scriptName(__filename);
const testData = utils.testData;

const { uint32_id, string_name, uint32_price } = testData.device;

const bytes_type_user = utils.str2bytes("user");
const uint256_msg = testData.uint256_msg;
const right = true;

contract('Operations', (accounts) => {
    var owner;
    var user;
    before(`init accounts in current network. [${scriptName}]`, async () => {
        owner = await utils.createAccount(web3, utils.prikeys[testData.ownerIndex]);
        user = await utils.createAccount(web3, utils.prikeys[testData.userIndex]);
    });

    const addFakedatas = async (contractInstance, num, seed, fakedata) => {

        for (var i = 0; i < num; i++) {
            
            // avoid insert duplicated key
            let acc = web3.eth.accounts.create(`f${seed + i}a${seed + i + 1}k${seed + i + 2}e`);
            let pubkey = utils.pri2pubhex(acc.privateKey)
            
            await contractInstance.addAccTab(
                fakedata.id,
                pubkey,
                pubkey,
                fakedata.expire,
                fakedata.right,
                {
                    from: accounts[1]
                }
            );
        }
    }

    const experiments = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 200, 200, 200, 200, 200];
    const experiment_results = [];

    var accTabLength = 0;

    for (const newFakeNum of experiments) {

        // create testcases for every size of array
        it(`${scriptName}`, async () => {
            const contractInstance = await Operations.deployed();

            // expire time is 1 hour later
            const uint256_expire = Math.round(Date.now() / 1000) + 3600;

            // add fake data
            await addFakedatas(contractInstance, newFakeNum, accTabLength, {
                id: uint32_id,
                expire: uint256_expire,
                right
            });

            /*
             Delegate
             */
            // open access to owner
            contractInstance.addAccTab(uint32_id, owner.pubkey, owner.pubkey, uint256_expire, right, {
                from: accounts[1]
            })
            // create user's proof 
            const userProofResp = await contractInstance.CreateProof.call(user.prikey, uint256_msg, {
                from: accounts[2]
            });
            const user_proof = "0x" + userProofResp.out_s.toString(16) + userProofResp.out_e.toString(16);
            // delegate from owner to user
            // get[owner.pubkey]
            // this will add [user.pubkey]
            const response_Delegate = await contractInstance.Delegate(
                bytes_type_user,
                owner.pubkey,                  // delegate_from
                uint256_msg,
                uint32_id,
                user.pubkey,                   // delegate_to
                user_proof,                    // proofs_delegate_to
                uint256_expire,
                right
            );

            /*
             GenerateSessionID
             */
            // user generate his session id
            // search[user.pubkey]
            const response_GenerateSessionID = await contractInstance.GenerateSessionID(user.pubkey, uint32_id);

            /*
             Revoke
             */
            // owner register a device
            await contractInstance.Register(owner.pubkey, uint32_id, string_name, uint32_price);

            // owner revoke the user's right to use the device
            // check(to == user.pubkey)
            // del[user.pubkey]
            const response_Revoke = await contractInstance.Revoke(owner.pubkey, user.pubkey, uint32_id);

            /*
             gather result
             */
            accTabLength = (await contractInstance.getAccTabLength.call()).toNumber();
            experiment_results.push({
                accTabSize: accTabLength,
                GenerateSessionID: response_GenerateSessionID.receipt.gasUsed,
                Delegate: response_Delegate.receipt.gasUsed,
                Revoke: response_Revoke.receipt.gasUsed
            })
            console.table(experiment_results);

            assert.notEqual(accTabLength, undefined);
        });
    }

    after(`experiment results of [${scriptName}]`, async () => {
        console.table(experiment_results);
    });
});

// ┌─────────┬──────────────┬───────────────────┬──────────┬─────────┐
// │ (index) │ accTabLength │ GenerateSessionID │ Delegate │ Revoke  │
// ├─────────┼──────────────┼───────────────────┼──────────┼─────────┤
// │    0    │      0       │       38993       │ 1614121  │ 44560   │
// │    1    │      1       │       44788       │ 1619917  │ 47457   │
// │    2    │      11      │      102750       │ 1677889  │ 76438   │
// │    3    │      50      │      328940       │ 1904121  │ 259075  │
// │    4    │     111      │      683187       │ 2258431  │ 613323  │
// │    5    │     200      │      1201028      │ 2776372  │ 1131181 │
// └─────────┴──────────────┴───────────────────┴──────────┴─────────┘
