# 🗳️ Voting DApp - Complete Tool Integration Guide

This document explains how **Aiken**, **Mesh SDK**, **Blockfrost**, and **Wallet Integration** work together to create a decentralized voting system with "accept" and "reject" voting options.

## 🎯 Overview

The Voting DApp demonstrates:
- **Proposal creation** with deadlines and parameters
- **Secure voting** with accept/reject options  
- **Anti-spam protection** via minimum ADA requirements
- **Double-vote prevention** using smart contract validation
- **Real-time results** fetched from the blockchain

## 🔧 Tool Breakdown

### 1. 🏗️ **Aiken Smart Contract** (`contracts/voting.ak`)

**Purpose:** Validates all voting logic and enforces rules on-chain

#### Key Data Structures:
```aiken
pub type Datum {
  proposal_id: ByteArray,          // Unique proposal identifier
  proposal_title: ByteArray,       // Human-readable title
  proposal_description: ByteArray, // Detailed description
  accept_votes: Int,              // Count of "accept" votes
  reject_votes: Int,              // Count of "reject" votes
  min_ada_to_vote: Int,          // Anti-spam: minimum ADA to vote
  voting_deadline: Int,           // POSIX timestamp when voting ends
  creator: Hash<Blake2b_224, VerificationKey>, // Proposal creator
  voters: List<Hash<Blake2b_224, VerificationKey>>, // Who has voted
}

pub type Redeemer {
  action: ByteArray,              // "vote", "tally", or "withdraw"
  vote_choice: ByteArray,         // "accept" or "reject"
  voter: Hash<Blake2b_224, VerificationKey>, // Voter's key hash
}
```

#### Validation Logic:

**For Voting (`action: "vote"`):**
```aiken
// 1. Check voter hasn't already voted
let not_already_voted = !list.has(datum.voters, redeemer.voter)

// 2. Check voting period is still active  
let voting_active = get_current_time(tx) < datum.voting_deadline

// 3. Check transaction is signed by the voter
let signed_by_voter = list.has(tx.extra_signatories, redeemer.voter)

// 4. Check voter sent minimum ADA (anti-spam)
let has_minimum_ada = check_minimum_ada_sent(tx, datum.min_ada_to_vote)

// 5. Check vote choice is valid ("accept" or "reject")
let valid_vote = redeemer.vote_choice == "accept" || redeemer.vote_choice == "reject"

// All conditions must be true for vote to be valid
not_already_voted && voting_active && signed_by_voter && has_minimum_ada && valid_vote
```

**Security Features:**
- ✅ **Double-vote prevention:** Tracks voters in datum
- ✅ **Anti-spam:** Requires minimum ADA to vote
- ✅ **Time-locked:** Enforces voting deadlines
- ✅ **Signature verification:** Only valid wallet owners can vote
- ✅ **Immutable results:** Once recorded, votes cannot be changed

### 2. 🌐 **Mesh SDK Integration** (`src/pages/voting.tsx`)

**Purpose:** Builds transactions, connects wallets, and provides user interface

#### Wallet Connection:
```typescript
import { useWallet, CardanoWallet } from '@meshsdk/react';

const VotingPage = () => {
  const { connected, wallet } = useWallet();
  
  // Wallet connection component
  return <CardanoWallet />;
};
```

