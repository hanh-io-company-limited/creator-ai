import React, { useState } from 'react';
import { ethers } from 'ethers';
import './App.css';
import './global.d.ts';

// Contract ABI - This will be updated when contract is compiled
const CONTRACT_ABI = [
  "function mint(address to, string memory tokenURI) public payable",
  "function batchMint(address to, string[] memory tokenURIs) public payable",
  "function totalSupply() public view returns (uint256)",
  "function maxSupply() public view returns (uint256)",
  "function mintPrice() public view returns (uint256)",
  "function remainingSupply() public view returns (uint256)",
  "function isAvailableForMinting() public view returns (bool)",
  "function name() public view returns (string)",
  "function symbol() public view returns (string)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string)"
];

// Contract address - will be updated after deployment
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || "";

interface ContractInfo {
  name: string;
  symbol: string;
  totalSupply: number;
  maxSupply: number;
  mintPrice: string;
  remainingSupply: number;
  isAvailable: boolean;
}

function App() {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [account, setAccount] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [contractInfo, setContractInfo] = useState<ContractInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Minting state
  const [tokenURI, setTokenURI] = useState('');
  const [batchURIs, setBatchURIs] = useState<string[]>(['']);
  const [userBalance, setUserBalance] = useState(0);

  // Connect to MetaMask
  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        await web3Provider.send("eth_requestAccounts", []);
        const web3Signer = web3Provider.getSigner();
        const address = await web3Signer.getAddress();
        
        setProvider(web3Provider);
        setSigner(web3Signer);
        setAccount(address);
        setIsConnected(true);

        if (CONTRACT_ADDRESS) {
          const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, web3Signer);
          setContract(contractInstance);
          await loadContractInfo(contractInstance);
          await loadUserBalance(contractInstance, address);
        }
      } else {
        alert('Please install MetaMask to use this application');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Error connecting wallet. Please try again.');
    }
  };

  // Load contract information
  const loadContractInfo = async (contractInstance: ethers.Contract) => {
    try {
      const [name, symbol, totalSupply, maxSupply, mintPrice, remainingSupply, isAvailable] = await Promise.all([
        contractInstance.name(),
        contractInstance.symbol(),
        contractInstance.totalSupply(),
        contractInstance.maxSupply(),
        contractInstance.mintPrice(),
        contractInstance.remainingSupply(),
        contractInstance.isAvailableForMinting()
      ]);

      setContractInfo({
        name,
        symbol,
        totalSupply: totalSupply.toNumber(),
        maxSupply: maxSupply.toNumber(),
        mintPrice: ethers.utils.formatEther(mintPrice),
        remainingSupply: remainingSupply.toNumber(),
        isAvailable
      });
    } catch (error) {
      console.error('Error loading contract info:', error);
    }
  };

  // Load user's NFT balance
  const loadUserBalance = async (contractInstance: ethers.Contract, address: string) => {
    try {
      const balance = await contractInstance.balanceOf(address);
      setUserBalance(balance.toNumber());
    } catch (error) {
      console.error('Error loading user balance:', error);
    }
  };

  // Mint single NFT
  const mintNFT = async () => {
    if (!contract || !tokenURI.trim()) {
      alert('Please enter a valid token URI');
      return;
    }

    setIsLoading(true);
    try {
      const mintPrice = contractInfo?.mintPrice || '0';
      const value = ethers.utils.parseEther(mintPrice);
      
      const tx = await contract.mint(account, tokenURI, { value });
      await tx.wait();
      
      alert('NFT minted successfully!');
      setTokenURI('');
      
      // Refresh contract info and user balance
      await loadContractInfo(contract);
      await loadUserBalance(contract, account);
    } catch (error: any) {
      console.error('Error minting NFT:', error);
      alert(`Error minting NFT: ${error.message}`);
    }
    setIsLoading(false);
  };

  // Batch mint NFTs
  const batchMintNFTs = async () => {
    if (!contract || batchURIs.some(uri => !uri.trim())) {
      alert('Please enter valid token URIs for all NFTs');
      return;
    }

    setIsLoading(true);
    try {
      const mintPrice = contractInfo?.mintPrice || '0';
      const totalValue = ethers.utils.parseEther((parseFloat(mintPrice) * batchURIs.length).toString());
      
      const tx = await contract.batchMint(account, batchURIs, { value: totalValue });
      await tx.wait();
      
      alert(`${batchURIs.length} NFTs minted successfully!`);
      setBatchURIs(['']);
      
      // Refresh contract info and user balance
      await loadContractInfo(contract);
      await loadUserBalance(contract, account);
    } catch (error: any) {
      console.error('Error batch minting NFTs:', error);
      alert(`Error batch minting NFTs: ${error.message}`);
    }
    setIsLoading(false);
  };

  // Add more URI inputs for batch minting
  const addBatchURI = () => {
    setBatchURIs([...batchURIs, '']);
  };

  // Remove URI input from batch minting
  const removeBatchURI = (index: number) => {
    const newURIs = batchURIs.filter((_, i) => i !== index);
    setBatchURIs(newURIs.length > 0 ? newURIs : ['']);
  };

  // Update batch URI
  const updateBatchURI = (index: number, value: string) => {
    const newURIs = [...batchURIs];
    newURIs[index] = value;
    setBatchURIs(newURIs);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎨 CreatorAI NFT Minting Platform</h1>
        <p>Mint your AI-generated content as NFTs on the blockchain</p>
        
        {!isConnected ? (
          <div className="connect-section">
            <button onClick={connectWallet} className="connect-button">
              Connect Wallet
            </button>
            <p>Connect your MetaMask wallet to start minting NFTs</p>
          </div>
        ) : (
          <div className="connected-section">
            <div className="account-info">
              <p><strong>Connected Account:</strong> {account.slice(0, 6)}...{account.slice(-4)}</p>
              <p><strong>Your NFTs:</strong> {userBalance}</p>
            </div>

            {contractInfo ? (
              <div className="contract-info">
                <h2>📊 Collection Information</h2>
                <div className="info-grid">
                  <div className="info-item">
                    <span>Name:</span>
                    <span>{contractInfo.name}</span>
                  </div>
                  <div className="info-item">
                    <span>Symbol:</span>
                    <span>{contractInfo.symbol}</span>
                  </div>
                  <div className="info-item">
                    <span>Total Supply:</span>
                    <span>{contractInfo.totalSupply} / {contractInfo.maxSupply}</span>
                  </div>
                  <div className="info-item">
                    <span>Remaining:</span>
                    <span>{contractInfo.remainingSupply}</span>
                  </div>
                  <div className="info-item">
                    <span>Mint Price:</span>
                    <span>{contractInfo.mintPrice} ETH</span>
                  </div>
                  <div className="info-item">
                    <span>Available:</span>
                    <span className={contractInfo.isAvailable ? 'available' : 'unavailable'}>
                      {contractInfo.isAvailable ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                </div>
              </div>
            ) : CONTRACT_ADDRESS ? (
              <p>Loading contract information...</p>
            ) : (
              <div className="no-contract">
                <h2>⚠️ Contract Not Deployed</h2>
                <p>The NFT contract has not been deployed yet. Please deploy the contract first.</p>
                <p>Run: <code>npm run deploy:local</code> to deploy to local network</p>
              </div>
            )}

            {contractInfo?.isAvailable && (
              <div className="minting-section">
                <div className="mint-single">
                  <h3>🎯 Mint Single NFT</h3>
                  <div className="mint-form">
                    <input
                      type="text"
                      placeholder="Enter token URI (e.g., https://yourdomain.com/metadata/1.json)"
                      value={tokenURI}
                      onChange={(e) => setTokenURI(e.target.value)}
                      className="uri-input"
                    />
                    <button 
                      onClick={mintNFT} 
                      disabled={isLoading || !tokenURI.trim()}
                      className="mint-button"
                    >
                      {isLoading ? 'Minting...' : `Mint NFT (${contractInfo.mintPrice} ETH)`}
                    </button>
                  </div>
                </div>

                <div className="mint-batch">
                  <h3>🚀 Batch Mint NFTs</h3>
                  <div className="batch-form">
                    {batchURIs.map((uri, index) => (
                      <div key={index} className="batch-uri-row">
                        <input
                          type="text"
                          placeholder={`Token URI ${index + 1}`}
                          value={uri}
                          onChange={(e) => updateBatchURI(index, e.target.value)}
                          className="uri-input"
                        />
                        {batchURIs.length > 1 && (
                          <button 
                            onClick={() => removeBatchURI(index)}
                            className="remove-button"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <div className="batch-controls">
                      <button onClick={addBatchURI} className="add-button">
                        + Add Another NFT
                      </button>
                      <button 
                        onClick={batchMintNFTs}
                        disabled={isLoading || batchURIs.some(uri => !uri.trim())}
                        className="mint-button"
                      >
                        {isLoading ? 'Minting...' : `Batch Mint ${batchURIs.length} NFTs (${(parseFloat(contractInfo.mintPrice) * batchURIs.length).toFixed(4)} ETH)`}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
