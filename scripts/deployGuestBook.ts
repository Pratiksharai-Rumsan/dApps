// scripts/deployGuestBook.ts
// Deploy script for GuestBook contract using Hardhat
import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log(`\n📡 Deploying to network: ${network.name}`);
  console.log("─".repeat(45));

  // Deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`👤 Deployer : ${deployer.address}`);

  // Deploy GuestBook contract
  const GuestBookFactory = await ethers.getContractFactory("GuestBook");
  console.log("⏳ Deploying GuestBook contract...");
  const guestBook = await GuestBookFactory.deploy();
  await guestBook.deployed();
  if (guestBook.deployTransaction) await guestBook.deployTransaction.wait();

  const address = guestBook.address;
  console.log(`✅ GuestBook deployed at: ${address}`);

  // Load artifact (ABI)
  const artifact = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../artifacts/contracts/GuestBook.sol/GuestBook.json"),
      "utf8"
    )
  );

  // Export directory
  const exportDir = path.join(__dirname, "../artifacts-export");
  if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir, { recursive: true });

  // Save ABI
  const abiPath = path.join(exportDir, "GuestBook.abi.json");
  fs.writeFileSync(abiPath, JSON.stringify(artifact.abi, null, 2));
  console.log(`📄 ABI exported → artifacts-export/GuestBook.abi.json`);

  // Save deployment info
  const deployInfo = {
    network: network.name,
    chainId: network.config.chainId,
    contractAddress: address,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber()
  };
  const name = 'guestbook-app'
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
