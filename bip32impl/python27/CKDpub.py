"""
@Reference: https://github.com/lyndsysimon/bip32utils/blob/master/bip32utils/BIP32Key.py
"""

import hmac
import ecdsa
import struct
import hashlib

from six import int2byte, b
from ecdsa.curves import SECP256k1
from ecdsa.numbertheory import square_root_mod_prime as sqrt_mod

BIP32_HARDEN    = 0x80000000 # choose from hardened set of child keys
FIELD_ORDER = SECP256k1.curve.p()

def int_to_string(x):
    """Convert integer x into a string of bytes, as per X9.62."""
    assert x >= 0
    if x == 0:
        return b("\0")
    result = []
    while x:
        ordinal = x & 0xFF
        result.append(int2byte(ordinal))
        x >>= 8

    result.reverse()
    return b("").join(result)


def string_to_int(s):
    """Convert a string of bytes into an integer (Decimal), as per X9.62."""
    result = 0
    for c in s:
        if not isinstance(c, int):
            c = ord(c)
        result = 256 * result + c
    return result


def HMAC_SHA512(key, data):
    """
    - key   chain code
    - data  public key

    Calculate the HMAC-SHA512 of input data using the chain code as key.
    Returns a tuple of the left and right halves of the HMAC
    """
    # print ""
    # print "HMAC_SHA512:"
    # print "- input"
    # print "  - key: ", key.encode('hex')
    # print "  - data:", data.encode('hex')
    I = hmac.new(key, data, hashlib.sha512).digest()
    # print "- output"
    # print "  - I: ", I.encode('hex')
    # print "  - IL:", I[:32].encode('hex')
    # print "  - IR:", I[32:].encode('hex')
    # print ""
    return (I[:32], I[32:])


def point(p):
    """
    returns the coordinate pair resulting from EC point multiplication 
    (repeated application of the EC group operation) 
    of the secp256k1 base point with the integer p.
    """
    # generator_secp256k1: secp256k1 base point
    return p*ecdsa.ecdsa.generator_secp256k1


def ser32(i):
    """
    serialize a 32-bit unsigned integer i as a 4-byte sequence, most significant byte first.
    """
    # '\x00\x00\x00\x01'
    # > big:endness; L:Long, 32-bit unsigned integer
    return struct.pack(">L", i)


def ser256(p):
    """
    serializes the integer p as a 32-byte sequence, most significant byte first.
    """
    return int_to_string(p)


def serp(point):
    """
    serializes the coordinate pair P = (x,y) as a byte sequence 
    using SEC1's compressed form: (0x02 or 0x03) || ser256(x), 
    where the header byte depends on the parity of the omitted y coordinate.
    """
    # the parity of the omitted y
    if point.y() & 1:
        # add prefix "03"
        ck = b'\3' + ser256(point.x())
    else:
        ck = b'\2' + ser256(point.x())
    return ck


def parse256(p):
    """
    interprets a 32-byte sequence as a 256-bit number, most significant byte first.
    """
    return string_to_int(p)


def CKDpub(Kpar, cpar, i):
    """
    - Kpar   public key coordinate pair
    - cpar   chain code
    - i      index
    
    The function CKDpub((Kpar, cpar), i) -> (Ki, ci) 
    computes a child extended public key from the parent extended public key. 
    (parent extended public key is pub_key + chain_code
    It is only defined for non-hardened child keys.

    @reference: https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki#Public_parent_key_rarr_public_child_key

    - Check whether i >= 231 (whether the child is a hardened key).
        - If so (hardened child): return failure
        - If not (normal child): let I = HMAC-SHA512(Key = cpar, Data = serp(Kpar) || ser32(i)).
    
    - Split I into two 32-byte sequences, IL and IR.
    - The returned child key Ki is point(parse256(IL)) + Kpar.
    - The returned chain code ci is IR.
    - In case parse256(IL) >= n or Ki is the point at infinity, the resulting key is invalid, and one should proceed with the next value for i.
    """
    # Check whether i >= 231 (whether the child is a hardened key).
    if i & BIP32_HARDEN:
        raise Exception("Cannot create a hardened child key using public child derivation")

    # print "key:", cpar.encode('hex'), ", data:", serp(Kpar).encode('hex')

    # let I = HMAC-SHA512(Key = cpar, Data = serp(Kpar) || ser32(i)).
    I = HMAC_SHA512(key = cpar, data = serp(Kpar) + ser32(i))

    # Split I into two 32-byte sequences, IL and IR.
    (IL, IR) = I
    # print len(IL), IL.encode('hex'), len(IR), IR.encode('hex')

    # The returned child key Ki is: point(parse256(IL)) + Kpar.
    Ki = point(parse256(IL)) + Kpar

    # The returned chain code ci is IR.
    ci = IR

    return (Ki, ci)


def pointFromCompressedPub(secret):
    # Recover public curve point from compressed key
    lsb = ord(secret[0]) & 1
    x = string_to_int(secret[1:])
    ys = (x**3+7) % FIELD_ORDER # y^2 = x^3 + 7 mod p
    y = sqrt_mod(ys, FIELD_ORDER)
    if y & 1 != lsb:
        y = FIELD_ORDER-y

    point = ecdsa.ellipticcurve.Point(SECP256k1.curve, x, y)
    return point


def PublicKey(point):
    "Return compressed public key encoding"
    if point.y() & 1:
        ck = b'\3'+int_to_string(point.x())   # add prefix "03"
    else:
        ck = b'\2'+int_to_string(point.x())
    return ck


if __name__ == "__main__":
    
    parent_pubkey_str = int_to_string(0X03b6155fc9bcfe6df3af81aec97b12e1de938a842898e9eecec00c573a9c3c5399)
    parent_public_key_point = pointFromCompressedPub(parent_pubkey_str)
    # print int_to_string(parent_public_key_point.x()).encode('hex'), int_to_string(parent_public_key_point.y()).encode('hex')
    
    parent_public_key = ecdsa.VerifyingKey.from_public_point(parent_public_key_point, curve=SECP256k1).pubkey.point
    parent_chain_code = int_to_string(0Xe6352421628682b1d4dcab3d37b93a6c5edb530451b3c94e3ec1adac1f1d6a7a)

    print "- Parent"
    print "  - Public key"
    print "    - (hex)   ", PublicKey(parent_public_key).encode('hex')
    print "  - Chain code"
    print "    - (hex)   ", parent_chain_code.encode('hex')

    child_pubkey, chil_chain_code = CKDpub(parent_public_key, parent_chain_code, 0)
    print "- Child"
    print "  - Public key"
    print "    - (hex)   ", PublicKey(child_pubkey).encode('hex')
    print "  - Chain code"
    print "    - (hex)   ", chil_chain_code.encode('hex')
    
    # print int_to_string(child_pubkey.x()).encode('hex'), int_to_string(child_pubkey.y()).encode('hex')
    
    """
    - Parent
        - Public key
            - (hex)    03b6155fc9bcfe6df3af81aec97b12e1de938a842898e9eecec00c573a9c3c5399
        - Chain code
            - (hex)    e6352421628682b1d4dcab3d37b93a6c5edb530451b3c94e3ec1adac1f1d6a7a
    - Child
        - Public key
            - (hex)    0328b5222c6f87e07afaf9ab8d8b9edd64652289f7f71716adcf093f66fbfbe4f9
        - Chain code
            - (hex)    787a3c08aa6fa9606bf642b1c46f1770430541f6a77679750c7bb040cb99e2c2
    """