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

export async function deployTestTokenERC20(name, symbol, logEnabled = false) {

  const Erc20 = await hre.ethers.getContractFactory("XXXXXXX");
  const erc20 = await Erc20.deploy(name, symbol, 18, hre.ethers.utils.parseEther("100000000"), hre.ethers.utils.parseEther("100000000"));

  await erc20.deployed();
  log(logEnabled, "erc20 deployed to: " + erc20.address);

  return erc20

}





deployTestTokenERC20("ADASTRALABToken", "AAL", true).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

