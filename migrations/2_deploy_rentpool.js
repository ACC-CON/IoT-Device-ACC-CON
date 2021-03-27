var RentPool = artifacts.require("./RentPool.sol");

module.exports = function (deployer) {
    deployer.deploy(RentPool);
};