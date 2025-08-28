// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CreatorAI NFT
 * @dev ERC721 NFT contract for Creator AI platform
 * @notice This contract allows minting of NFTs with metadata
 */
contract CreatorAINFT is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    // Counter for token IDs
    uint256 private _currentTokenId;

    // Mapping from token ID to creator address
    mapping(uint256 => address) public tokenCreators;

    // Mapping to track if an address is authorized to mint
    mapping(address => bool) public authorizedMinters;

    // Maximum number of tokens that can be minted
    uint256 public maxSupply;

    // Price per NFT (in wei)
    uint256 public mintPrice;

    // Base URI for metadata
    string private _baseTokenURI;

    // Events
    event NFTMinted(uint256 indexed tokenId, address indexed creator, address indexed to, string tokenURI);
    event MinterAuthorized(address indexed minter, bool authorized);
    event MintPriceUpdated(uint256 oldPrice, uint256 newPrice);
    event MaxSupplyUpdated(uint256 oldSupply, uint256 newSupply);

    /**
     * @dev Constructor
     * @param _name Name of the NFT collection
     * @param _symbol Symbol of the NFT collection
     * @param _maxSupply Maximum number of tokens that can be minted
     * @param _mintPrice Price per NFT in wei
     * @param _baseURI Base URI for token metadata
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _maxSupply,
        uint256 _mintPrice,
        string memory _baseURI
    ) ERC721(_name, _symbol) Ownable(msg.sender) {
        maxSupply = _maxSupply;
        mintPrice = _mintPrice;
        _baseTokenURI = _baseURI;
        
        // Start token IDs from 1
        _currentTokenId = 0;
    }

    /**
     * @dev Mint a new NFT
     * @param to Address to receive the NFT
     * @param tokenURI URI for token metadata
     */
    function mint(address to, string memory tokenURI) public payable nonReentrant {
        require(to != address(0), "Cannot mint to zero address");
        require(bytes(tokenURI).length > 0, "Token URI cannot be empty");
        require(_currentTokenId + 1 <= maxSupply, "Maximum supply reached");
        
        // Check if caller is authorized or if it's a paid mint
        if (!authorizedMinters[msg.sender] && msg.sender != owner()) {
            require(msg.value >= mintPrice, "Insufficient payment for minting");
        }

        _currentTokenId++;
        uint256 tokenId = _currentTokenId;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        // Record the creator
        tokenCreators[tokenId] = msg.sender;

        emit NFTMinted(tokenId, msg.sender, to, tokenURI);
    }

    /**
     * @dev Batch mint multiple NFTs
     * @param to Address to receive the NFTs
     * @param tokenURIs Array of URIs for token metadata
     */
    function batchMint(address to, string[] memory tokenURIs) public payable nonReentrant {
        require(to != address(0), "Cannot mint to zero address");
        require(tokenURIs.length > 0, "Must mint at least one token");
        require(_currentTokenId + tokenURIs.length <= maxSupply, "Would exceed maximum supply");

        // Check payment for batch minting
        if (!authorizedMinters[msg.sender] && msg.sender != owner()) {
            require(msg.value >= mintPrice * tokenURIs.length, "Insufficient payment for batch minting");
        }

        for (uint256 i = 0; i < tokenURIs.length; i++) {
            require(bytes(tokenURIs[i]).length > 0, "Token URI cannot be empty");
            
            _currentTokenId++;
            uint256 tokenId = _currentTokenId;

            _safeMint(to, tokenId);
            _setTokenURI(tokenId, tokenURIs[i]);
            
            // Record the creator
            tokenCreators[tokenId] = msg.sender;

            emit NFTMinted(tokenId, msg.sender, to, tokenURIs[i]);
        }
    }

    /**
     * @dev Get the creator of a token
     * @param tokenId Token ID
     * @return Address of the token creator
     */
    function getCreator(uint256 tokenId) public view returns (address) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return tokenCreators[tokenId];
    }

    /**
     * @dev Get current token supply
     * @return Current number of tokens minted
     */
    function totalSupply() public view returns (uint256) {
        return _currentTokenId;
    }

    /**
     * @dev Check if tokens are still available for minting
     * @return Boolean indicating if more tokens can be minted
     */
    function isAvailableForMinting() public view returns (bool) {
        return _currentTokenId < maxSupply;
    }

    /**
     * @dev Get remaining mintable tokens
     * @return Number of tokens that can still be minted
     */
    function remainingSupply() public view returns (uint256) {
        if (_currentTokenId >= maxSupply) {
            return 0;
        }
        return maxSupply - _currentTokenId;
    }

    // Admin functions

    /**
     * @dev Authorize or unauthorize an address to mint for free
     * @param minter Address to authorize/unauthorize
     * @param authorized Whether the address should be authorized
     */
    function setMinterAuthorization(address minter, bool authorized) public onlyOwner {
        authorizedMinters[minter] = authorized;
        emit MinterAuthorized(minter, authorized);
    }

    /**
     * @dev Update the mint price
     * @param newPrice New price in wei
     */
    function setMintPrice(uint256 newPrice) public onlyOwner {
        uint256 oldPrice = mintPrice;
        mintPrice = newPrice;
        emit MintPriceUpdated(oldPrice, newPrice);
    }

    /**
     * @dev Update the maximum supply
     * @param newMaxSupply New maximum supply
     */
    function setMaxSupply(uint256 newMaxSupply) public onlyOwner {
        require(newMaxSupply >= totalSupply(), "New max supply must be greater than current supply");
        uint256 oldSupply = maxSupply;
        maxSupply = newMaxSupply;
        emit MaxSupplyUpdated(oldSupply, newMaxSupply);
    }

    /**
     * @dev Set base URI for tokens
     * @param baseURI New base URI
     */
    function setBaseURI(string memory baseURI) public onlyOwner {
        _baseTokenURI = baseURI;
    }

    /**
     * @dev Withdraw contract balance to owner
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    // Override functions required by Solidity

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
}