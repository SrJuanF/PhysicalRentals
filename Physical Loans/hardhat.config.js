require("@nomicfoundation/hardhat-toolbox")
require("@nomicfoundation/hardhat-verify");
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require("dotenv").config()

//yarn add --dev @chainlink/contracts @nomiclabs/hardhat-etherscan @nomiclabs/hardhat-waffle
// @openzeppelin/contracts babel-eslint dotenv ethereum-waffle hardhat-contract-sizer hardhat-deploy prettier prettier-plugin-solidity solhint

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL
const FUJI_RPC_URL = process.env.FUJI_RPC_URL

const PRIVATE_KEYA = process.env.PRIVATE_KEYA
const PRIVATE_KEYB = process.env.PRIVATE_KEYB

// Your API key for Etherscan, obtain one at https://etherscan.io/
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const SNOWSCAN_API_KEY = process.env.SNOWSCAN_API_KEY

const REPORT_GAS = process.env.REPORT_GAS || false
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
        },
        localhost: {
            chainId: 31337,
        },
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEYA, PRIVATE_KEYB],
            saveDeployments: true,
            chainId: 11155111,
        },
        fuji: {
            url: FUJI_RPC_URL,
            accounts: [PRIVATE_KEYA, PRIVATE_KEYB],
            saveDeployments: true,
            chainId: 43113,
        },
    },
    etherscan: {
        // npx hardhat verify --network <NETWORK> <CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMETERS>
        apiKey: {
            sepolia: ETHERSCAN_API_KEY,
            avalancheFujiTestnet: SNOWSCAN_API_KEY
        },
        customChains: [
            {
              network: "avalancheFujiTestnet",
              chainId: 43113,
              urls: {
                apiURL: "https://api-testnet.snowtrace.io/api",
                browserURL: "https://testnet.snowtrace.io"
              }
            }
        ]
    },
    gasReporter: {
        enabled: REPORT_GAS,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
        coinmarketcap: COINMARKETCAP_API_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0, // here this will by default take the first account as deployer
            1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
        },
        player: {
            default: 1,
        },
    },
    solidity: {
        compilers: [{
            version: "0.8.24",
            settings: {
                optimizer: {
                enabled: true,
                runs: 50,
                },
            },},{
            version: "0.8.20",
            settings: {
                optimizer: {
                enabled: true,
                runs: 50,
                },
            },},
        ]
    },
    mocha: {
        timeout: 200000, // 200 seconds max for running tests
    },
    /*
    contractSizer: {
        runOnCompile: false,
        only: ["PhysicalRental"],
    },*/
}
