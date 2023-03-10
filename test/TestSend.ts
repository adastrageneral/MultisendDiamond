import { assert } from "chai";
import { ethers } from "hardhat"
import { deploy, deployTestTokenERC20 } from "../scripts/deploy";
import fs from "fs"

const {
    BN,           // Big Number support
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');


describe('Test multisend diamond contract functionality', async function () {
    let multisendDiamond
    let multisend
    let manager
    let testData;
    let accounts: string[]
    let sender
    let admin

    let erc20
    let fixedFees 

    const fromWei = ethers.utils.formatEther
    const toWei = ethers.utils.parseEther

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

    before(async function () {
        multisendDiamond = await deploy()
        multisend = await ethers.getContractAt("MultisendFacet", multisendDiamond)
        manager = await ethers.getContractAt("ManagementFacet", multisendDiamond)

        erc20 = await deployTestTokenERC20("Test erc20", "TERC")

        accounts = await ethers.provider.listAccounts()
        let signers = await ethers.getSigners()
        sender = signers[10]
        admin = signers[0]

        let data = fs.readFileSync('./test/testData.json', 'utf8')
        testData = JSON.parse(data)
        testData = testData.slice(0, 254)

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


        const senderBalance = (await getBalances([sender.address]))[0]
        const adminBalance = (await getBalances([admin.address]))[0]

        const receivers = testData.map((el => { return el.address }))
        const balances = await getBalances(receivers)

        //send 1 eth to all
        let tx = await multisend.connect(sender).nativeSendSameValue(receivers, ethers.utils.parseEther("1"), { value: ethers.utils.parseEther(receivers.length.toString()).add(fixedFees) })
        tx = await tx.wait()

        let gascost = tx.cumulativeGasUsed.mul(tx.effectiveGasPrice)

        const balancesAfter: any = await getBalances(receivers)
        const senderBalanceAfter = (await getBalances([sender.address]))[0]
        const adminBalanceAfter = (await getBalances([admin.address]))[0]

        //check fee for admin
        assert.equal(fromWei(adminBalanceAfter.sub(adminBalance)), fromWei(fixedFees))
        //check sendeer balance
        assert.equal(fromWei(senderBalance.sub(fixedFees).sub(gascost).sub(senderBalanceAfter)), receivers.length.toFixed(1))
        for (let i = 1; i < testData.length; i++) {
            assert.equal(fromWei(balancesAfter[i].sub(balances[i])), "1.0")
        }


    })
    it('should send native token to multiple address with different amount', async () => {
        const senderBalance = (await getBalances([sender.address]))[0]
        const adminBalance = (await getBalances([admin.address]))[0]
        const receivers = testData.map((el => { return el.address }))
        const balances = await getBalances(receivers)
        let total = 0;
        const values = testData.map((el => { return ethers.utils.parseEther(el.value.toString()); }))
        let totalToSend = toWei("0")
        values.forEach(el => {
            totalToSend = totalToSend.add(el)
        })

        //send 1 eth to all
        let tx = await multisend.connect(sender).nativeSendDifferentValue(receivers, values, { value: totalToSend.add(fixedFees) })
        tx = await tx.wait()

        let gascost = tx.cumulativeGasUsed.mul(tx.effectiveGasPrice)

        const balancesAfter: any = await getBalances(receivers)
        const senderBalanceAfter = (await getBalances([sender.address]))[0]
        const adminBalanceAfter = (await getBalances([admin.address]))[0]

        //check fee for admin
        assert.equal(fromWei(adminBalanceAfter.sub(adminBalance)), fromWei(fixedFees))
        //check sendeer balance
        assert.equal(+fromWei(senderBalance.sub(fixedFees).sub(gascost).sub(senderBalanceAfter)), +fromWei(totalToSend))
        for (let i = 1; i < testData.length; i++) {
            assert.equal(+fromWei(balancesAfter[i].sub(balances[i])), testData[i].value)
        }

    })
    it('should send erc20 token to multiple address with same amount', async () => {
        let tx = await erc20.transfer(sender.address, ethers.utils.parseEther("100000"))

        await tx.wait()
        const senderBalance = (await getBalances([sender.address], true))[0]
        const adminBalance = (await getBalances([admin.address]))[0]
        const receivers = testData.map((el => { return el.address }))
        const balances = await getBalances(receivers, true)

        const totalToSend = ethers.utils.parseEther(receivers.length.toString())
        //send 1 eth to all

        tx = await erc20.connect(sender).increaseAllowance(multisend.address, totalToSend);
        await tx.wait()
        tx = await multisend.connect(sender).sendSameValue(erc20.address, receivers, ethers.utils.parseEther("1"), { value: fixedFees })
        tx = await tx.wait()

        let gascost = tx.cumulativeGasUsed.mul(tx.effectiveGasPrice)

        const balancesAfter: any = await getBalances(receivers, true)
        const senderBalanceAfter = (await getBalances([sender.address], true))[0]
        const adminBalanceAfter = (await getBalances([admin.address]))[0]

        //check fee for admin
        assert.equal(fromWei(adminBalanceAfter.sub(adminBalance)), fromWei(fixedFees))
        //check sendeer balance
        assert.equal(+fromWei(senderBalance.sub(senderBalanceAfter)), receivers.length)
        for (let i = 1; i < testData.length; i++) {
            assert.equal(+fromWei(balancesAfter[i].sub(balances[i])), 1)
        }

    })
    it('should send erc20 token to multiple address with different amount', async () => {
        let tx = await erc20.transfer(sender.address, ethers.utils.parseEther("100000"))

        await tx.wait()
        const senderBalance = (await getBalances([sender.address], true))[0]
        const adminBalance = (await getBalances([admin.address]))[0]
        const receivers = testData.map((el => { return el.address }))
        const balances = await getBalances(receivers, true)
        let total = 0;
        const values = testData.map((el => { total += +el.value; return ethers.utils.parseEther(el.value.toString()); }))

        let totalToSend = toWei("0")
        values.forEach(el => {
            totalToSend = totalToSend.add(el)
        })   //send 1 eth to all

        tx = await erc20.connect(sender).increaseAllowance(multisendDiamond, totalToSend);
        await tx.wait()
        tx = await multisend.connect(sender).sendDifferentValue(erc20.address, receivers, values, { value: fixedFees })
        tx = await tx.wait()

        let gascost = tx.cumulativeGasUsed.mul(tx.effectiveGasPrice)

        const balancesAfter: any = await getBalances(receivers, true)
        const senderBalanceAfter = (await getBalances([sender.address], true))[0]
        const adminBalanceAfter = (await getBalances([admin.address]))[0]

        //check fee for admin
        assert.equal(fromWei(adminBalanceAfter.sub(adminBalance)), fromWei(fixedFees))
        //check sendeer balance
        assert.equal(+fromWei(senderBalance.sub(senderBalanceAfter)), +fromWei(totalToSend))
        for (let i = 1; i < testData.length; i++) {
            assert.equal(+fromWei(balancesAfter[i].sub(balances[i])), testData[i].value)
        }

    })
});