//function deployFunc() {
//    console.log("hello")
//     hre.getNammedAccounts()
//  hre.deployments
//}

const { deployments, network } = require("hardhat")
const { verify } = require("../Utils/verify")

//module.exports.default = deployFunc

//module.exports = async hre => {
//    const { getNamedAccounts, deployments } = hre
//    // hre.getNAmedAccounts e hre.deployments
//}

const { networkConfig, developmentChains } = require("../helper-hardhat-config")
//const helperConfig = require("../helper-hardhat-config")
//const networkConfig = helperconfig.networkConfig

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chaindId = network.config.chaindId

    //const ethUsdPriceFeedAddress = networkConfig[chaindId]["ethUsdPriceFeed"]
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chaindId]["ethUsdPriceFeed"]
    }

    //when going for localhost or hardhat network we want to use a mock
    const args = [ethUsdPriceFeedAddress]

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, // put price feed address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }

    log("-----------------------------")
}
module.exports.tags = ["all", "fundMe"]
