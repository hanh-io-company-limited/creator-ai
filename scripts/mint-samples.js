const hre = require("hardhat");

async function main() {
  console.log("🎯 Minting sample NFTs...");

  // Contract address - update after deployment
  const contractAddress = process.env.NFT_CONTRACT_ADDRESS;
  
  if (!contractAddress) {
    console.log("❌ Contract address not found. Please deploy the contract first.");
    return;
  }

  // Get contract instance
  const CreatorAINFT = await hre.ethers.getContractFactory("CreatorAINFT");
  const nftContract = CreatorAINFT.attach(contractAddress);

  // Get signers
  const [owner, user1] = await hre.ethers.getSigners();
  console.log(`👤 Owner: ${owner.address}`);
  console.log(`👤 User1: ${user1.address}`);

  // Sample metadata URIs
  const sampleURIs = [
    "https://gateway.pinata.cloud/ipfs/QmYourHash1",
    "https://gateway.pinata.cloud/ipfs/QmYourHash2",
    "https://gateway.pinata.cloud/ipfs/QmYourHash3"
  ];

  try {
    // Mint as owner (free)
    console.log("\n🔥 Minting as owner (free)...");
    const tx1 = await nftContract.mint(owner.address, sampleURIs[0]);
    await tx1.wait();
    console.log("✅ NFT #1 minted to owner");

    // Mint as user (paid)
    console.log("\n💰 Minting as user (paid)...");
    const mintPrice = await nftContract.mintPrice();
    const tx2 = await nftContract.connect(user1).mint(user1.address, sampleURIs[1], {
      value: mintPrice
    });
    await tx2.wait();
    console.log("✅ NFT #2 minted to user1");

    // Batch mint as owner
    console.log("\n🚀 Batch minting as owner...");
    const tx3 = await nftContract.batchMint(owner.address, [sampleURIs[2]]);
    await tx3.wait();
    console.log("✅ Batch mint completed");

    // Display final stats
    const totalSupply = await nftContract.totalSupply();
    const remainingSupply = await nftContract.remainingSupply();
    const ownerBalance = await nftContract.balanceOf(owner.address);
    const user1Balance = await nftContract.balanceOf(user1.address);

    console.log("\n📊 Final Statistics:");
    console.log(`   Total Supply: ${totalSupply}`);
    console.log(`   Remaining Supply: ${remainingSupply}`);
    console.log(`   Owner Balance: ${ownerBalance}`);
    console.log(`   User1 Balance: ${user1Balance}`);

    console.log("\n🎉 Sample minting completed successfully!");

  } catch (error) {
    console.error("❌ Error during minting:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });