const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("receiveTool", function () {
    let toolId = 0

    beforeEach(async () => {
        accounts = await ethers.getSigners()
        deployer = accounts[0] // account 2
        renter = accounts[1]
        let attacker = "0x0000000000000000000000000000000000000000" // Dirección de un atacante

        await deployments.fixture(["all"])
        const contract = await ethers.getContract("PhysicalRental")
        physicalRental = contract.connect(deployer)

        // Simulamos que existe una herramienta listada
        await physicalRental.listTool("uri", 100, 50, 1, { value: ethers.utils.parseEther("0.1") })
        await physicalRental.connect(renter).rentTool(toolId, 1, { value: ethers.utils.parseEther("0.2") })

        // Enviarla (cambiar estado a Sended)
        await physicalRental.sendTool(toolId, true)

        // Asumimos valores válidos de configuración de Chainlink (puedes mockear si es necesario)
        await physicalRental.setMockChainlinkSettings() // Asegúrate de tener esta función en tu contrato si usas mocks
    })

    it("debería revertir si el msg.sender no es ni owner ni renter", async () => {
        const instance = physicalRental.connect(attacker)
        await expect(instance.receiveTool(toolId, true)).to.be.revertedWithCustomError(physicalRental, "AccessNotPermited")
    })

    it("debería revertir si el estado no es Sended ni Returned", async () => {
        // Creamos nueva herramienta sin cambiar su estado a Sended
        await physicalRental.listTool("uri", 100, 50, 1, { value: ethers.utils.parseEther("0.1") })
        const invalidToolId = 1

        await expect(
            physicalRental.receiveTool(invalidToolId, true)
        ).to.be.revertedWithCustomError(physicalRental, "toolNotSended")
    })

    it("debería revertir si i_subscriptionId es 0", async () => {
        await physicalRental.setChainlinkParams(0, "0x1234", 500000) // invalid subscriptionId

        await expect(
            physicalRental.receiveTool(toolId, true)
        ).to.be.revertedWith("Missing subscription ID")
    })

    it("debería revertir si i_donId es 0", async () => {
        await physicalRental.setChainlinkParams(1, "0x0000000000000000000000000000000000000000000000000000000000000000", 500000)

        await expect(
            physicalRental.receiveTool(toolId, true)
        ).to.be.revertedWith("DON ID not set")
    })

    it("debería revertir si i_gasLimit es 0", async () => {
        await physicalRental.setChainlinkParams(1, "0x1234", 0)

        await expect(
            physicalRental.receiveTool(toolId, true)
        ).to.be.revertedWith("Gas limit must be greater than 0")
    })

    it("debería emitir todos los eventos correctamente si todo es válido", async () => {
        // Suponiendo que tienes un mock para _sendRequest o una versión que devuelve un requestId de prueba
        const tx = await physicalRental.receiveTool(toolId, true)
        const receipt = await tx.wait()

        const debugBefore = receipt.events.find(e => e.event === "DebugBeforeSendRequest")
        const debugArgs = receipt.events.find(e => e.event === "DebugArgs")
        const debugAfter = receipt.events.find(e => e.event === "DebugAfterSendRequest")

        expect(debugBefore).to.not.be.undefined
        expect(debugArgs).to.not.be.undefined
        expect(debugAfter).to.not.be.undefined
    })
})

