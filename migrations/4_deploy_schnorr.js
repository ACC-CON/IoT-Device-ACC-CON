var Schnorr = artifacts.require("Schnorr.sol");
var Curve = artifacts.require("Curve.sol");

module.exports = function (deployer) {
    deployer.deploy(Curve);
    deployer.link(Curve, Schnorr);
    deployer.deploy(Schnorr);
};