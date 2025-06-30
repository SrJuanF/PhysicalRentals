const networkConfig = {
    default: {
        name: "hardhat",
        keepersUpdateInterval: "30",
    },
    31337: {
        name: "localhost",
        subscriptionId: "588",
    },
    11155111: {
        name: "sepolia",
        priceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
        minMint: "150000000000000", // 0.00015 ETH
        router: "0xb83E47C2bC239B3bf370bc41e1459A34b41238D0",
        donId: "0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000",
        gasLimit: "700000", // 500,000 gas
        subscriptionId: "5238",
    },
    43113: {
        name: "fuji",
        priceFeed: "0x5498BB86BC934c8D34FDA08E81D444153d0D06aD",
        minMint: "150000000000000", // 0.00015 AVAX
        router: "0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0",
        donId: "0x66756e2d6176616c616e6368652d66756a692d31000000000000000000000000",
        gasLimit: "700000", // 500,000 gas
        subscriptionId: "15700",
    },
}

const developmentChains = ["hardhat", "localhost"]
const VERIFICATION_BLOCK_CONFIRMATIONS = 2
const frontEndContractsFile = "../fd-physicalloans/constants/networkMapping.json"
const frontEndAbiLocation = "../fd-physicalloans/constants/"

module.exports = {
    networkConfig,
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
    frontEndContractsFile,
    frontEndAbiLocation,
}

