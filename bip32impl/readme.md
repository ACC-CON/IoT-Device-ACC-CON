# Implementation of BIP32 CKDPub

The function <img src="https://render.githubusercontent.com/render/math?math=CKDpub((Kpar,cpar),+i){\rightarrow}(K_{i}, c_{i}))">computes a child extended public key from the parent extended public key. It is only defined for non-hardened child keys.

- Check whether <img src="https://render.githubusercontent.com/render/math?math=i{\geqslant}2^{31}">(whether the child is a hardened key).
    - If so (hardened child): return failure
    - If not (normal child): let <img src="https://render.githubusercontent.com/render/math?math=I+=+HMAC-SHA512(Key+=+c_{par},+Data+=+ser_{p}(Kpar)+||+ser_{32}(i))">
- Split <img src="https://render.githubusercontent.com/render/math?math=I"> into two 32-byte sequences, <img src="https://render.githubusercontent.com/render/math?math=I_{L}"> and  <img src="https://render.githubusercontent.com/render/math?math=I_{R}">.
- The returned child key  <img src="https://render.githubusercontent.com/render/math?math=K_{i}"> is <img src="https://render.githubusercontent.com/render/math?math=point(parse_{256}(I_{L}))%2BK_{par}">.
- The returned chain code <img src="https://render.githubusercontent.com/render/math?math=c_{i}">  is <img src="https://render.githubusercontent.com/render/math?math=I_{R}"> .
- In case  <img src="https://render.githubusercontent.com/render/math?math=parse_{256}(I_{L})+{\geqslant}+n ">or <img src="https://render.githubusercontent.com/render/math?math=K_{i}"> is the point at infinity, the resulting key is invalid, and one should proceed with the next value for <img src="https://render.githubusercontent.com/render/math?math=i">.



## Methods

### ser256

serializes the integer p as a 32-byte sequence, most significant byte first.

`input`

> 82358703335270431014669253699111608378020585721534450150290191601091026375577

`output`

> b6155fc9bcfe6df3af81aec97b12e1de938a842898e9eecec00c573a9c3c5399

### serp

serializes the coordinate pair P = (x,y) as a byte sequence using SEC1's compressed form: (0x02 or 0x03) || ser256(x), where the header byte depends on the parity of the omitted y coordinate.

`input`

> x = 82358703335270431014669253699111608378020585721534450150290191601091026375577
>
> y = 11859627817656909157111608906621721568122988392175529961634750220809629926685

`output`

> 03b6155fc9bcfe6df3af81aec97b12e1de938a842898e9eecec00c573a9c3c5399

### ser32

serialize a 32-bit unsigned integer i as a 4-byte sequence, most significant byte first.

`input`

>  0

`output`

> 00000000

### parse256

serializes the integer p as a 32-byte sequence, most significant byte first.

`input`

> 5af087b978d59330e6012c1f97c409c3b884abe087fef0b24fe476ca366a622c

`output`

> 41133136404113071986416133398245636481513716992809347954319015993198133273132

### point

returns the coordinate pair resulting from EC point multiplication (repeated application of the EC group operation) of the secp256k1 base point with the integer p.

`input`

> 41133136404113071986416133398245636481513716992809347954319015993198133273132

`output`

> x = 79079258613480226719950281502965970294699791768752535487992993928312438953687
>
> y = 78877256480904389440918418804652926758581050855847797356415334476209393784560

### SHA512

[demo](https://emn178.github.io/online-tools/sha512.html)

`input`

> 0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798

`output`

> b69044b0e9bd4a9c37b9d3e25ac3edaa2b535f93894c2ea5a4ccfc3c4746d7eab3bd3169c6faa568f798bfab82198bc55f83a6c3534c5a24c5b839175c13c3f5

### HMAC_SHA512

Calculate the HMAC-SHA512 of input data using the chain code as key.  Returns a tuple of the left and right halves of the HMAC

`input`

> key = e6352421628682b1d4dcab3d37b93a6c5edb530451b3c94e3ec1adac1f1d6a7a 
>
> data = 03b6155fc9bcfe6df3af81aec97b12e1de938a842898e9eecec00c573a9c3c539900000000

`output`

> left = 5af087b978d59330e6012c1f97c409c3b884abe087fef0b24fe476ca366a622c
>
> right = 787a3c08aa6fa9606bf642b1c46f1770430541f6a77679750c7bb040cb99e2c2

### driveChildPub

Computes a child extended public key from the parent extended public key

`input`

> Kpar_x = 0xb6155fc9bcfe6df3af81aec97b12e1de938a842898e9eecec00c573a9c3c5399 
>
> Kpar_y = 0x1a384fbc760f019e0fdf80f55113a9cef5039077a8dd31968b7ce6258a61051d
>
> cpar = 0xe6352421628682b1d4dcab3d37b93a6c5edb530451b3c94e3ec1adac1f1d6a7a
>
> i = 0

`output`

> Ki_x = 28b5222c6f87e07afaf9ab8d8b9edd64652289f7f71716adcf093f66fbfbe4f9
>
> Ki_y = fedd2a2cb7454870b1df21c047d5df61f1afb5313e7f0b277a820b9e5557d481
>
> ci = 787a3c08aa6fa9606bf642b1c46f1770430541f6a77679750c7bb040cb99e2c2

## Test

`python27> python .\CKDpub.py`

```
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
```



## References

+ [doc](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki#Public_parent_key_rarr_public_child_key)
+ [code](https://github.com/lyndsysimon/bip32utils/blob/master/bip32utils/BIP32Key.py)

