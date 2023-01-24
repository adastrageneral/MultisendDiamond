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
            LibMeta.msgValue() == s.cryptopoopz[_tokenId].owner,
            "LibAppStorage: Only cryptopoop owner can call this function"
        );
        _;
    }
    
}
