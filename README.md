# IoT-Device-Rental-Platform (IDRP)

A DeFi-based IoT device rental platform, with hierarchical authentication and access control features

`IDRP`是一个基于去中心化金融（DeFi）的物联网租赁平台，计划实现分级身份认证和访问控制。

## 0. 实验环境、编译和部署

`IDRP`使用的`solidity`的版本是`v0.5.17+commit.d19bba13`；使用`truffle`变异和部署；使用`Ganache`提供以太坊测试网。

在本仓库目录下执行下列命令变异和部署：

```bash
$ truffle compile # 编译合约
$ truffle migrate # 把合约部署到以太坊测试网
$ truffle console # 通过控制台实现交互
```

## 1. 租金池

### 1.1. 租金池合约的目标

`IDRP`仅支持存取以太币（ETH）。租金池合约的目标如下：

1. 用户操作简单，按需存款，活期取款；
2. 减少非必要开销，压缩合约对外流水，节省gas开销；
3. **TODO** 用户有利可图，合约通过提供基础金融服务盈利。

### 1.2. 租金池数据结构

`IDRP`租金池线性地记录用户的可取存款，即未被租赁合同锁定的存款，这些存款可以活期取出；同一 (承租人, 出租人) 仅允许一笔待处理租赁订单，后续订单会被自动取消。

`deposit`记录了全体用户的可取存款，数据类型`mapping(address => uint256)`；`rent`记录了任意 (承租人, 出租人) 的订单情况，数据类型`mapping(address => mapping(address => uint256))`，`0`代表无待处理订单，否则代表承租人预支付的租金（可能不满足出租人的要求导致租赁失败，订单取消）。