#### Transaction Building for Voting:
```typescript
import { MeshTxBuilder, resolvePaymentKeyHash } from '@meshsdk/core';

async function castVote(proposalId: string, voteChoice: 'accept' | 'reject') {
  if (!wallet) return;
  
  try {
    // 1. Get wallet's UTXOs and address
    const utxos = await wallet.getUtxos();
    const walletAddress = await wallet.getChangeAddress();
    
    // 2. Build voting transaction
    const votingTx = {
      inputs: utxos.slice(0, 1), // Use wallet UTXO as input
      outputs: [{
        address: contractAddress,  // Send to voting contract
        amount: [{ unit: 'lovelace', quantity: minAdaToVote }],
        datum: {
          // Updated datum with incremented vote count
          proposal_id: proposalId,
          accept_votes: voteChoice === 'accept' ? oldCount + 1 : oldCount,
          reject_votes: voteChoice === 'reject' ? oldCount + 1 : oldCount,
          voters: [...oldVoters, voterKeyHash], // Add voter to list
          // ... other fields remain the same
        }
      }],
      redeemer: {
        action: "vote",
        vote_choice: voteChoice,
        voter: voterKeyHash
      }
    };
    
    // 3. Sign and submit transaction
    const signedTx = await wallet.signTx(votingTx);
    const txHash = await wallet.submitTx(signedTx);
    
    console.log('Vote cast successfully:', txHash);
  } catch (error) {
    console.error('Voting failed:', error);
  }
}
```

#### UI Components:
```typescript
// Voting buttons for each proposal
{proposal.hasVoted ? (
  <div className="text-center">
    <p className="text-yellow-400">
      ✓ You voted: <strong>{proposal.userVote?.toUpperCase()}</strong>
    </p>
  </div>
) : (
  <div className="flex gap-4">
    <button
      onClick={() => castVote(proposal.id, 'accept')}
      className="bg-green-600 hover:bg-green-700"
    >
      ✅ Vote Accept
    </button>
    <button
      onClick={() => castVote(proposal.id, 'reject')}
      className="bg-red-600 hover:bg-red-700"
    >
      ❌ Vote Reject
    </button>
  </div>
)}
```

### 3. 🔗 **Blockfrost API Integration**

**Purpose:** Queries blockchain data and submits transactions

#### Setup:
```typescript
import { BlockfrostProvider } from '@meshsdk/core';

const provider = new BlockfrostProvider(
  process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY_PREPROD!
);
```

#### Querying Vote Counts:
```typescript
async function getProposalResults(proposalId: string) {
  try {
    // 1. Get current UTXOs at voting contract address
    const utxos = await provider.fetchAddressUTXOs(contractAddress);
    
    // 2. Find UTXO containing our proposal
    const proposalUtxo = utxos.find(utxo => {
      const datum = parseUtxoDatum(utxo);
      return datum.proposal_id === proposalId;
    });
    
    // 3. Extract current vote counts
    if (proposalUtxo) {
      const currentDatum = parseUtxoDatum(proposalUtxo);
      return {
        acceptVotes: currentDatum.accept_votes,
        rejectVotes: currentDatum.reject_votes,
        totalVotes: currentDatum.accept_votes + currentDatum.reject_votes,
        voters: currentDatum.voters,
        deadline: new Date(currentDatum.voting_deadline * 1000)
      };
    }
  } catch (error) {
    console.error('Failed to fetch proposal results:', error);
  }
}
```

#### Transaction Submission:
```typescript
async function submitVote(signedTx: string) {
  try {
    // Submit transaction to Cardano network via Blockfrost
    const txHash = await provider.submitTx(signedTx);
    
    // Monitor transaction confirmation
    const confirmed = await provider.onTxConfirmed(txHash);
    
    return { txHash, confirmed };
  } catch (error) {
    console.error('Transaction submission failed:', error);
    throw error;
  }
}
```

### 4. 🔑 **Wallet Integration**

**Purpose:** Authenticates users, signs transactions, provides identity

#### Wallet Authentication:
```typescript
// Each vote is authenticated by wallet signature
const walletAddress = await wallet.getChangeAddress();
const keyHash = resolvePaymentKeyHash(walletAddress);

// Wallet automatically signs the voting transaction
const signedTx = await wallet.signTx(votingTransaction);
```

#### Identity & Security:
- **Unique Identity:** Each wallet address can only vote once per proposal
- **Cryptographic Proof:** Digital signatures prove vote authenticity  
- **Non-repudiation:** Votes cannot be denied once signed and submitted
- **Privacy:** Wallet addresses are pseudonymous but trackable

