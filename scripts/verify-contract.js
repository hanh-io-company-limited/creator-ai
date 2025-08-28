const hre = require("hardhat");

async function main() {
  console.log("🔍 Verifying CreatorAI NFT contract setup...");

  // Contract address - update this after deployment
  const contractAddress = process.env.NFT_CONTRACT_ADDRESS;
  
  if (!contractAddress) {
    console.log("❌ Contract address not found. Please deploy the contract first.");
    return;
  }

  console.log(`📍 Contract Address: ${contractAddress}`);

  // Get contract instance
  const CreatorAINFT = await hre.ethers.getContractFactory("CreatorAINFT");
  const nftContract = CreatorAINFT.attach(contractAddress);

  // Get contract information
  console.log("\n📋 Contract Information:");
  
  try {
    const name = await nftContract.name();
    const symbol = await nftContract.symbol();
    const maxSupply = await nftContract.maxSupply();
    const mintPrice = await nftContract.mintPrice();
    const totalSupply = await nftContract.totalSupply();
    const owner = await nftContract.owner();
    const remainingSupply = await nftContract.remainingSupply();

    console.log(`   Name: ${name}`);
    console.log(`   Symbol: ${symbol}`);
    console.log(`   Max Supply: ${maxSupply.toString()}`);
    console.log(`   Mint Price: ${hre.ethers.formatEther(mintPrice)} ETH`);
    console.log(`   Total Supply: ${totalSupply.toString()}`);
    console.log(`   Remaining Supply: ${remainingSupply.toString()}`);
    console.log(`   Owner: ${owner}`);

    // Check if contract is ready for minting
    const isAvailable = await nftContract.isAvailableForMinting();
    console.log(`   Available for Minting: ${isAvailable ? "✅ Yes" : "❌ No"}`);

    console.log("\n✅ Contract verification completed successfully!");

  } catch (error) {
    console.error("❌ Error verifying contract:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  });