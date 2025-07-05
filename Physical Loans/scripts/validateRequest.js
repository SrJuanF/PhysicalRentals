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
        const tokenID = 0n; // ID del tool que quieres rentar
        const durationSeg = 86400n; // Duración del alquiler en segundos (1 día)
        // This is the line causing the error
        const overrides = { value: ethers.parseEther("0.1074") };
        console.log("Overrides object created successfully:", overrides); // Debug: Did we get here?

        const tx = await contract.rentTool(tokenID, durationSeg, overrides);
        const result = await tx.wait();
        console.log("✅ Transacción confirmada");
        console.log("✅ Transacción confirmada. Bloque:", result.blockNumber);
        console.log("Gas usado:", result.gasUsed.toString());
        // --- Accediendo a los Logs/Eventos ---
        if (result.logs) {
            console.log("📄 Logs de la transacción:");
            result.logs.forEach((log, index) => {
                try {
                    // Intenta parsear el log usando la interfaz de tu contrato
                    const parsedLog = contract.interface.parseLog(log);
                    if (parsedLog) {
                        console.log(`  Log ${index + 1}:`);
                        console.log(`    Nombre del Evento: ${parsedLog.name}`);
                        console.log(`    Argumentos:`);
                        // Itera sobre los argumentos del evento para mostrarlos
                        parsedLog.args.forEach((arg, i) => {
                            console.log(`      ${parsedLog.fragment.inputs[i].name || `Arg${i}`}: ${arg.toString()}`);
                        });
                    } else {
                        console.log(`  Log ${index + 1}: No se pudo parsear (posiblemente no es un evento de este contrato).`, log);
                    }
                } catch (parseError) {
                    console.error(`  Error al parsear el log ${index + 1}:`, parseError.message);
                    console.log("  Log raw:", log);
                }
            });
        } else {
            console.log("No se encontraron logs en esta transacción.");
        }
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