# 🏛️ Cardano Real-World Voting DApp

A comprehensive, production-ready decentralized voting application built on Cardano blockchain featuring Aiken smart contracts, Mesh SDK integration, Blockfrost API, and multi-wallet support.

## 🌟 Features

### Smart Contract (Aiken)
- **One vote per wallet enforcement** - Cryptographically prevents double voting
- **Anti-spam protection** - Minimum ADA requirement to participate
- **Deadline validation** - Time-locked voting periods
- **Immutable vote records** - On-chain transparency and auditability
- **Secure proposal creation** - Controlled governance process

### Frontend (Next.js + Mesh SDK)
- **Multi-wallet support** - Connect with Nami, Eternl, and other Cardano wallets
- **Real-time vote tallies** - Live blockchain data via Blockfrost API
- **Transaction building** - Secure Cardano transaction construction
- **Responsive UI** - Modern, accessible voting interface
- **Proposal creation** - Submit new governance proposals

### Blockchain Integration
- **Blockfrost API** - Reliable Cardano network connectivity
- **Transaction submission** - Direct blockchain interaction
- **UTXO management** - Efficient on-chain state management
- **Metadata handling** - Rich transaction information

## 🛠️ Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Smart Contracts | **Aiken** | Plutus validator for voting logic |
| Frontend Framework | **Next.js** | React-based web application |
| Blockchain SDK | **Mesh SDK** | Cardano transaction building |
| Blockchain API | **Blockfrost** | Network data and submission |
| Wallet Integration | **CIP-30** | Standard wallet connectivity |
| Styling | **Tailwind CSS** | Modern UI components |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- NPM or Yarn
- Cardano wallet (Nami, Eternl, etc.)
- Blockfrost API key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd walleter
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env.local
# Add your Blockfrost API key to .env.local
```

4. **Run development server**
```bash
npm run dev
```

5. **Open application**
Navigate to `http://localhost:3000`

### Blockfrost Setup
1. Create account at [blockfrost.io](https://blockfrost.io)
2. Generate API key for testnet
3. Add to `.env.local`:
```
NEXT_PUBLIC_BLOCKFROST_PROJECT_ID=your_api_key_here
NEXT_PUBLIC_CARDANO_NETWORK=testnet
```

## 🏗️ Smart Contract Development

### Aiken Contract Compilation

1. **Install Aiken**
```bash
curl -sSf https://install.aiken-lang.org | bash
```

2. **Compile contract**
```bash
aiken build
```

3. **Run tests**
```bash
aiken test
```

4. **Generate Plutus script**
```bash
aiken build --trace-level verbose
```

### Contract Features

#### Voting Datum Structure
```aiken
VotingDatum {
  proposal_id: ByteArray,
  option_a_votes: Int,
  option_b_votes: Int,
  voting_deadline: Int,
  min_ada_to_vote: Int,
  voters: List<Hash<Blake2b_224, VerificationKey>>
}
```

#### Validation Logic
- **Double voting prevention**: Tracks voter public key hashes
- **Deadline enforcement**: Validates current time against voting period
- **Minimum stake**: Requires ADA to prevent spam
- **Signature verification**: Ensures transaction authorization

## 🎯 How It Works

### Voting Process

1. **Connect Wallet**
   - User connects Cardano wallet (Nami, Eternl, etc.)
   - Application queries wallet address and assets

2. **View Proposals**
   - Browse active and historical voting proposals
   - See real-time vote tallies and deadlines

3. **Cast Vote**
   - Select choice (Option A or Option B)
   - Transaction built with Mesh SDK
   - Smart contract validates vote eligibility
   - Transaction signed and submitted to blockchain

4. **Verify Results**
   - Votes tallied transparently on-chain
   - Results displayed in real-time
   - Immutable audit trail maintained

## 📁 Project Structure

```
walleter/
├── contracts/                 # Aiken smart contracts
│   ├── voting-validator.ak   # Main voting contract
│   └── README.md            # Contract documentation
├── src/
│   ├── pages/
│   │   ├── real-voting.tsx  # Production voting DApp
│   │   ├── voting.tsx       # Demo voting page
│   │   └── index.tsx        # Learning hub homepage
│   └── styles/
│       └── globals.css      # Tailwind styles
├── aiken.toml               # Aiken project configuration
├── package.json             # Node.js dependencies
└── README.md               # This file
```

## 🔐 Security Features

### Smart Contract Security
- **Input validation** - All parameters validated on-chain
- **Reentrancy protection** - Secure state transitions
- **Access control** - Signature-based authorization
- **Time locks** - Deadline enforcement prevents late votes

### Frontend Security
- **Wallet isolation** - CIP-30 standard compliance
- **Transaction preview** - Users see exact transaction details
- **Error handling** - Graceful failure modes
- **Input sanitization** - Prevents malicious inputs

## 🌐 Production Deployment

### Testnet Deployment
1. Compile Aiken contract to Plutus script
2. Deploy contract to Cardano testnet
3. Update frontend with script addresses
4. Configure Blockfrost testnet endpoints
5. Test with testnet ADA

### Mainnet Deployment
1. Security audit of smart contracts
2. Deploy to Cardano mainnet
3. Configure production Blockfrost API
4. Update DNS and hosting
5. Monitor transactions and performance

## 🧪 Testing

### Smart Contract Tests
```bash
aiken test                    # Run all contract tests
aiken test --match "vote"     # Run specific test patterns
```

### Frontend Testing
```bash
npm run test                  # Run Jest tests
npm run e2e                   # Run Playwright e2e tests
```

## 📚 Learning Resources

### Cardano Development
- [Aiken Documentation](https://aiken-lang.org)
- [Mesh SDK Guide](https://meshjs.dev)
- [Blockfrost API Docs](https://docs.blockfrost.io)
- [Cardano Developer Portal](https://developers.cardano.org)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for the Cardano ecosystem**

This project demonstrates production-ready Cardano DApp development using modern tools and best practices. Perfect for learning blockchain development or building governance solutions.
