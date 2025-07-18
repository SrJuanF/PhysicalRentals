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

    const toolId = 0n
    const tool = await contract.getTool(toolId)
    console.log("🧾 Datos del tool:")
    console.log("- owner:", tool.owner)
    console.log("- renter:", tool.renter)
    console.log("- status:", tool.status.toString())
    const signerAddress = await signer.getAddress()
    console.log("🔐 Signer actual:", signerAddress)

    try {

        const tx = await contract.receiveTool(toolId, true);
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


/*event DebugToolCheck(address sender, address owner, address renter, toolstatus status);
    event DebugArgs(string arg0, string arg1, string arg2);
    event DebugRequestId(bytes32 requestId);
    event DebugBeforeSendRequest(string msg);
    event DebugAfterSendRequest(bytes32 requestId);
    event DebugError(string reason);
    event confFunctions(uint64 subscriptionId, bytes32 donId, uint32 gasLimit, string source);

    event ChainlinkRequestFailed( uint256 toolId, string errorMessage, bytes errorData);
    event RequestRevertedWithErrorMsg( string reason);
    event RequestRevertedWithoutErrorMsg( bytes data);


    function receiveTool(uint256 toolId, bool actualWorked) external nonReentrant returns (bytes32 requestId){
        // ... Your initial validations (owner/renter, tool status) ...
        emit DebugToolCheck(msg.sender, s_tools[toolId].owner, s_tools[toolId].renter, s_tools[toolId].status);
        Tool memory tool = s_tools[toolId];
        require(
            tool.owner == msg.sender || tool.renter == msg.sender,
            "No eres owner ni renter"
        );

        require(
            tool.status == toolstatus.Sended || tool.status == toolstatus.Returned,
            "Tool no esta en estado 'Sended' o 'Returned'"
        );

        // Your Chainlink Functions validations
        require(i_subscriptionId != 0, "Falta subscription ID");
        require(i_donId != bytes32(0), "DON ID no configurado");
        require(i_gasLimit > 0, "Gas limit invalido");


        // --- END OF REVISED LOGS ---

        emit DebugBeforeSendRequest("Antes de enviar la solicitud");

        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(s_source);

        string[] memory args = new string[](3);
        // Strings.toString() is still correct for uint256 if you're using it for args
        // but if `Strings.sol` import is removed, ensure you don't need it for `args[0]`
        args[0] = Strings.toString(toolId); // Keep this if Strings.sol is imported for other reasons
        args[1] = actualWorked ? "1" : "0";
        args[2] = tool.sendedWorked ? "1" : "0";

        emit DebugArgs(args[0], args[1], args[2]);
        req.setArgs(args);

        requestId = _sendRequest(
            req.encodeCBOR(),
            i_subscriptionId,
            i_gasLimit,
            i_donId
        );
    
        emit DebugAfterSendRequest(requestId);

        s_lastRequest.requestId = requestId;
        s_lastRequest.toolId = toolId;
        s_lastRequest.actualWorked = actualWorked;

        return requestId;
    }*/