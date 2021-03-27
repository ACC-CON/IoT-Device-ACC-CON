pragma solidity ^0.5.17;

contract RentPool {
    // deposit 用户存款
    // 用户可以任意存款和提现，租赁收付款优先在deposit结算
    // 考虑gas开销，我们应该减少流水，尽可能在本合约内部划转
    mapping(address => uint256) public deposit;

    // rent 设备承租人地址 => (设备出租人地址 => 单笔租赁租金)
    // 设备出租人会在指定时间内从租金池提取这笔租金，否则对应数字资产将解冻和退还
    // 这样设计允许同一承租人或出租人同时关联多笔订单，同一组承租人和出租人之间仅允许一笔待处理订单
    mapping(address => mapping(address => uint256)) public rent;

    // ReceiveETH 本合约收以太币
    // 返回值：发送以太币的账户地址、发送的以太币金额
    function ReceiveETH() external payable returns (address, uint256) {
        deposit[msg.sender] += msg.value;
        return (msg.sender, msg.value);
    }

    // PayETH 本合约付以太币
    // 参数表：接收以太币的账户地址、接收的以太币金额（小于实际发送的以太币金额，存在gas开销）
    function PayETH(address payable to, uint256 value) external {
        require(value <= deposit[to], "Insufficient deposit!");
        deposit[to] -= value;
        return to.transfer(value);
    }

    // Balance 本合约实际余额
    // TODO 为了避免支付提现gas导致的亏损，我们应该设计盈利方案
    function Balance() external view returns (uint256) {
        return address(this).balance;
    }

    // Register 承租人注册租赁订单，加入租金池
    // 承租人调用这个函数，提供出租人地址和租金
    function Register(address lessor, uint256 value) public returns (bool) {
        return register(msg.sender, lessor, value);
    }

    // Confirm 出租人确认租赁订单，尝试收取租金
    // 如果出租人提交的订单金额超过受租人发送到资金池的金额，那么租赁失败，受租人可以补充金额，也可以发起全额退款
    // 如果租赁成功，那么受租人将被自动退还多余金额
    function Confirm(address lessee, uint256 value) public returns (bool) {
        return confirm(lessee, msg.sender, value);
    }

    // register 注册租赁订单
    function register(
        address _lessee,
        address _lessor,
        uint256 _value
    ) private returns (bool) {
        // 合约查询和确认租金池收到了转账
        rent[_lessee][_lessor] = _value;
        return true;
    }

    // confirm 尝试确认租赁订单
    function confirm(
        address _lessee,
        address _lessor,
        uint256 _value
    ) private returns (bool) {
        if (rent[_lessee][_lessor] < _value) {
            return false;
        }
        rent[_lessee][_lessor] -= _value;
        // refund(_lessee,rent[_lessee][_lessor]);
        return true;
    }
}
