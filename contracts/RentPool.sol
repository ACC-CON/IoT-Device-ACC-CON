pragma solidity ^0.5.17;

contract RentPool {
    // deposit 用户地址 => 存款
    // 用户可以任意存款和提现，租赁收付款优先在deposit结算
    // 考虑gas开销，我们应该减少流水，尽可能在本合约内部划转
    mapping(address => uint256) private deposit;

    // rent 承租人地址 => (出租人地址 => 单笔租赁租金)
    // 出租人会在指定时间内从租金池提取这笔租金，否则对应数字资产将解冻和退还
    // 这样设计允许同一承租人或出租人同时关联多笔订单，同一组承租人和出租人之间仅允许一笔待处理订单
    mapping(address => mapping(address => uint256)) public rent;

    // ReceiveETH 本合约收以太币
    // 返回值：发送以太币的账户地址、发送的以太币金额
    function ReceiveETH() external payable returns (address, uint256) {
        deposit[msg.sender] += msg.value;
        return (msg.sender, msg.value);
    }

    // PayETH 本合约付以太币
    // 函数调用者要求退还deposit中对应部分或全部以太币
    // 参数表：接收的以太币金额（小于合约实际支付的以太币金额，存在gas开销）
    function PayETH(uint256 value) external {
        require(value <= deposit[msg.sender], "Insufficient deposit!");
        deposit[msg.sender] -= value;
        return msg.sender.transfer(value);
    }

    // BalanceOfRentPool 本合约实际余额
    // TODO 为了避免支付提现gas导致的亏损，我们应该设计盈利方案
    function BalanceOfRentPool() public view returns (uint256) {
        return address(this).balance;
    }

    // BalanceOfAddress 本函数调用者在deposit的余额
    // 这个余额是完全可取的，不包含被锁定在挂起的租赁合同中的金额
    function BalanceOfAddress() public view returns (uint256) {
        return deposit[msg.sender];
    }

    // Register 承租人注册租赁订单
    // 承租人调用这个函数，提供出租人地址和租金
    // 合约会优先尝试从deposit划转租金，划转成功的租金实际被锁定了，不可取
    function Register(address lessor, uint256 value)
        external
        returns (uint256)
    {
        return register(msg.sender, lessor, value);
    }

    // Confirm 出租人确认租赁订单，尝试收款
    // 如果出租人提交的订单金额超过受租人发送到资金池的金额，那么租赁失败，订单自动取消，租金将被退还
    // 如果租赁成功，那么受租人将被自动退还多余金额
    function Confirm(address lessee, uint256 value) external returns (bool) {
        return confirm(lessee, msg.sender, value);
    }

    // register 注册租赁订单
    // 参数表：承租人（付款人）地址、出租人（收款人）地址、租金
    // 返回值：注册成功返回0；否则返回承租人应该补交的最小金额，同时本租赁订单自动取消
    function register(
        address _lessee,
        address _lessor,
        uint256 _value
    ) private returns (uint256) {
        require(rent[_lessee][_lessor] == 0, "The last order is pending!");
        if (deposit[_lessee] >= _value) {
            deposit[_lessee] -= _value;
            rent[_lessee][_lessor] = _value;
            return 0;
        }
        return _value - deposit[_lessee];
    }

    // confirm 尝试确认租赁订单
    // 参数表：承租人（付款人）地址、出租人（收款人）地址、租金
    // 返回值：租赁是否成功完成
    function confirm(
        address _lessee,
        address _lessor,
        uint256 _value
    ) private returns (bool) {
        bool flag = true;
        if (rent[_lessee][_lessor] < _value) {
            flag = false;
        } else {
            rent[_lessee][_lessor] -= _value;
        }
        deposit[_lessee] += rent[_lessee][_lessor];
        rent[_lessee][_lessor] = 0;
        return flag;
    }
}
