var CKDPub = artifacts.require("CKDPub.sol");
var EllipticCurve = artifacts.require("EllipticCurve.sol");
var Sha512 = artifacts.require("Sha512.sol");

module.exports = function (deployer) {
    deployer.deploy(EllipticCurve);
    deployer.link(EllipticCurve, CKDPub);
    deployer.deploy(Sha512);
    deployer.link(Sha512, CKDPub);
    deployer.deploy(CKDPub);
};