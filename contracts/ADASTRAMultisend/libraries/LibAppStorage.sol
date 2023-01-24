pragma solidity ^0.8.0;
import {LibDiamond} from "../../shared/libraries/LibDiamond.sol";
 
 
struct AppStorage {
    uint fixedFee
    address admin
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
    modifier checkValidityFee(uint value) {
        require(
           msg.value - value ==  s.fixedFee,
            "LibAppStorage: the fixed fee must be in the msg value"
        );
        _;
    }
    
}
