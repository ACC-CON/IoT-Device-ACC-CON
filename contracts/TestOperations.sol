pragma solidity ^0.5.17;

contract TestOperations {
    struct Auth {
        bytes from;
        bytes to;
        uint256 expire;
        bool right;
    }

    mapping(uint32 => Auth[]) public accTab;

    function addFakeItemsInAccTab(uint32 IoTid, uint256 num) public {
        for (uint256 index = 0; index < num; index++) {
            accTab[IoTid].push(
                Auth({from: "fakefrom", to: "faketo", expire: now, right: true})
            );
        }
    }
}
