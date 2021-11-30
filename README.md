# Hierarchically delegatable and revocable access control for large-scale IoT devices withtradability on Ethereum



## 0. Environment

### 0.1. requirements

`solidity`:`v0.5.17+commit.d19bba13`
`truffle`:`v5.3.4`
`Node`: `v14.16.1`

# 2. Gas consumption

 gas consumption of functionalitites in `Operations.sol`

### 2.1. how to run test
```bash
$ npm run test
```
or
```bash
$ truffle test
```
### 2.2. test single file

 `npm run test [path to test script]` 

```bash
$ npm run test test/Delegate.js
```
or
```bash
$ truffle test test/Delegate.js
```

### 2.3. results

Gas consumption of each funtionality

| method                     | gas      |
| -------------------------- | -------- |
| Register                   |  128551  |
| Deposit                    |  44016   |
| Withdraw                   |  21523   |
| Transfer                   |  67759   |
| Delegate (type is "owner") |  1581660 |
| Delegate (type is "user")  |  1608802 |
| GenerateSessionID          |  24884   |
| Revoke                     |  41054   |


Gas consumption when increasing the number of IoT devices (i.e., the length of accTab or IoTDevices)

**accTab is mapping**

| accTabLength        | GenerateSessionID | Delegate | Revoke |
| ------------------- | ----------------- | -------- | ------ |
|10                   |     30766         | 175004  | 32620  | 
|100                  |     30766         | 175004  | 32620  | 
|200                  |     30766         | 175004  | 32620  | 
|300                  |     30766         | 175004  | 32620  | 
|400                  |     30766         | 175004  | 32620  |
|500                  |     30766         | 175004  | 32620  |
|600                  |     30766         | 175004  | 32620  |
|700                  |     30766         | 175004  | 32620  |
|800                  |     30766         | 175004  | 32620  |
|900                  |     30766         | 175004  | 32620  |
|1000                 |      30766        | 175004  | 32620  |
|1200                 |      30766        | 175004  | 32620  |
|1400                 |      30766        | 175004  | 32620  |
|1600                 |      30766        | 175004  | 32620  |
|1800                 |      30766        | 175004  | 32620  |
|2000                 |      30766        | 175004  | 32620  |