const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting CreatorAI NFT deployment...");

  // Get network name
  const network = hre.network.name;
  console.log(`📡 Deploying to network: ${network}`);

  // Contract parameters
  const name = "CreatorAI NFT";
  const symbol = "CAINFT";
  const maxSupply = 10000; // Maximum 10,000 NFTs
  const mintPrice = hre.ethers.parseEther("0.01"); // 0.01 ETH per NFT
  const baseURI = "https://api.creator-ai.com/metadata/"; // Base URI for metadata

  console.log("📋 Contract Configuration:");
  console.log(`   Name: ${name}`);
  console.log(`   Symbol: ${symbol}`);
  console.log(`   Max Supply: ${maxSupply}`);
  console.log(`   Mint Price: ${hre.ethers.formatEther(mintPrice)} ETH`);
  console.log(`   Base URI: ${baseURI}`);

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`👤 Deploying with account: ${deployer.address}`);
  
  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`💰 Account balance: ${hre.ethers.formatEther(balance)} ETH`);

  // Deploy the contract
  console.log("\n🔨 Deploying CreatorAINFT contract...");
  const CreatorAINFT = await hre.ethers.getContractFactory("CreatorAINFT");
  const nftContract = await CreatorAINFT.deploy(
    name,
    symbol,
    maxSupply,
    mintPrice,
    baseURI
  );

  console.log("⏳ Waiting for deployment to complete...");
  await nftContract.waitForDeployment();

  const contractAddress = await nftContract.getAddress();
  console.log(`✅ CreatorAINFT deployed to: ${contractAddress}`);

  // Save deployment information
  const deploymentInfo = {
    network: network,
    contractAddress: contractAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    contractName: "CreatorAINFT",
    parameters: {
      name,
      symbol,
      maxSupply,
      mintPrice: mintPrice.toString(),
      baseURI
    },
    transactionHash: nftContract.deploymentTransaction()?.hash,
    blockNumber: nftContract.deploymentTransaction()?.blockNumber
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save to deployments directory
  const deploymentFile = path.join(deploymentsDir, `${network}-deployment.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`📄 Deployment info saved to: ${deploymentFile}`);

  // Update .env file with contract address
  const envPath = path.join(__dirname, "..", ".env");
  let envContent = "";
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8");
  }

  // Update or add contract address
  const addressLine = `NFT_CONTRACT_ADDRESS=${contractAddress}`;
  if (envContent.includes("NFT_CONTRACT_ADDRESS=")) {
    envContent = envContent.replace(/NFT_CONTRACT_ADDRESS=.*/, addressLine);
  } else {
    envContent += `\n${addressLine}`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log(`🔧 Updated .env file with contract address`);

  // Verify contract on Etherscan (for testnets/mainnet)
  if (network !== "hardhat" && network !== "localhost") {
    console.log("\n🔍 Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [name, symbol, maxSupply, mintPrice, baseURI],
      });
      console.log("✅ Contract verified on Etherscan");
    } catch (error) {
      console.log("❌ Verification failed:", error.message);
    }
  }

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Summary:");
  console.log(`   Contract Address: ${contractAddress}`);
  console.log(`   Network: ${network}`);
  console.log(`   Deployer: ${deployer.address}`);
  console.log(`   Transaction Hash: ${nftContract.deploymentTransaction()?.hash}`);
  
  console.log("\n🚀 Next steps:");
  console.log("   1. Update your frontend with the contract address");
  console.log("   2. Test minting functionality");
  console.log("   3. Set up metadata server");
  console.log("   4. Configure authorized minters if needed");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });