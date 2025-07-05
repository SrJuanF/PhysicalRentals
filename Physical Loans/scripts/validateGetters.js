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
    const contractAddress = process.env.CONTRACT_ADDRESS
    // Conecta tu contrato en Fuji (sin redeploy, solo attach)
    const contract = await ethers.getContractAt("PhysicalRental", contractAddress, signer)

    try {
        const toolId = 3n
        const tool = await contract.getTool(toolId)
        console.log("🧾 Datos del tool:")
        console.log("- owner:", tool.owner)
        console.log("- renter:", tool.renter)
        console.log("- rentalDuration:", tool.rentalDuration)
        console.log("- status:", tool.status.toString())
        const signerAddress = await signer.getAddress()
        console.log("🔐 Signer actual:", signerAddress)

        const activeRental = await contract.getActiveRental(toolId);
        
        console.log("✅ Renta Activa - renter:", activeRental.renter);
        console.log("✅ Renta Activa - endTime:", activeRental.rentalEnd);


        const lineNear = await contract.getRentalNearLine();
        console.log("✅ Línea de Alquiler Cercana - renter:", lineNear);
        const date = new Date(Number(lineNear) * 1000); // Se multiplica por 1000 porque Date espera milisegundos
        console.log("Fecha LineNear: ", date.toString());
        
    } catch (error) {
        console.error("❌ La transacción falló:");
        console.error(error);

        // --- Manejo de Errores Específicos de Ethers.js v6 ---

        // Si el error es un revert del contrato (por un require/revert)
        if (error.revert && error.revert.reason) {
            console.error("Razón específica del revert (en contrato):", error.revert.reason);
        } else if (error.shortMessage) {
            // Un mensaje corto y legible proporcionado por Ethers.js v6
            console.error("Mensaje de error corto:", error.shortMessage);
        } else if (error.code) {
            // Códigos de error específicos de Ethers.js (e.g., 'TRANSACTION_REPLACED', 'INSUFFICIENT_FUNDS')
            console.error("Código de error de Ethers.js:", error.code);
            if (error.code === 'CALL_EXCEPTION' && error.data) {
                // Para errores de ejecución de contrato que no son 'reverts' explícitos
                console.error("Datos del error de llamada:", error.data);
            }
        } else {
            // Cualquier otro tipo de error
            console.error("Error desconocido:", error.message);
        }
    }
}

main().catch((error) => {
    console.error("❌ Error en el script:", error)
    process.exit(1)
})