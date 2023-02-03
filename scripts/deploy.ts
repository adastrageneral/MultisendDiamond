// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import hre from "hardhat"
const diamond = require("./diamond-util/src/index.js");



function log(logEnabled: boolean, message: string) {
  if (logEnabled) console.log(message);
}
export async function deploy(
  isDiamondTest = false,
  logEnabled = false,
) {
  const accounts = await hre.ethers.getSigners();
  const contractOwner = accounts[0];



  var FacetNames: string[] = [];

  //deploy all the facets
  FacetNames = [
    "DiamondLoupeFacet",
    "OwnershipFacet",
    "MultisendFacet",
    "ManagementFacet"

  ];


  //deploy poo token
  let MultisendDiamond = await diamond.deploy({
    diamondName: "MultisendDiamond",
    initDiamond: "InitDiamond",
    facets: FacetNames,
    contractOwner: contractOwner,
    args: [
      [

        hre.ethers.utils.parseEther(process.env.FIXEDFEES),
        accounts[0].address
      ]
    ],


    logEnabled: logEnabled,
  });



  return MultisendDiamond;
}

export async function deployTestTokenERC20(name, symbol) {

  const Erc20 = await hre.ethers.getContractFactory("XXXXXXX");
  const erc20 = await Erc20.deploy(name, symbol, 18, hre.ethers.utils.parseEther("100000000"), hre.ethers.utils.parseEther("100000000"));

  await erc20.deployed();
  //console.log("erc20 deployed to:", erc20.address);

  return erc20

}

export async function deploySingleContract(fees = "0.07") {
  const accounts = await hre.ethers.getSigners();

  const multisend = await hre.ethers.getContractFactory("ADASTRAMultisend");
  const multisendContract = await multisend.deploy(accounts[0].address, hre.ethers.utils.parseEther(fees));

  await multisendContract.deployed();
  //console.log("erc20 deployed to:", multisendContract.address);

  return multisendContract

}

// async function verify() {
//   const addr = "0x83cC30e1E5f814883B260CE32A2a13D3493E5439";
//   const multisend = await hre.ethers.getContractAt("Multisend", addr);
//   await hre.run("verify:verify", {
//     address: multisend.address,
//     constructorArguments: [],
//   });
// }

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
// main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });

// verify().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });
