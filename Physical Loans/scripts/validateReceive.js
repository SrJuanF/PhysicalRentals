const hre = require("hardhat")
const { ethers, getNamedAccounts } = hre

async function main() {
    // deployer es account 2
    const { deployer, player } = await getNamedAccounts()

    console.log("Deployer:", deployer)
    console.log("User:", player)

    // Conectar manualmente con la address del deployer
    const signer = await ethers.getSigner(deployer)
    // 👉 Usa aquí la dirección antigua (la que ya tenía datos)
    const contractAddress = "0x47f00852F931F5f78249C921eB2B0f4af057a0D1"

    // Conecta tu contrato en Fuji (sin redeploy, solo attach)
    const contract = await ethers.getContractAt("PhysicalRental", contractAddress, signer)

    try {
        const tx = await contract.receiveTool(1, true)
        await tx.wait()
        console.log("✅ Transacción confirmada")
        console.log("🔍 Logs de eventos:")
        for (const event of tx.events) {
            console.log("📢 Evento:", event.event)
            console.log("📦 Argumentos:", event.args)
        }
    } catch (error) {
        console.error("❌ Transacción revertida")

        // Decodificar error personalizado
        if (error.errorName) {
            console.error("🔍 Error personalizado:", error.errorName)
            console.error("📦 Args:", error.errorArgs)
        }

        // En caso de fallback
        if (error.reason) {
            console.error("📜 Reason:", error.reason)
        } else if (error.message) {
            console.error("📜 Message:", error.message)
        } else {
            console.error("⛔ Error completo:", error)
        }
    }
}

main().catch((error) => {
    console.error("❌ Error en el script:", error)
    process.exit(1)
})
