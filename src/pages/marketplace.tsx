import { useState, useEffect } from 'react';
import { BlockfrostProvider, MeshTxBuilder } from '@meshsdk/core';
import { useWallet, CardanoWallet } from '@meshsdk/react';
import type { NextPage } from 'next';
import Link from 'next/link';

interface NFTListing {
  id: string;
  name: string;
  description: string;
  image: string;
  price: string;
  seller: string;
  txHash?: string;
}

const MarketplacePage: NextPage = () => {
  const { connected, wallet } = useWallet();
  const [loading, setLoading] = useState<boolean>(false);
  const [listings, setListings] = useState<NFTListing[]>([]);
  const [userAssets, setUserAssets] = useState<any[]>([]);

  // Mock NFT listings for demonstration
  const mockListings: NFTListing[] = [
    {
      id: '1',
      name: 'Cardano Cat #001',
      description: 'A rare digital cat on Cardano',
      image: '🐱',
      price: '50000000', // 50 ADA in lovelace
      seller: 'addr_test1...',
    },
    {
      id: '2', 
      name: 'Space Monkey #042',
      description: 'An astronaut monkey NFT',
      image: '🐵',
      price: '25000000', // 25 ADA
      seller: 'addr_test1...',
    },
    {
      id: '3',
      name: 'Digital Rose #007',
      description: 'A beautiful digital flower',
      image: '🌹',
      price: '15000000', // 15 ADA
      seller: 'addr_test1...',
    }
  ];

  useEffect(() => {
    setListings(mockListings);
  }, []);

  async function loadUserAssets() {
    if (wallet) {
      setLoading(true);
      try {
        const assets = await wallet.getAssets();
        setUserAssets(assets);
        console.log('User assets:', assets);
      } catch (error) {
        console.error('Failed to load assets:', error);
      }
      setLoading(false);
    }
  }

  async function buyNFT(listing: NFTListing) {
    if (!wallet) return;
    
    setLoading(true);
    try {
      const provider = new BlockfrostProvider(process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY_PREPROD!);
      const meshTxBuilder = new MeshTxBuilder({
        fetcher: provider,
        submitter: provider,
      });

      // In a real marketplace, you'd:
      // 1. Create a transaction that sends ADA to the seller
      // 2. Include the NFT transfer to the buyer
      // 3. Interact with the marketplace smart contract
      
      console.log(`Attempting to buy ${listing.name} for ${parseInt(listing.price) / 1000000} ADA`);
      
      // For demo purposes, we'll just show the concept
      alert(`🎉 Successfully bought ${listing.name}!\n\nIn a real implementation, this would:\n1. Send ${parseInt(listing.price) / 1000000} ADA to seller\n2. Transfer NFT to your wallet\n3. Update marketplace contract`);
      
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Check console for details.');
    }
    setLoading(false);
  }

  async function createListing() {
    if (!wallet) return;
    
    const nftName = prompt('Enter NFT name:');
    const price = prompt('Enter price in ADA:');
    
    if (nftName && price) {
      // In real implementation, this would:
      // 1. Create a marketplace contract transaction
      // 2. Lock the NFT in the contract with price datum
      // 3. Update the listings
      
      console.log(`Creating listing for ${nftName} at ${price} ADA`);
      alert(`📝 Listing created!\n\nIn a real implementation:\n1. Your NFT would be locked in marketplace contract\n2. Price datum would be set to ${price} ADA\n3. Listing would appear for other users`);
    }
  }

  const formatPrice = (lovelace: string) => {
    return (parseInt(lovelace) / 1000000).toFixed(2);
  };

  return (
    <div className="bg-gray-900 w-full text-white min-h-screen p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">🏪 NFT Marketplace</h1>
            <p className="text-gray-400">Buy, sell, and trade NFTs on Cardano</p>
          </div>
          <Link href="/" className="bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition">
            ← Back to Home
          </Link>
        </div>

        {/* Wallet Connection */}
        <div className="bg-gray-800 p-6 rounded-xl mb-8">
          <h2 className="text-xl font-bold mb-4">Connect Your Wallet</h2>
          <CardanoWallet />
          
          {connected && (
            <div className="mt-4 flex gap-4">
              <button
                onClick={loadUserAssets}
                disabled={loading}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
              >
                {loading ? 'Loading...' : 'Load My Assets'}
              </button>
              
              <button
                onClick={createListing}
                className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
              >
                📝 Create Listing
              </button>
            </div>
          )}
        </div>

        {/* User Assets */}
        {connected && userAssets.length > 0 && (
          <div className="bg-gray-800 p-6 rounded-xl mb-8">
            <h2 className="text-xl font-bold mb-4">Your Assets</h2>
            <div className="bg-gray-700 p-4 rounded-lg max-h-40 overflow-y-auto">
              <pre className="text-sm text-green-400">
                {JSON.stringify(userAssets, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Marketplace Listings */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">🛒 Available NFTs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div key={listing.id} className="bg-gray-800 p-6 rounded-xl">
                <div className="text-6xl mb-4 text-center">{listing.image}</div>
                <h3 className="text-xl font-bold mb-2">{listing.name}</h3>
                <p className="text-gray-400 mb-4">{listing.description}</p>
                
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-gray-400">Price</p>
                    <p className="text-lg font-bold text-green-400">
                      {formatPrice(listing.price)} ADA
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Seller</p>
                    <p className="text-xs text-blue-400">
                      {listing.seller.substring(0, 12)}...
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => buyNFT(listing)}
                  disabled={!connected || loading}
                  className="w-full bg-sky-600 text-white py-2 px-4 rounded-lg hover:bg-sky-700 transition disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  {!connected ? 'Connect Wallet to Buy' : loading ? 'Processing...' : '🛒 Buy Now'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gray-800 p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-4">🔧 How This Marketplace Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-green-400 mb-2">🔒 Smart Contract (Aiken)</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Stores NFT listings with price data</li>
                <li>• Validates buy/sell transactions</li>
                <li>• Ensures secure NFT transfers</li>
                <li>• Handles payment verification</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-blue-400 mb-2">⚡ Frontend (Mesh SDK)</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Connects to Cardano wallets</li>
                <li>• Builds buy/sell transactions</li>
                <li>• Interacts with smart contracts</li>
                <li>• Displays NFT metadata</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-purple-400 mb-2">🌐 Blockchain (Blockfrost)</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Queries NFT ownership data</li>
                <li>• Submits transactions to network</li>
                <li>• Fetches marketplace listings</li>
                <li>• Provides real-time updates</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-yellow-400 mb-2">👛 Wallets</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• User authentication & identity</li>
                <li>• Signs transactions securely</li>
                <li>• Manages user's NFTs & ADA</li>
                <li>• Provides spending authorization</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
