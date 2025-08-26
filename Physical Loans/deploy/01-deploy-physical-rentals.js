const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    log("----------------------------------------------------")
    const arguments = [
        networkConfig[chainId]["priceFeed"],
        networkConfig[chainId]["minMint"],
        networkConfig[chainId]["router"],
        networkConfig[chainId]["donId"],
        networkConfig[chainId]["gasLimit"],
        networkConfig[chainId]["subscriptionId"],
        source
    ]
    const physicalRentals = await deploy("PhysicalRental", {
        from: deployer,
        args: arguments,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    // Verify the deployment
    if (!developmentChains.includes(network.name)) {
        log("Verifying...")
        await verify(physicalRentals.address, arguments)
    }
}

module.exports.tags = ["all", "physicalRentals"]

//Fuji = https://testnet.snowtrace.io/address/0xF70a99bc13bB9e0e972e991Fca0fC7f888Db85a1

//Sepolia = 

/*
git add . && \
rm -rf physicalloans-Graph/physical-rentals/.git && \
git rm --cached -rf physicalloans-Graph/physical-rentals && \
rm -rf fd-physicalloans/.git && \
git rm --cached -rf fd-physicalloans && \
git add physicalloans-Graph/physical-rentals && \
git add fd-physicalloans 
git commit -m "deploy physical rentals"
git push // -u origin main

git remote set-url origin https://github.com/usuario/repositorio2.git
git push -u origin ma
*/

const source = `
const toolId = Number(args[0]);
const conditionReceiveUser = Number(args[1]);
const conditionSendedUser = Number(args[2]);
const SUPABASE_URL = "https://momeenlweghtwdfqsyin.supabase.co";
const SUPABASE_ANON_KEY = ${process.env.SUPABASE_ANON_KEY};
const response = await Functions.makeHttpRequest({
  url: \`\${SUPABASE_URL}/rest/v1/inspects?id=eq.\${toolId}\`,
  method: "GET",
  headers: {
    apikey: SUPABASE_ANON_KEY,
    Authorization: \`Bearer \${SUPABASE_ANON_KEY}\`,
    Accept: "application/json"
  }
});
if (response.error) {
  throw Error(\`Error HTTP: \${response.error}\`);
}
const tools = response.data;
if (!tools || tools.length === 0) {
  throw Error(\`Tool with ID \${toolId} not found\`);
}
const conditionReceiveSystem = tools[0].conditionReceive ? 1 : 0;
const conditionSendedSystem = tools[0].conditionSended ? 1 : 0;
const discrepaReceive = conditionReceiveSystem != conditionReceiveUser;
const discrepaSended = conditionSendedSystem != conditionSendedUser;
const value = discrepaReceive ? 3 : discrepaSended ? 2 : conditionReceiveSystem;
return Functions.encodeUint256(value);
`;




/* 
https://github.com/ciaranightingale/chainlink-fundamentals-code/blob/main/automation/CustomLogic.sol
https://github.com/ciaranightingale/chainlink-fundamentals-code/blob/main/functions/FunctionsConsumer.sol
https://functions.chain.link/playground
*/

