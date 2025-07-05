import { useState, useEffect } from 'react';
import { BlockfrostProvider, MeshTxBuilder, resolvePaymentKeyHash } from '@meshsdk/core';
import { useWallet, CardanoWallet } from '@meshsdk/react';
import type { NextPage } from 'next';
import Link from 'next/link';

interface Proposal {
  id: string;
  title: string;
  description: string;
  acceptVotes: number;
  rejectVotes: number;
  deadline: Date;
  creator: string;
  isActive: boolean;
  hasVoted: boolean;
  userVote?: 'accept' | 'reject';
  txHash?: string;
}

const VotingPage: NextPage = () => {
  const { connected, wallet } = useWallet();
  const [loading, setLoading] = useState<boolean>(false);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [walletAddress, setWalletAddress] = useState<string>('');

  // Mock proposals for demonstration
  const mockProposals: Proposal[] = [
    {
      id: '1',
      title: 'Increase Block Size Limit',
      description: 'Proposal to increase the maximum block size from 90KB to 100KB to improve transaction throughput.',
      acceptVotes: 1247,
      rejectVotes: 856,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      creator: 'addr_test1qq9kpw...',
      isActive: true,
      hasVoted: false,
    },
    {
      id: '2', 
      title: 'Reduce Transaction Fees',
      description: 'Proposal to reduce minimum transaction fees by 20% to make Cardano more accessible for small transactions.',
      acceptVotes: 2156,
      rejectVotes: 432,
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      creator: 'addr_test1qp8kpw...',
      isActive: true,
      hasVoted: false,
    },
    {
      id: '3',
      title: 'Fund Community Project',
      description: 'Allocate 50,000 ADA from treasury to fund the development of a new community education platform.',
      acceptVotes: 3421,
      rejectVotes: 1876,
      deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (expired)
      creator: 'addr_test1qr8kpw...',
      isActive: false,
      hasVoted: true,
      userVote: 'accept',
    }
  ];

  useEffect(() => {
    setProposals(mockProposals);
    if (connected && wallet) {
      loadWalletInfo();
    }
  }, [connected, wallet]);

  async function loadWalletInfo() {
    if (wallet) {
      try {
        const address = await wallet.getChangeAddress();
        setWalletAddress(address);
        console.log('Wallet address:', address);
      } catch (error) {
        console.error('Failed to get wallet address:', error);
      }
    }
  }

  async function castVote(proposalId: string, voteChoice: 'accept' | 'reject') {
    if (!wallet) return;
    
    setLoading(true);
    try {
      const provider = new BlockfrostProvider(process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY_PREPROD!);
      const meshTxBuilder = new MeshTxBuilder({
        fetcher: provider,
        submitter: provider,
      });

      // Get wallet information
      const walletAddress = await wallet.getChangeAddress();
      const utxos = await wallet.getUtxos();
      
      if (utxos.length === 0) {
        alert('No UTXOs found. Make sure your wallet has some test ADA.');
        setLoading(false);
        return;
      }

      // In a real implementation, this would:
      // 1. Find the voting contract UTXO for this proposal
      // 2. Create a transaction that:
      //    - Spends the current voting UTXO
      //    - Creates a new UTXO with updated vote counts
      //    - Includes the voter's signature
      //    - Sends minimum ADA as anti-spam measure
      
      console.log(`Casting ${voteChoice} vote for proposal ${proposalId}`);
      console.log('Voter address:', walletAddress);
      
      // Simulate transaction building
      const simulatedTx = {
        inputs: utxos.slice(0, 1), // Use first UTXO
        outputs: [
          {
            address: walletAddress, // Change back to voter
            amount: [{ unit: 'lovelace', quantity: '1000000' }] // 1 ADA change
          }
        ],
        metadata: {
          vote: {
            proposalId,
            choice: voteChoice,
            voter: walletAddress,
            timestamp: Date.now()
          }
        }
      };

      // For demo purposes, simulate the voting process
      console.log('Simulated transaction:', simulatedTx);
      
      // Update local state to reflect the vote
      setProposals(prev => prev.map(proposal => {
        if (proposal.id === proposalId) {
          return {
            ...proposal,
            acceptVotes: voteChoice === 'accept' ? proposal.acceptVotes + 1 : proposal.acceptVotes,
            rejectVotes: voteChoice === 'reject' ? proposal.rejectVotes + 1 : proposal.rejectVotes,
            hasVoted: true,
            userVote: voteChoice,
            txHash: 'demo_vote_tx_' + Date.now()
          };
        }
        return proposal;
      }));

      alert(`🗳️ Vote cast successfully!\n\nVote: ${voteChoice.toUpperCase()}\nProposal: ${proposals.find(p => p.id === proposalId)?.title}\n\n✨ In a real implementation:\n• Your vote would be recorded on-chain\n• Vote counts updated in smart contract\n• Transaction would be permanent & verifiable`);

    } catch (error) {
      console.error('Voting failed:', error);
      alert('Voting failed. Check console for details.');
    }
    setLoading(false);
  }

  async function createProposal() {
    if (!wallet) return;
    
    const title = prompt('Enter proposal title:');
    const description = prompt('Enter proposal description:');
    const daysToVote = prompt('Enter voting period (days):');
    
    if (title && description && daysToVote) {
      const days = parseInt(daysToVote);
      if (isNaN(days) || days < 1) {
        alert('Invalid voting period. Please enter a number of days.');
        return;
      }

      // In real implementation, this would:
      // 1. Create a new voting contract UTXO
      // 2. Set initial vote counts to 0
      // 3. Set voting deadline
      // 4. Lock some ADA as collateral
      
      const newProposal: Proposal = {
        id: (proposals.length + 1).toString(),
        title,
        description,
        acceptVotes: 0,
        rejectVotes: 0,
        deadline: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
        creator: walletAddress,
        isActive: true,
        hasVoted: false,
      };

      setProposals(prev => [...prev, newProposal]);
      
      console.log('Creating proposal:', newProposal);
      alert(`📝 Proposal created successfully!\n\nTitle: ${title}\nVoting Period: ${days} days\n\n✨ In a real implementation:\n• Proposal would be stored on-chain\n• Smart contract would be initialized\n• Other users could discover and vote`);
    }
  }

  const formatTimeRemaining = (deadline: Date) => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    
    if (diff <= 0) return 'Voting ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} days, ${hours} hours left`;
    return `${hours} hours left`;
  };

  const getVotePercentage = (votes: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  return (
    <div className="bg-gray-900 w-full text-white min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">🗳️ Cardano Voting System</h1>
            <p className="text-gray-400">Decentralized governance and community voting</p>
          </div>
          <Link href="/" className="bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition">
            ← Back to Home
          </Link>
        </div>

        {/* Wallet Connection */}
        <div className="bg-gray-800 p-6 rounded-xl mb-8">
          <h2 className="text-xl font-bold mb-4">Connect Your Wallet to Vote</h2>
          <CardanoWallet />
          
          {connected && (
            <div className="mt-4 flex gap-4">
              <button
                onClick={createProposal}
                className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
              >
                📝 Create Proposal
              </button>
              
              <div className="text-sm text-gray-400 py-2">
                Connected: {walletAddress.substring(0, 20)}...
              </div>
            </div>
          )}
        </div>

        {/* Active Proposals */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">📊 Active Proposals</h2>
          <div className="space-y-6">
            {proposals.filter(p => p.isActive).map((proposal) => {
              const totalVotes = proposal.acceptVotes + proposal.rejectVotes;
              const acceptPercent = getVotePercentage(proposal.acceptVotes, totalVotes);
              const rejectPercent = getVotePercentage(proposal.rejectVotes, totalVotes);
              
              return (
                <div key={proposal.id} className="bg-gray-800 p-6 rounded-xl">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-2">{proposal.title}</h3>
                      <p className="text-gray-400 mb-4">{proposal.description}</p>
                    </div>
                    <div className="text-right text-sm text-gray-400">
                      <p>Proposal #{proposal.id}</p>
                      <p>{formatTimeRemaining(proposal.deadline)}</p>
                    </div>
                  </div>
                  
                  {/* Voting Results */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-green-400 font-medium">✅ Accept: {proposal.acceptVotes} ({acceptPercent}%)</span>
                      <span className="text-red-400 font-medium">❌ Reject: {proposal.rejectVotes} ({rejectPercent}%)</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div className="flex h-3 rounded-full overflow-hidden">
                        <div 
                          className="bg-green-500" 
                          style={{ width: `${acceptPercent}%` }}
                        ></div>
                        <div 
                          className="bg-red-500" 
                          style={{ width: `${rejectPercent}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="text-center text-sm text-gray-400 mt-2">
                      Total Votes: {totalVotes}
                    </div>
                  </div>
                  
                  {/* Voting Buttons */}
                  {proposal.hasVoted ? (
                    <div className="text-center">
                      <p className="text-yellow-400 mb-2">
                        ✓ You voted: <strong>{proposal.userVote?.toUpperCase()}</strong>
                      </p>
                      {proposal.txHash && (
                        <p className="text-xs text-blue-400">
                          Tx: {proposal.txHash}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <button
                        onClick={() => castVote(proposal.id, 'accept')}
                        disabled={!connected || loading}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition disabled:bg-gray-600 disabled:cursor-not-allowed"
                      >
                        {loading ? '⏳ Voting...' : '✅ Vote Accept'}
                      </button>
                      
                      <button
                        onClick={() => castVote(proposal.id, 'reject')}
                        disabled={!connected || loading}
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition disabled:bg-gray-600 disabled:cursor-not-allowed"
                      >
                        {loading ? '⏳ Voting...' : '❌ Vote Reject'}
                      </button>
                    </div>
                  )}
                  
                  {!connected && (
                    <p className="text-center text-gray-400 text-sm mt-4">
                      Connect your wallet to vote
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Completed Proposals */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">📈 Completed Proposals</h2>
          <div className="space-y-4">
            {proposals.filter(p => !p.isActive).map((proposal) => {
              const totalVotes = proposal.acceptVotes + proposal.rejectVotes;
              const acceptPercent = getVotePercentage(proposal.acceptVotes, totalVotes);
              const rejectPercent = getVotePercentage(proposal.rejectVotes, totalVotes);
              const passed = proposal.acceptVotes > proposal.rejectVotes;
              
              return (
                <div key={proposal.id} className="bg-gray-800 p-4 rounded-xl border-l-4 border-gray-600">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold mb-1">{proposal.title}</h3>
                      <p className="text-sm text-gray-400">{proposal.description}</p>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${passed ? 'text-green-400' : 'text-red-400'}`}>
                        {passed ? '✅ PASSED' : '❌ REJECTED'}
                      </div>
                      <div className="text-sm text-gray-400">
                        {proposal.acceptVotes} accept / {proposal.rejectVotes} reject
                      </div>
                      {proposal.hasVoted && (
                        <div className="text-xs text-yellow-400">
                          You voted: {proposal.userVote?.toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* How Voting Works */}
        <div className="bg-gray-800 p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-4">🔧 How Decentralized Voting Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="text-center">
              <div className="text-3xl mb-2">1️⃣</div>
              <h3 className="font-bold text-green-400 mb-2">Smart Contract (Aiken)</h3>
              <p className="text-sm text-gray-300">
                Validates votes, prevents double-voting, enforces deadlines, and counts results
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">2️⃣</div>
              <h3 className="font-bold text-blue-400 mb-2">Frontend (Mesh SDK)</h3>
              <p className="text-sm text-gray-300">
                Connects wallets, builds voting transactions, displays proposals and results
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">3️⃣</div>
              <h3 className="font-bold text-purple-400 mb-2">Blockchain (Blockfrost)</h3>
              <p className="text-sm text-gray-300">
                Fetches current vote counts, submits new votes, queries proposal history
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">4️⃣</div>
              <h3 className="font-bold text-yellow-400 mb-2">Wallets</h3>
              <p className="text-sm text-gray-300">
                Authenticate voters, sign vote transactions, provide unique identity proof
              </p>
            </div>

          </div>
          
          <div className="mt-6 bg-gray-700 p-4 rounded-lg">
            <h3 className="font-bold mb-2">🔒 Security Features:</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• <strong>Anti-spam:</strong> Minimum ADA required to vote</li>
              <li>• <strong>One vote per wallet:</strong> Smart contract prevents double voting</li>
              <li>• <strong>Time-locked:</strong> Voting automatically ends at deadline</li>
              <li>• <strong>Transparent:</strong> All votes are publicly verifiable on-chain</li>
              <li>• <strong>Immutable:</strong> Once cast, votes cannot be changed or deleted</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VotingPage;
