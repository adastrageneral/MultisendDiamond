import { assert } from "chai";
import { ethers } from "hardhat"
import { deploy, deployTestTokenERC20 } from "../scripts/deploy";
const {
    BN,           // Big Number support
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');


describe('Test multisend functionality', async function () {
    let multisendDiamond
    let multisend
    let manager

    let accounts: string[]
    let sender
    let erc20
    let fixedFees 

    const fromWei = ethers.utils.formatEther
    const getBalances = async (accounts: string[], fromContract: boolean = false) => {
        let balances: any[] = []
        for (let acc of accounts) {
            let bal: any
            if (!fromContract) {
                bal = await ethers.provider.getBalance(acc);
            } else {
                bal = await erc20.balanceOf(acc);
            }

            balances.push(bal)
        }
        return balances
    }

    beforeEach(async function () {
        multisendDiamond = await deploy()
        multisend = await ethers.getContractAt("MultisendFacet", multisendDiamond)
        manager = await ethers.getContractAt("ManagementFacet", multisendDiamond)

        erc20 = await deployTestTokenERC20("Test erc20", "TERC")

        accounts = await ethers.provider.listAccounts()
        let signers = await ethers.getSigners()
        sender = signers[10]


    })
    it('should set fixed fees only with owner or admin account', async () => {
        let tx = await manager.setFixedFee(ethers.utils.parseEther(process.env.FIXEDFEES))
        await tx.wait()
        let signers = await ethers.getSigners()
        await expectRevert.unspecified(manager.connect(signers[2]).setFixedFee(ethers.utils.parseEther(process.env.FIXEDFEES)))
    })
    it('should get fixed fees with all accounts', async () => {
        fixedFees = await manager.getFixedFee()
        assert.equal(fromWei(fixedFees), process.env.FIXEDFEES)

    })
    it('should send native token to multiple address with same amount', async () => {

        const balances = await getBalances(accounts.slice(0, 11))

        //send 1 eth to all
        let tx = await multisend.connect(sender).nativeSendSameValue(accounts.slice(1, 10), ethers.utils.parseEther("1"), { value: ethers.utils.parseEther("9").add(fixedFees) })
        tx = await tx.wait()

        let gascost = tx.cumulativeGasUsed.mul(tx.effectiveGasPrice)

        const balancesAfter: any = await getBalances(accounts.slice(0, 11))

        //check fee for admin
        assert.equal(fromWei(balancesAfter[0].sub(balances[0])), fromWei(fixedFees))
        //check sendeer balance
        assert.equal(fromWei(balances[10].sub(fixedFees).sub(gascost).sub(balancesAfter[10])), "9.0")
        for (let i = 1; i < 10; i++) {
            assert.equal(fromWei(balancesAfter[i].sub(balances[i])), "1.0")
        }


    })
    it('should send native token to multiple address with different amount', async () => {
        const balances = await getBalances(accounts.slice(0, 11))
        const values = [
            ethers.utils.parseEther("1"),
            ethers.utils.parseEther("2"),
            ethers.utils.parseEther("3"),
            ethers.utils.parseEther("4"),
            ethers.utils.parseEther("5"),
            ethers.utils.parseEther("6"),
            ethers.utils.parseEther("7"),
            ethers.utils.parseEther("8"),
            ethers.utils.parseEther("9"),

        ]
        const totalToSend = ethers.utils.parseEther("45")
        //send 1 eth to all
        let tx = await multisend.connect(sender).nativeSendDifferentValue(accounts.slice(1, 10), values, { value: totalToSend.add(fixedFees) })
        tx = await tx.wait()

        let gascost = tx.cumulativeGasUsed.mul(tx.effectiveGasPrice)

        const balancesAfter: any = await getBalances(accounts.slice(0, 11))



        //check fee for admin
        assert.equal(fromWei(balancesAfter[0].sub(balances[0])), fromWei(fixedFees))
        //check sendeer balance
        assert.equal(fromWei(balances[10].sub(fixedFees).sub(gascost).sub(balancesAfter[10])), fromWei(totalToSend))
        for (let i = 1; i < 10; i++) {
            assert.equal(ethers.utils.formatEther(balancesAfter[i].sub(balances[i])), i + ".0")
        }

    })
    it('should send native token to multiple address with same amount', async () => {

        let tx = await erc20.transfer(sender.address, ethers.utils.parseEther("100"))

        await tx.wait()
        const balances = await getBalances(accounts.slice(0, 11), true)

        const adminBalance = await getBalances([accounts[0]])

        const totalToSend = ethers.utils.parseEther("9")


        tx = await erc20.connect(sender).increaseAllowance(multisendDiamond, totalToSend);
        await tx.wait()

        //send 1 eth to all
        tx = await multisend.connect(sender).sendSameValue(erc20.address, accounts.slice(1, 10), ethers.utils.parseEther("1"), { value: fixedFees })
        tx = await tx.wait()


        const balancesAfter: any = await getBalances(accounts.slice(0, 11), true)
        const adminBalanceAfter = await getBalances([accounts[0]])



        //check fee for admin
        assert.equal(fromWei(adminBalanceAfter[0].sub(adminBalance[0])), fromWei(fixedFees))

        assert.equal(fromWei(balances[10].sub(balancesAfter[10])), fromWei(totalToSend))
        for (let i = 1; i < 10; i++) {
            assert.equal(fromWei(balancesAfter[i]), "1.0")
        }
        multisend.sendSameValue()

    })
    it('should send native token to multiple address with different amount', async () => {


        let tx = await erc20.transfer(sender.address, ethers.utils.parseEther("100"))
        await tx.wait()
        const balances = await getBalances(accounts.slice(0, 11), true)
        const adminBalance = await getBalances([accounts[0]])

        const values = [
            ethers.utils.parseEther("1"),
            ethers.utils.parseEther("2"),
            ethers.utils.parseEther("3"),
            ethers.utils.parseEther("4"),
            ethers.utils.parseEther("5"),
            ethers.utils.parseEther("6"),
            ethers.utils.parseEther("7"),
            ethers.utils.parseEther("8"),
            ethers.utils.parseEther("9"),

        ]
        const totalToSend = ethers.utils.parseEther("45")
        //send 1 eth to all
        tx = await erc20.connect(sender).increaseAllowance(multisendDiamond, totalToSend);
        tx = await tx.wait()
        tx = await multisend.connect(sender).sendDifferentValue(erc20.address, accounts.slice(1, 10), values, { value: fixedFees })
        tx = await tx.wait()



        const balancesAfter: any = await getBalances(accounts.slice(0, 11), true)
        const adminBalanceAfter = await getBalances([accounts[0]])


        //check fee for admin
        assert.equal(fromWei(adminBalanceAfter[0].sub(adminBalance[0])), fromWei(fixedFees))

        assert.equal(fromWei(balances[10].sub(balancesAfter[10])), fromWei(totalToSend))
        for (let i = 1; i < 10; i++) {
            assert.equal(fromWei(balancesAfter[i]), i + ".0")
        }
    })
});