import { useState } from 'react';
import { BlockfrostProvider, MeshTxBuilder } from '@meshsdk/core';
import { MeshHelloWorldContract } from '@meshsdk/contract';
import { useWallet, CardanoWallet } from '@meshsdk/react';
import type { NextPage } from 'next';

const HelloPage: NextPage = () => {
  const { connected, wallet } = useWallet();
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('5000000');
  const [unlockTxHash, setUnlockTxHash] = useState<string>('');

  async function lockAsset() {
    if (wallet) {
      setLoading(true);
      const provider = new BlockfrostProvider(process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY_PREPROD!);
      const meshTxBuilder = new MeshTxBuilder({
        fetcher: provider,
        submitter: provider,
      });

      const contract = new MeshHelloWorldContract({
        mesh: meshTxBuilder,
        fetcher: provider,
        wallet: wallet,
        networkId: 0,
      });

      const assets = [
        {
          unit: 'lovelace',
          quantity: amount,
        },
      ];

      try {
        const tx = await contract.lockAsset(assets);
        const signedTx = await wallet.signTx(tx);
        const txHash = await wallet.submitTx(signedTx);
        setTxHash(txHash);
        setSuccess(true);
      } catch (error) {
        console.error('Locking asset failed', error);
      }
      setLoading(false);
    }
  }

  async function unlockAsset() {
    if (wallet) {
      setLoading(true);
      setSuccess(false);
      setTxHash(null);
      
      const provider = new BlockfrostProvider(process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY_PREPROD!);
      const meshTxBuilder = new MeshTxBuilder({
        fetcher: provider,
        submitter: provider,
      });

      const contract = new MeshHelloWorldContract({
        mesh: meshTxBuilder,
        fetcher: provider,
        wallet: wallet,
        networkId: 0,
      });

      try {
        // Validate transaction hash format
        if (!unlockTxHash || unlockTxHash.length !== 64) {
          alert('Invalid transaction hash. Please enter a valid 64-character transaction hash.');
          setLoading(false);
          return;
        }
        
        console.log('Looking for UTXO with tx hash:', unlockTxHash);
        const utxo = await contract.getUtxoByTxHash(unlockTxHash);
        
        if (utxo) {
          console.log('Found UTXO:', utxo);
          console.log('Building unlock transaction...');
          
          const tx = await contract.unlockAsset(utxo, 'Hello, World!');
          console.log('Transaction built successfully. Requesting wallet signature...');
          
          // Get current wallet address to verify we're using the same wallet
          const walletAddress = await wallet.getChangeAddress();
          console.log('Current wallet address:', walletAddress);
          
          const signedTx = await wallet.signTx(tx, true); // partial sign = true
          const txHash = await wallet.submitTx(signedTx);
          setTxHash(txHash);
          setSuccess(true);
          console.log('Transaction submitted successfully:', txHash);
        } else {
          console.error('UTXO not found for transaction hash:', unlockTxHash);
          alert('UTXO not found. Please check the transaction hash.');
        }
      } catch (error) {
        console.error('Unlocking asset failed:', error);
        if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string' && (error as any).message?.includes('canOnlySignPartially')) {
          alert('Error: You must use the same wallet that locked the funds to unlock them. Please make sure you are connected with the correct wallet and account.');
        } else {
          alert(`Unlock failed: ${(typeof error === 'object' && error !== null && 'message' in error) ? (error as any).message : error}`);
        }
      }
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-900 w-full text-white text-center min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-10">Hello World Smart Contract</h1>
      <div className="mb-10">
        <CardanoWallet />
      </div>
      {connected && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-gray-800 p-8 rounded-xl">
            <h2 className="text-2xl font-bold mb-4">Lock Assets</h2>
            <input
              type="text"
              className="bg-gray-700 text-white p-2 rounded w-full mb-4"
              placeholder="Amount in Lovelace"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <button
              className="bg-sky-600 text-white py-2 px-4 rounded-lg hover:bg-sky-700 transition"
              onClick={lockAsset}
              disabled={loading}
            >
              {loading ? 'Locking...' : 'Lock Asset'}
            </button>
          </div>
          <div className="bg-gray-800 p-8 rounded-xl">
            <h2 className="text-2xl font-bold mb-4">Unlock Assets</h2>
            <input
              type="text"
              className="bg-gray-700 text-white p-2 rounded w-full mb-4"
              placeholder="Transaction Hash of Locked Asset"
              value={unlockTxHash}
              onChange={(e) => setUnlockTxHash(e.target.value)}
            />
            <button
              className="bg-sky-600 text-white py-2 px-4 rounded-lg hover:bg-sky-700 transition"
              onClick={unlockAsset}
              disabled={loading}
            >
              {loading ? 'Unlocking...' : 'Unlock Asset'}
            </button>
          </div>
        </div>
      )}
      {success && txHash && (
        <div className="mt-10 text-lg">
          <p>Transaction successful!</p>
          <p>
            Transaction Hash: <a href={`https://preprod.cardanoscan.io/transaction/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">{txHash}</a>
          </p>
        </div>
      )}
    </div>
  );
};

export default HelloPage;
