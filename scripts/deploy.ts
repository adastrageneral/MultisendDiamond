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

  ];


  //deploy poo token
  let MultisendDiamond = await diamond.deploy({
    diamondName: "MultisendDiamond",
    initDiamond: "InitDiamond",
    facets: FacetNames,
    contractOwner: contractOwner,
    // args: [
    //   [

    //     enviroments.deployArgs.name,
    //     enviroments.deployArgs.symbol
    //   ]

    // ],

    logEnabled: logEnabled,
  });



  return MultisendDiamond;
}

export async function deployTestTokenERC20(name, symbol) {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const Erc20 = await hre.ethers.getContractFactory("XXXXXXX");
  const erc20 = await Erc20.deploy(name, symbol, 18, hre.ethers.utils.parseEther("100000"), hre.ethers.utils.parseEther("10000"));

  await erc20.deployed();
  console.log("erc20 deployed to:", erc20.address);
  // let tx = await erc20.mint((hre.ethers.getSigners())[0].address, hre.ethers.utils.parseEther("10000"))
  // await tx.wait()
  // console.log("minted 10000 token")
  return erc20
  // await hre.run("verify:verify", {
  //   address: multisend.address,
  //   constructorArguments: [],
  // });
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
