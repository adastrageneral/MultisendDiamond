// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import {LibDiamond} from "./LibDiamond.sol";
import {LibMeta} from "./LibMeta.sol";
import {SafeMath} from "./SafeMath.sol";
import "hardhat/console.sol";
 
struct AppStorage {
    uint fixedFee;
    address admin;
}

library LibAppStorage {
    function diamondStorage() internal pure returns (AppStorage storage ds) {
        assembly {
            ds.slot := 0
        }
    }

    
}

contract Modifiers {
    AppStorage internal s;
    
        
    modifier onlyOwnerOrAdmin() {
        address sender = LibMeta.msgSender();
        require(
            s.admin == sender ||
                sender == LibDiamond.contractOwner(),
            "LibAppStorage: only an admin or owner can call this function"
        );
        _;
    }
    
}
