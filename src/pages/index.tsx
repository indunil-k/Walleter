import { useState } from "react";
import type { NextPage } from "next";
import { useWallet } from '@meshsdk/react';
import { CardanoWallet } from '@meshsdk/react';
import Link from 'next/link';

const Home: NextPage = () => {
  const { connected, wallet } = useWallet();
  const [assets, setAssets] = useState<null | any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  async function getAssets() {
    if (wallet) {
      setLoading(true);
      const _assets = await wallet.getAssets();
      setAssets(_assets);
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-900 w-full text-white min-h-screen">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-sky-400">Walleter</span> Learning Hub
          </h1>
          <p className="text-xl text-gray-400">
            Learn Cardano development with hands-on examples
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="bg-gray-800 p-6 rounded-xl mb-8 text-center">
          <h2 className="text-2xl font-bold mb-4">🔗 Connect Your Wallet</h2>
          <CardanoWallet />
        </div>

        {/* Learning Projects */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Hello World Smart Contract */}
          <Link href="/hello" className="bg-gray-800 hover:bg-gray-700 p-6 rounded-xl transition group">
            <div className="text-4xl mb-4">👋</div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-sky-400">Hello World Contract</h3>
            <p className="text-gray-400 text-sm mb-4">
              Learn smart contract basics: lock and unlock ADA with conditions
            </p>
            <div className="text-xs text-green-400">
              ✓ Aiken smart contract • ✓ Mesh SDK • ✓ Wallet integration
            </div>
          </Link>

          {/* NFT Marketplace */}
          <Link href="/marketplace" className="bg-gray-800 hover:bg-gray-700 p-6 rounded-xl transition group">
            <div className="text-4xl mb-4">🏪</div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-sky-400">NFT Marketplace</h3>
            <p className="text-gray-400 text-sm mb-4">
              Advanced project: buy, sell, and trade NFTs with smart contracts
            </p>
            <div className="text-xs text-blue-400">
              ✓ Complex contracts • ✓ NFT handling • ✓ Payment validation
            </div>
          </Link>

          {/* NFT Minting */}
          <Link href="/mint" className="bg-gray-800 hover:bg-gray-700 p-6 rounded-xl transition group">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-sky-400">Mint NFTs</h3>
            <p className="text-gray-400 text-sm mb-4">
              Create unique digital assets on Cardano with metadata
            </p>
            <div className="text-xs text-purple-400">
              ✓ NFT creation • ✓ Metadata standards • ✓ Token policies
            </div>
          </Link>

        </div>

        {/* Current Wallet Assets */}
        {connected && (
          <div className="bg-gray-800 p-6 rounded-xl mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">💰 Your Wallet Assets</h2>
              <button
                onClick={() => getAssets()}
                disabled={loading}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-600"
              >
                {loading ? '⏳ Loading...' : '🔄 Refresh'}
              </button>
            </div>
            
            {assets ? (
              <div className="bg-gray-700 p-4 rounded-lg max-h-60 overflow-y-auto">
                <pre className="text-sm text-green-400">
                  {JSON.stringify(assets, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="text-gray-400">Click "Refresh" to load your assets</p>
            )}
          </div>
        )}

        {/* Technology Stack Overview */}
        <div className="bg-gray-800 p-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-6 text-center">🛠️ Technology Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-bold text-orange-400 mb-2">Aiken</h3>
              <p className="text-sm text-gray-300">
                Modern smart contract language for Cardano. Write secure, efficient validators.
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-3">🔗</div>
              <h3 className="font-bold text-blue-400 mb-2">Mesh SDK</h3>
              <p className="text-sm text-gray-300">
                JavaScript/TypeScript SDK for building Cardano dApps and managing transactions.
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-3">🌐</div>
              <h3 className="font-bold text-green-400 mb-2">Blockfrost</h3>
              <p className="text-sm text-gray-300">
                API service to interact with Cardano blockchain without running your own node.
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-3">👛</div>
              <h3 className="font-bold text-purple-400 mb-2">Wallets</h3>
              <p className="text-sm text-gray-300">
                Connect with Nami, Eternl, and other Cardano wallets for user authentication.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;