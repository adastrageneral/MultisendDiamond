// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "../ADASTRAMultisend/interfaces/IERC20.sol";
import "../ADASTRAMultisend/libraries/SafeMath.sol"; 
import "hardhat/console.sol";
contract ADASTRAMultisend  {
    using SafeMath for uint;
    address admin;
    uint fixedFee;
    event LogTokenBulkSentNative(address from, uint256 total);
	event LogTokenBulkSent(address token, address from, uint256 total);

    constructor(address _admin, uint _fixedFee){
        admin=_admin;
        fixedFee=_fixedFee;
    }

    modifier onlyAdmin(){
        require(msg.sender==admin,"Only admin can use this function");
        _;   
    }

    function setAdmn(address _admin) public onlyAdmin{
        admin = _admin;
    }
    

    function getFixedFee() public view returns(uint){
        return fixedFee;
    }
    
    function setFixedFee(uint _fees) public onlyAdmin(){
        fixedFee = _fees;
    }

    function payToAdmin() internal  {
          require(payable(admin).send(fixedFee), 'failed to pay fees');
    }

 
function nativeSendSameValue(address[] memory _to, uint _value) external payable{  
        require(
            SafeMath.sub(msg.value , SafeMath.mul(_value, _to.length)) ==  fixedFee,
                "the fixed fee must be in the msg value"
            );
        uint sendAmount = _to.length.mul(_value);
        uint remainingValue = msg.value;
	    address from = msg.sender;

	    require(remainingValue >= sendAmount, 'insuf balance');
        require(_to.length <= 255, 'exceed max allowed');

        for (uint16 i = 0; i < _to.length; i++) {
            require(payable(_to[i]).send(_value), 'failed to send');
        }
        payToAdmin();
        emit LogTokenBulkSentNative(from, remainingValue);
    }

    function nativeSendDifferentValue(address[] memory _to, uint[] memory _value) external payable  {

        uint sendAmount = _value[0];
        uint remainingValue = msg.value;
	    address from = msg.sender;

	    require(remainingValue >= sendAmount, 'insuf balance');
        require(_to.length == _value.length, 'invalid input');
        require(_to.length <= 255, 'exceed max allowed');

        for (uint16 i = 0; i < _to.length; i++) {
            require(payable(_to[i]).send(_value[i]));
        }
        payToAdmin();
        emit LogTokenBulkSentNative(from, remainingValue);

    }

    function sendSameValue(address _tokenAddress, address[] memory _to, uint _value) external payable {
         require(
            msg.value==  fixedFee,
                "the fixed fee must be in the msg value"
            );
	    address from = msg.sender;
        require(_to.length <= 255, 'exceed max allowed');
        uint256 sendAmount = _to.length.mul(_value);
        IERC20 token = IERC20(_tokenAddress);
        for (uint16 i = 0; i < _to.length; i++) {
            token.transferFrom(from, _to[i], _value);
        }
        payToAdmin();
		emit LogTokenBulkSent(_tokenAddress, from, sendAmount);

    }

    function sendDifferentValue(address _tokenAddress, address[] memory _to, uint[] memory _value) external payable  {
         require(
             msg.value  ==  fixedFee,
                "the fixed fee must be in the msg value"
            );
	    address from = msg.sender;
        require(_to.length == _value.length, 'invalid input');
        require(_to.length <= 255, 'exceed max allowed');
        uint256 sendAmount;
        IERC20 token = IERC20(_tokenAddress);
        for (uint16 i = 0; i < _to.length; i++) {
            token.transferFrom(msg.sender, _to[i], _value[i]);
	        sendAmount.add(_value[i]);
        }
        payToAdmin();
        emit LogTokenBulkSent(_tokenAddress, from, sendAmount);

    }

}