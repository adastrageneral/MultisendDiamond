import { assert } from "chai";
import { ethers } from "hardhat"
import { deploy, deployTestTokenERC20 } from "../scripts/deploy";



describe('Test multisend functionality', async function () {
    let multisendDiamond
    let multisend
    let accounts: string[]
    let erc20



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

    before(async function () {
        multisendDiamond = await deploy()
        multisend = await ethers.getContractAt("MultisendFacet", multisendDiamond)
        erc20 = await deployTestTokenERC20("Test erc20", "TERC")

        accounts = await ethers.provider.listAccounts()


    })

    it('should send native token to multiple address with same amount', async () => {

        const balances = await getBalances(accounts.slice(0, 10))

        //send 1 eth to all
        let tx = await multisend.nativeSendSameValue(accounts.slice(1, 10), ethers.utils.parseEther("1"), { value: ethers.utils.parseEther("10") })
        tx = await tx.wait()

        let gascost = tx.cumulativeGasUsed.mul(tx.effectiveGasPrice)

        const balancesAfter: any = await getBalances(accounts.slice(0, 10))



        assert.equal(fromWei(balances[0].sub(gascost).sub(balancesAfter[0])), "10.0")
        for (let i = 1; i < 10; i++) {
            assert.equal(fromWei(balancesAfter[i].sub(balances[i])), "1.0")
        }


    })
    it('should send native token to multiple address with different amount', async () => {
        const balances = await getBalances(accounts.slice(0, 10))
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
        let tx = await multisend.nativeSendDifferentValue(accounts.slice(1, 10), values, { value: totalToSend })
        tx = await tx.wait()

        let gascost = tx.cumulativeGasUsed.mul(tx.effectiveGasPrice)

        const balancesAfter: any = await getBalances(accounts.slice(0, 10))



        assert.equal(fromWei(balances[0].sub(gascost).sub(balancesAfter[0])), fromWei(totalToSend))
        for (let i = 1; i < 10; i++) {
            assert.equal(ethers.utils.formatEther(balancesAfter[i].sub(balances[i])), i + ".0")
        }

    })
    it('should send native token to multiple address with same amount', async () => {
        const balances = await getBalances(accounts.slice(0, 11), false)

        const totalToSend = ethers.utils.parseEther("10")


        let tx = await erc20.increaseAllowance(multisendDiamond, totalToSend);
        await tx.wait()

        //send 1 eth to all
        tx = await multisend.sendSameValue(erc20.address, accounts.slice(1, 10), ethers.utils.parseEther("1"))
        tx = await tx.wait()


        const balancesAfter: any = await getBalances(accounts.slice(0, 11), false)



        assert.equal(fromWei(balances[0].sub(balancesAfter[0])), fromWei(totalToSend))
        for (let i = 1; i <= 10; i++) {
            assert.equal(fromWei(balancesAfter[i]), "1.0")
        }
        multisend.sendSameValue()

    })
    it('should send native token to multiple address with different amount', async () => {



        const balances = await getBalances(accounts.slice(0, 10), true)
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
        let tx = await erc20.increaseAllowance(multisendDiamond, totalToSend);
        tx = await tx.wait()
        tx = await multisend.sendDifferentValue(erc20.address, accounts.slice(1, 10), values)
        tx = await tx.wait()



        const balancesAfter: any = await getBalances(accounts.slice(0, 10), true)



        assert.equal(fromWei(balances[0].sub(balancesAfter[0])), fromWei(totalToSend))
        for (let i = 1; i <= 10; i++) {
            assert.equal(fromWei(balancesAfter[i]), i + ".0")
        }
    })
});