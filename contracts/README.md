# Cardano Voting DApp - Aiken Smart Contract

This directory contains the Aiken smart contract for the Cardano voting DApp.

## Features

- **One vote per wallet**: Prevents double voting by tracking voter public key hashes
- **Anti-spam protection**: Requires minimum ADA to vote
- **Deadline enforcement**: Validates voting periods
- **Secure vote counting**: Immutable on-chain vote tallies
- **Proposal creation**: Support for creating new voting proposals

## Smart Contract Structure

### Voting Datum
```
VotingDatum {
  proposal_id: ByteArray,
  option_a_votes: Int,
  option_b_votes: Int,
  voting_deadline: Int,
  min_ada_to_vote: Int,
  voters: List<Hash<Blake2b_224, VerificationKey>>
}
```

### Voting Redeemer
```
VotingAction {
  Vote { choice: VoteChoice, voter_pkh: Hash<Blake2b_224, VerificationKey> }
  Tally
}
```

## Compilation

```bash
# Install Aiken (if not already installed)
curl -sSf https://install.aiken-lang.org | bash

# Compile the contract
aiken build

# Run tests
aiken test
```

## Deployment

1. Compile to Plutus script
2. Generate script address
3. Deploy to Cardano testnet/mainnet
4. Update frontend with script addresses

## Integration with Frontend

The compiled Plutus script is integrated with the Next.js frontend using:
- Mesh SDK for transaction building
- Blockfrost API for blockchain queries
- Wallet integration for signing

## Security Features

- Input validation for all parameters
- Cryptographic signature verification
- Time-locked voting periods
- Immutable vote records
- Anti-spam measures
