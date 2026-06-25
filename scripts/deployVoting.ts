import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    console.log(`\n📡 Deploying to network: ${network.name}`);
    console.log("─".repeat(45));

    // Deployer account
    const [deployer] = await ethers.getSigners();
    console.log(`👤 Deployer : ${deployer.address}`);

    // Deploy Voting contract
    const VotingFactory = await ethers.getContractFactory("Voting");
    console.log("⏳ Deploying Voting contract...");
    const voting = await VotingFactory.deploy();
    await voting.deployed();
    // Wait for the deployment transaction to be mined (helps on testnets)
    if (voting.deployTransaction) await voting.deployTransaction.wait();

    const address = voting.address;
    console.log(`✅ Voting deployed at: ${address}`);

    // Load artifact (ABI)
    const artifact = JSON.parse(
        fs.readFileSync(
            path.join(__dirname, "../artifacts/contracts/Voting.sol/Voting.json"),
            "utf8"
        )
    );

    // Export directory
    const exportDir = path.join(__dirname, "../artifacts-export");
    if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir, { recursive: true });

    // Save ABI
    const abiPath = path.join(exportDir, "Voting.abi.json");
    fs.writeFileSync(abiPath, JSON.stringify(artifact.abi, null, 2));
    console.log(`📄 ABI exported → artifacts-export/Voting.abi.json`);

    // Save deployment info
    const deployInfo = {
        network: network.name,
        chainId: network.config.chainId,
        contractAddress: address,
        deployer: deployer.address,
        deployedAt: new Date().toISOString(),
        blockNumber: await ethers.provider.getBlockNumber(),
    };
    const name = 'voting-app'
    const deployPath = path.join(exportDir, `deployment.${name}.json`);
    fs.writeFileSync(deployPath, JSON.stringify(deployInfo, null, 2));
    console.log(`🗂️  Deployment info → artifacts-export/deployment.${name}.json`);

    console.log("\n─".repeat(45));
    console.log("🎉 Done!\n");

    return { address, abi: artifact.abi };
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
