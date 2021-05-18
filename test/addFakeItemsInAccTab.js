contract('Operations', (accounts) => {

    let title = `gas used by [${scriptName}]`

    const fakePubkey = utils.str2bytes("fakePubkey");

    const length1 = 100;
    it(`should get ${title}, length of accTab[IoTid] is ${length1}`, async () => {
        const contractInstance = await Operations.deployed();

        // expire time is 1 hour later
        const uint256_expire = Math.round(Date.now() / 1000) + 3600;

        // make one rich
        const richman = accounts[3];
        // for (let i = 0; i < 5; i++) {
        //     await web3.eth.sendTransaction({
        //         from: accounts[4 + i],
        //         to: richman,
        //         value: web3.utils.toWei("90", "ether")
        //     });
        // }
        // console.log("rich man has", await web3.eth.getBalance(richman));

        // add a number of fake public key into accTab[IoTid]
        const result = await contractInstance.addFakeItemsInAccTab(uint32_id, length1 - 1, {
            from: richman,
            gas: 850000000000,
            gasPrice: 200
        })
        console.log("[addFakeItemsInAccTab] used ", result.receipt.gasUsed, "gas")

        // add the one we need to find
        await contractInstance.addAccTab(uint32_id, user.pubkey, user.pubkey, uint256_expire, right)

        const response = await contractInstance.GenerateSessionID(user.pubkey, uint32_id);
        console.log(response.receipt.gasUsed, title)
        assert.notEqual(response.receipt.gasUsed, undefined, `wrong response: ${response}`);
    });
});