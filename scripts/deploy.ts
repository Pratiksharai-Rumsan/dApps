//import "@nomiclabs/hardhat-ethers";
import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log(`\n📡 Deploying to network: ${network.name}`);
  console.log("─".repeat(45));

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log(`👤 Deployer : ${deployer.address}`);


  // Deploy contract
  const Greeting = await ethers.getContractFactory("Greeting");
  console.log("⏳ Deploying Greeting contract...");
  const greeting = await Greeting.deploy();
  await greeting.deployed();
  // The contract is now deployed; the deployment transaction is accessible via greeting.deployTransaction
  const deploymentTx = greeting.deployTransaction;
  if (deploymentTx) await deploymentTx.wait();

  const address = greeting.address;
  console.log(`✅ Greeting deployed at: ${address}`);

  // Load artifact
  const artifact = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../artifacts/contracts/Greeting.sol/Greeting.json"), "utf8")
  );

  // ── Export ABI + address ──────────────────────────────────────────────
  // Verify initial greeting using explicit getter
  // Use the deployer signer (connected to baseSepolia) as provider
  const greetingContract = new ethers.Contract(address, Greeting.interface, deployer);
  // Wait a moment for the network to index the deployment (helps on testnets)
  await new Promise(r => setTimeout(r, 3000));
  const initialGreeting = await greetingContract.greeting(); // "Hello Blockchain"
  console.log(`📝 Initial greeting   : "${initialGreeting}"\n`);

  const exportDir = path.join(__dirname, "../artifacts-export");
  if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir, { recursive: true });

  // Save ABI
  const abiPath = path.join(exportDir, "Greeting.abi.json");
  fs.writeFileSync(abiPath, JSON.stringify(artifact.abi, null, 2));
  console.log(`📄 ABI exported  → artifacts-export/Greeting.abi.json`);

  // Save deployment info
  const deployInfo = {
    network: network.name,
    chainId: network.config.chainId,
    contractAddress: address,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber(),
  };

  const deployPath = path.join(exportDir, `deployment.${network.name}.json`);
  fs.writeFileSync(deployPath, JSON.stringify(deployInfo, null, 2));
  console.log(
    `🗂️  Deployment info → artifacts-export/deployment.${network.name}.json`
  );

  console.log("\n─".repeat(45));
  console.log("🎉 Done!\n");

  return { address, abi: artifact.abi };
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
