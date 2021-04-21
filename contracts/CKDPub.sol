pragma solidity ^0.5.17;

import "./EllipticCurve.sol";
import "./Sha512.sol";

contract CKDPub {
    uint256 public constant GX = 0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798;
    uint256 public constant GY = 0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8;
    uint256 public constant AA = 0;
    uint256 public constant BB = 7;
    uint256 public constant PP = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F;

    uint32 private constant BIP32_HARDEN = 0x80000000;

    /// @notice Calculate exclusive-OR of two bytes. a ^ b
    function bytesXOR(bytes memory a, bytes memory b)
        public
        pure
        returns (bytes memory)
    {
        bytes memory result = new bytes(128);
        for (uint8 index = 0; index < 32; index++) {
            result[index] = a[index] ^ b[index];
        }
    }

    /// @notice get concatenation of two bytes. a || b
    function concat(bytes memory a, bytes memory b)
        public
        pure
        returns (bytes memory)
    {
        return abi.encodePacked(a, b);
    }

    /// @notice count sha512 result of input bytes message
    function SHA512(bytes memory message) public pure returns (bytes memory) {
        uint64[8] memory result = Sha512.digest(message);
        return
            abi.encodePacked(
                uint64(result[0]),
                uint64(result[1]),
                uint64(result[2]),
                uint64(result[3]),
                uint64(result[4]),
                uint64(result[5]),
                uint64(result[6]),
                uint64(result[7])
            );
    }

    function bytesToBytes32(bytes memory b, uint offset) private pure returns (bytes32) {
        bytes32 out;

        for (uint i = 0; i < 32; i++) {
            out |= bytes32(b[offset + i] & 0xFF) >> (i * 8);
        }
        return out;
    }

    uint8 private constant SHA512_block_size = 128;

    /// @notice Calculate the HMAC-SHA512 of input data using the chain code as key.
    /// @param key   chain code
    /// @param data  compressed public key
    /// @return (L, R) a tuple of the left and right halves of the HMAC
    function HMAC_SHA512(uint256 key, bytes memory data)
        public
        pure
        returns (bytes32, bytes32)
    {
        // key is 256 bits, less than sha512's block size, which is 1024 bits. 
        // so we pad to the right with 0s up to the block size
        bytes memory K = abi.encodePacked(key, uint256(0), uint256(0), uint256(0));
        // HMAC = SHA512((K ^ o_pad) || SHA512((K ^ i_pad) || data));
        bytes memory o_key_pad = new bytes(128);
        bytes memory i_key_pad = new bytes(128);
        for (uint256 o = 0; o < SHA512_block_size; o++) {
            o_key_pad[o] = (K[o] ^ 0x5C);
            i_key_pad[o] = (K[o] ^ 0x36);
        }

        bytes memory midhash = SHA512(concat(i_key_pad, data));
        bytes memory L = SHA512(concat(o_key_pad, midhash));

        bytes32 left = bytesToBytes32(L, 0);
        bytes32 right = bytesToBytes32(L, 32);
        
        return (left, right);
    }

    /// @notice returns the coordinate pair resulting from EC point multiplication of the secp256k1 base point with the integer p.
    /// @param p times of repeated application of the EC group operation
    /// @return (x, y) the coordinate pair resulting from EC point multiplication
    function point(uint256 p) public pure returns (uint256, uint256) {
        return EllipticCurve.ecMul(p, GX, GY, AA, PP);
    }

    /// @notice serialize a 32-bit unsigned integer i as a 4-byte sequence, most significant byte first.
    /// @param i a 32-bit unsigned integer
    /// @return a 4-byte sequence, most significant byte first.
    function ser32(uint32 i) public pure returns (bytes memory) {
        return abi.encodePacked(i);
    }

    /// @notice serializes the 256-bit unsigned integer p as a 32-byte sequence, most significant byte first.
    /// @param p 256-bit unsigned integer
    /// @return a 32-byte sequence, most significant byte first.
    function ser256(uint256 p) public pure returns (bytes memory) {
        return abi.encodePacked(p);
    }

    /// @notice serializes the coordinate pair P = (x,y) as a byte sequence
    /// using SEC1's compressed form: (0x02 or 0x03) || ser256(x),
    /// where the header byte depends on the parity of the omitted y coordinate.
    /// @param x coordinate pair P = (x,y)
    /// @param y coordinate pair P = (x,y)
    /// @return (0x02 or 0x03) || ser256(x)
    function serp(uint256 x, uint256 y) public pure returns (bytes memory) {
        if (y & 1 > 0) {
            return abi.encodePacked(uint8(3), ser256(x));
        } else {
            return abi.encodePacked(uint8(2), ser256(x));
        }
    }

    /// @notice interprets a 32-byte sequence as a 256-bit number, most significant byte first.
    /// @param p a 32-byte sequence
    /// @return a 256-bit number, most significant byte first.
    function parse256(bytes32 p) public pure returns (uint256) {
        return uint256(p);
    }

    /// @notice The function CKDpub((Kpar, cpar), i) -> (Ki, ci)
    /// computes a child extended public key from the parent extended public key
    /// @param Kpar_x   public key coordinate pair (x, y)
    /// @param Kpar_y   public key coordinate pair (x, y)
    /// @param cpar     chain code
    /// @param i        index
    /// @return child public key Ki(x, y) , child chain code ci
    function driveChildPub(
        uint256 Kpar_x,
        uint256 Kpar_y,
        uint256 cpar,
        uint32 i
    )
        public
        pure
        returns (
            uint256 Ki_x, 
            uint256 Ki_y,
            uint256 ci
        )
    {
        // Check whether i >= 2^31 (whether the child is a hardened key).
        require((i & BIP32_HARDEN) == 0, "Cannot create a hardened child key using public child derivation");
        // let I = HMAC-SHA512(Key = cpar, Data = serp(Kpar) || ser32(i)).
        // Split I into two 32-byte sequences, IL and IR.
        (bytes32 IL, bytes32 IR) = HMAC_SHA512(cpar, concat(serp(Kpar_x, Kpar_y), ser32(i)));
        (uint256 p_x, uint256 p_y) = point(parse256(IL));
        // The returned child key Ki is: point(parse256(IL)) + Kpar.
        (Ki_x, Ki_y) = EllipticCurve.ecAdd(p_x, p_y, Kpar_x, Kpar_y, AA, PP);
        // The returned chain code ci is IR.
        ci = uint256(IR);
    }
}
