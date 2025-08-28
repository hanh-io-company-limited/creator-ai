// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * Creator AI Multi-Chain NFT Contract
 * 
 * Copyright (C) 2024 Hanh IO Company Limited. All Rights Reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 */
contract CreatorAINFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
    
    // Mapping from token ID to creator
    mapping(uint256 => address) public tokenCreators;
    
    // Events
    event NFTMinted(address indexed creator, uint256 indexed tokenId, string tokenURI);
    
    constructor() ERC721("Creator AI NFT", "CAINFT") {}

    /**
     * @dev Mint a new NFT
     * @param to Address to mint the NFT to
     * @param uri Metadata URI for the NFT
     */
    function mint(address to, string memory uri) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _mint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        tokenCreators[tokenId] = msg.sender;
        
        emit NFTMinted(msg.sender, tokenId, uri);
        
        return tokenId;
    }
    
    /**
     * @dev Batch mint multiple NFTs
     * @param to Address to mint the NFTs to
     * @param uris Array of metadata URIs
     */
    function batchMint(address to, string[] memory uris) public returns (uint256[] memory) {
        uint256[] memory tokenIds = new uint256[](uris.length);
        
        for (uint i = 0; i < uris.length; i++) {
            tokenIds[i] = mint(to, uris[i]);
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Get the creator of a token
     * @param tokenId Token ID to query
     */
    function getCreator(uint256 tokenId) public view returns (address) {
        require(_exists(tokenId), "Token does not exist");
        return tokenCreators[tokenId];
    }
    
    /**
     * @dev Get the total number of tokens minted
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    // Required overrides
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}