#### Supported Wallets:
- 🦋 **Nami** - Popular browser extension wallet
- ⚡ **Eternl** - Feature-rich wallet with dApp integration
- 🌊 **Flint** - Lightweight and fast wallet
- 💎 **Typhon** - Advanced wallet with staking features

## 🔄 Complete Voting Flow

### 1. **Proposal Creation**
```
Creator → Wallet Signs → Mesh SDK Builds TX → Blockfrost Submits → Aiken Validates → New Proposal On-Chain
```

### 2. **Casting Votes**
```
Voter → Wallet Auth → UI Shows Options → User Clicks Vote → Mesh SDK Builds TX → Wallet Signs → Blockfrost Submits → Aiken Validates → Vote Recorded
```

### 3. **Viewing Results**
```
User → Frontend Requests → Blockfrost Queries → Smart Contract State → UI Updates → Real-time Results
```

## 🛡️ Security & Anti-Spam Measures

### Smart Contract Level (Aiken):
- ✅ **Double-vote prevention:** Voter list tracking
- ✅ **Deadline enforcement:** Time-based validation
- ✅ **Creator verification:** Only creator can manage proposal
- ✅ **Vote validation:** Only "accept"/"reject" allowed

### Application Level (Mesh SDK):
- ✅ **Wallet verification:** Must connect valid wallet
- ✅ **Transaction signing:** Cryptographic proof required
- ✅ **Input validation:** UI prevents invalid inputs
- ✅ **Error handling:** Graceful failure management

### Network Level (Blockfrost):
- ✅ **Transaction relay:** Secure submission to network
- ✅ **Data integrity:** Verified blockchain queries
- ✅ **Rate limiting:** API abuse prevention
- ✅ **Network consensus:** Cardano's proof-of-stake security

### Economic Level:
- ✅ **Minimum ADA:** Prevents spam voting
- ✅ **Transaction fees:** Natural spam deterrent
- ✅ **Stake-based weight:** Could be implemented for governance
- ✅ **Locked funds:** Proposal creation requires collateral

## 📊 Example Voting Scenarios

### Scenario 1: Infrastructure Upgrade
```
Proposal: "Upgrade network capacity by 20%"
Accept Votes: 1,847 (73.2%)
Reject Votes: 675 (26.8%)
Status: ✅ PASSED
Deadline: 2024-02-15 23:59:59 UTC
```

### Scenario 2: Fee Reduction  
```
Proposal: "Reduce minimum transaction fees by 15%"
Accept Votes: 1,203 (45.1%)
Reject Votes: 1,464 (54.9%) 
Status: ❌ REJECTED
Deadline: 2024-01-30 23:59:59 UTC
```

## 🚀 Try It Yourself

1. **Connect your Cardano wallet** (Nami, Eternl, etc.)
2. **Get test ADA** from the [Cardano Faucet](https://docs.cardano.org/cardano-testnets/tools/faucet/)
3. **Visit `/voting`** in the application
4. **Create a proposal** or vote on existing ones
5. **Explore the code** to understand each component

## 🔍 Key Takeaways

This voting DApp demonstrates:

- **🏗️ Aiken:** Provides trustless validation and rule enforcement
- **🌐 Mesh SDK:** Enables smooth user experience and wallet integration  
- **🔗 Blockfrost:** Gives reliable access to blockchain data and transaction submission
- **🔑 Wallets:** Provide user identity, authentication, and transaction signing

Together, these tools create a **secure**, **transparent**, and **decentralized** voting system that runs entirely on the Cardano blockchain without requiring any centralized servers or authorities.

---

**Ready to build your own governance system?** Start by exploring the code in `contracts/voting.ak` and `src/pages/voting.tsx` to see how each tool contributes to the complete solution!
