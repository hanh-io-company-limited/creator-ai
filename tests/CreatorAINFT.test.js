const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CreatorAINFT", function () {
  let CreatorAINFT;
  let nftContract;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  const NAME = "CreatorAI NFT";
  const SYMBOL = "CAINFT";
  const MAX_SUPPLY = 1000;
  const MINT_PRICE = ethers.parseEther("0.01");
  const BASE_URI = "https://api.creator-ai.com/metadata/";

  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy contract
    CreatorAINFT = await ethers.getContractFactory("CreatorAINFT");
    nftContract = await CreatorAINFT.deploy(
      NAME,
      SYMBOL,
      MAX_SUPPLY,
      MINT_PRICE,
      BASE_URI
    );
    await nftContract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await nftContract.name()).to.equal(NAME);
      expect(await nftContract.symbol()).to.equal(SYMBOL);
    });

    it("Should set the correct owner", async function () {
      expect(await nftContract.owner()).to.equal(owner.address);
    });

    it("Should set the correct max supply", async function () {
      expect(await nftContract.maxSupply()).to.equal(MAX_SUPPLY);
    });

    it("Should set the correct mint price", async function () {
      expect(await nftContract.mintPrice()).to.equal(MINT_PRICE);
    });

    it("Should start with zero total supply", async function () {
      expect(await nftContract.totalSupply()).to.equal(0);
    });

    it("Should be available for minting", async function () {
      expect(await nftContract.isAvailableForMinting()).to.be.true;
    });

    it("Should have correct remaining supply", async function () {
      expect(await nftContract.remainingSupply()).to.equal(MAX_SUPPLY);
    });
  });

  describe("Minting", function () {
    const tokenURI = "https://example.com/token/1";

    it("Should allow owner to mint for free", async function () {
      await expect(nftContract.mint(addr1.address, tokenURI))
        .to.emit(nftContract, "NFTMinted")
        .withArgs(1, owner.address, addr1.address, tokenURI);

      expect(await nftContract.totalSupply()).to.equal(1);
      expect(await nftContract.ownerOf(1)).to.equal(addr1.address);
      expect(await nftContract.tokenURI(1)).to.equal(tokenURI);
    });

    it("Should require payment for non-owner minting", async function () {
      await expect(
        nftContract.connect(addr1).mint(addr1.address, tokenURI)
      ).to.be.revertedWith("Insufficient payment for minting");
    });

    it("Should allow paid minting", async function () {
      await expect(
        nftContract.connect(addr1).mint(addr1.address, tokenURI, {
          value: MINT_PRICE
        })
      )
        .to.emit(nftContract, "NFTMinted")
        .withArgs(1, addr1.address, addr1.address, tokenURI);

      expect(await nftContract.totalSupply()).to.equal(1);
      expect(await nftContract.ownerOf(1)).to.equal(addr1.address);
    });

    it("Should track token creators", async function () {
      await nftContract.mint(addr1.address, tokenURI);
      expect(await nftContract.getCreator(1)).to.equal(owner.address);

      await nftContract.connect(addr1).mint(addr2.address, tokenURI, {
        value: MINT_PRICE
      });
      expect(await nftContract.getCreator(2)).to.equal(addr1.address);
    });

    it("Should not allow minting to zero address", async function () {
      await expect(
        nftContract.mint(ethers.ZeroAddress, tokenURI)
      ).to.be.revertedWith("Cannot mint to zero address");
    });

    it("Should not allow minting with empty token URI", async function () {
      await expect(
        nftContract.mint(addr1.address, "")
      ).to.be.revertedWith("Token URI cannot be empty");
    });

    it("Should update remaining supply after minting", async function () {
      await nftContract.mint(addr1.address, tokenURI);
      expect(await nftContract.remainingSupply()).to.equal(MAX_SUPPLY - 1);
    });
  });

  describe("Batch Minting", function () {
    const tokenURIs = [
      "https://example.com/token/1",
      "https://example.com/token/2",
      "https://example.com/token/3"
    ];

    it("Should allow owner to batch mint for free", async function () {
      await nftContract.batchMint(addr1.address, tokenURIs);
      
      expect(await nftContract.totalSupply()).to.equal(3);
      expect(await nftContract.ownerOf(1)).to.equal(addr1.address);
      expect(await nftContract.ownerOf(2)).to.equal(addr1.address);
      expect(await nftContract.ownerOf(3)).to.equal(addr1.address);
    });

    it("Should require correct payment for batch minting", async function () {
      const correctPayment = MINT_PRICE * BigInt(tokenURIs.length);
      
      await expect(
        nftContract.connect(addr1).batchMint(addr1.address, tokenURIs, {
          value: correctPayment
        })
      ).to.not.be.reverted;

      expect(await nftContract.totalSupply()).to.equal(3);
    });

    it("Should reject insufficient payment for batch minting", async function () {
      const insufficientPayment = MINT_PRICE * BigInt(tokenURIs.length - 1);
      
      await expect(
        nftContract.connect(addr1).batchMint(addr1.address, tokenURIs, {
          value: insufficientPayment
        })
      ).to.be.revertedWith("Insufficient payment for batch minting");
    });

    it("Should not allow empty batch minting", async function () {
      await expect(
        nftContract.batchMint(addr1.address, [])
      ).to.be.revertedWith("Must mint at least one token");
    });
  });

  describe("Authorization", function () {
    const tokenURI = "https://example.com/token/1";

    it("Should allow setting minter authorization", async function () {
      await expect(nftContract.setMinterAuthorization(addr1.address, true))
        .to.emit(nftContract, "MinterAuthorized")
        .withArgs(addr1.address, true);

      expect(await nftContract.authorizedMinters(addr1.address)).to.be.true;
    });

    it("Should allow authorized minters to mint for free", async function () {
      await nftContract.setMinterAuthorization(addr1.address, true);
      
      await expect(
        nftContract.connect(addr1).mint(addr2.address, tokenURI)
      ).to.not.be.reverted;

      expect(await nftContract.totalSupply()).to.equal(1);
    });

    it("Should only allow owner to set authorization", async function () {
      await expect(
        nftContract.connect(addr1).setMinterAuthorization(addr2.address, true)
      ).to.be.revertedWithCustomError(nftContract, "OwnableUnauthorizedAccount");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update mint price", async function () {
      const newPrice = ethers.parseEther("0.02");
      
      await expect(nftContract.setMintPrice(newPrice))
        .to.emit(nftContract, "MintPriceUpdated")
        .withArgs(MINT_PRICE, newPrice);

      expect(await nftContract.mintPrice()).to.equal(newPrice);
    });

    it("Should allow owner to update max supply", async function () {
      const newMaxSupply = 2000;
      
      await expect(nftContract.setMaxSupply(newMaxSupply))
        .to.emit(nftContract, "MaxSupplyUpdated")
        .withArgs(MAX_SUPPLY, newMaxSupply);

      expect(await nftContract.maxSupply()).to.equal(newMaxSupply);
    });

    it("Should not allow reducing max supply below current supply", async function () {
      // Mint some tokens first
      await nftContract.mint(addr1.address, "uri1");
      await nftContract.mint(addr1.address, "uri2");
      
      await expect(
        nftContract.setMaxSupply(1)
      ).to.be.revertedWith("New max supply must be greater than current supply");
    });

    it("Should allow owner to withdraw funds", async function () {
      // First, let someone mint and pay
      await nftContract.connect(addr1).mint(addr1.address, "uri", {
        value: MINT_PRICE
      });

      const initialBalance = await ethers.provider.getBalance(owner.address);
      
      await nftContract.withdraw();
      
      const finalBalance = await ethers.provider.getBalance(owner.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should not allow non-owner to call admin functions", async function () {
      await expect(
        nftContract.connect(addr1).setMintPrice(100)
      ).to.be.revertedWithCustomError(nftContract, "OwnableUnauthorizedAccount");

      await expect(
        nftContract.connect(addr1).setMaxSupply(500)
      ).to.be.revertedWithCustomError(nftContract, "OwnableUnauthorizedAccount");

      await expect(
        nftContract.connect(addr1).withdraw()
      ).to.be.revertedWithCustomError(nftContract, "OwnableUnauthorizedAccount");
    });
  });

  describe("Supply Management", function () {
    it("Should not allow minting beyond max supply", async function () {
      // Set a very low max supply for testing
      const lowSupplyContract = await CreatorAINFT.deploy(
        NAME,
        SYMBOL,
        2, // Max supply of 2
        MINT_PRICE,
        BASE_URI
      );

      // Mint up to max supply
      await lowSupplyContract.mint(addr1.address, "uri1");
      await lowSupplyContract.mint(addr1.address, "uri2");

      // Try to mint beyond max supply
      await expect(
        lowSupplyContract.mint(addr1.address, "uri3")
      ).to.be.revertedWith("Maximum supply reached");
    });

    it("Should correctly report availability for minting", async function () {
      // Set a very low max supply for testing
      const lowSupplyContract = await CreatorAINFT.deploy(
        NAME,
        SYMBOL,
        1, // Max supply of 1
        MINT_PRICE,
        BASE_URI
      );

      expect(await lowSupplyContract.isAvailableForMinting()).to.be.true;
      
      await lowSupplyContract.mint(addr1.address, "uri1");
      
      expect(await lowSupplyContract.isAvailableForMinting()).to.be.false;
    });
  });

  describe("ERC721 Compliance", function () {
    beforeEach(async function () {
      // Mint a token for testing
      await nftContract.mint(addr1.address, "https://example.com/token/1");
    });

    it("Should support ERC721 interface", async function () {
      // ERC721 interface ID: 0x80ac58cd
      expect(await nftContract.supportsInterface("0x80ac58cd")).to.be.true;
    });

    it("Should allow token transfers", async function () {
      await nftContract.connect(addr1).transferFrom(addr1.address, addr2.address, 1);
      expect(await nftContract.ownerOf(1)).to.equal(addr2.address);
    });

    it("Should allow approval and transfer by approved address", async function () {
      await nftContract.connect(addr1).approve(addr2.address, 1);
      await nftContract.connect(addr2).transferFrom(addr1.address, addr2.address, 1);
      expect(await nftContract.ownerOf(1)).to.equal(addr2.address);
    });
  });
});