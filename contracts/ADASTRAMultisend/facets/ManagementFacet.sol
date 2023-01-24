// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "../interfaces/IERC20.sol";
import "../libraries/SafeMath.sol";
import {Modifiers, AppStorage} from "../libraries/LibAppStorage.sol";

contract ManagementFacet is Modifiers {
  

    function getFixedFee() public view returns(uint256){
        return s.fixedFee;
    }
    
    function setFixedFee(uint _fees) public onlyOwnerOrAdmin(){
        s.fixedFee = _fees;
    }
}