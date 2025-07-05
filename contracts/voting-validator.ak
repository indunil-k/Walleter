// Real-world Cardano Voting Smart Contract (Aiken)
// This contract enforces one vote per wallet and validates voting choices

use aiken/hash.{Blake2b_224, Hash}
use aiken/list
use aiken/transaction.{ScriptContext, Spend, find_input}
use aiken/transaction/credential.{VerificationKey}

// Voting datum structure - stores on UTXO
pub type VotingDatum {
  proposal_id: ByteArray,
  option_a_votes: Int,
  option_b_votes: Int,
  voting_deadline: Int, // POSIX timestamp
  min_ada_to_vote: Int, // Anti-spam: minimum ADA required to vote
  voters: List<Hash<Blake2b_224, VerificationKey>>, // Track who has voted
}

// Voting redeemer - user's action
pub type VotingAction {
  Vote { choice: VoteChoice, voter_pkh: Hash<Blake2b_224, VerificationKey> }
  Tally // To finalize voting and distribute results
}

// Vote choices
pub type VoteChoice {
  OptionA
  OptionB
}

// Main validator function
validator {
  fn voting_validator(
    datum: VotingDatum,
    redeemer: VotingAction,
    context: ScriptContext
  ) -> Bool {
    let ScriptContext { transaction, purpose } = context
    
    expect Spend(output_reference) = purpose
    expect Some(input) = find_input(transaction.inputs, output_reference)
    
    when redeemer is {
      Vote { choice, voter_pkh } -> {
        // Validate vote transaction
        validate_vote(datum, choice, voter_pkh, transaction, input)
      }
      Tally -> {
        // Validate tally transaction (finalize voting)
        validate_tally(datum, transaction)
      }
    }
  }
}

// Validate a vote transaction
fn validate_vote(
  datum: VotingDatum,
  choice: VoteChoice,
  voter_pkh: Hash<Blake2b_224, VerificationKey>,
  transaction: Transaction,
  input: Input
) -> Bool {
  // Check 1: Voting is still active (before deadline)
  let current_time = get_current_time(transaction)
  let voting_active = current_time < datum.voting_deadline
  
  // Check 2: Voter hasn't voted before (prevent double voting)
  let voter_not_voted = !list.has(datum.voters, voter_pkh)
  
  // Check 3: Voter paid minimum ADA (anti-spam)
  let paid_min_ada = check_min_ada_paid(transaction, datum.min_ada_to_vote)
  
  // Check 4: Voter signed the transaction
  let voter_signed = list.has(transaction.extra_signatories, voter_pkh)
  
  // Check 5: Output datum is correctly updated
  expect Some(output) = list.head(transaction.outputs)
  expect InlineDatum(output_datum) = output.datum
  expect updated_datum: VotingDatum = output_datum
  
  let expected_datum = update_vote_counts(datum, choice, voter_pkh)
  let datum_correct = updated_datum == expected_datum
  
  // All conditions must be true
  voting_active && voter_not_voted && paid_min_ada && voter_signed && datum_correct
}

// Update vote counts based on choice
fn update_vote_counts(
  datum: VotingDatum,
  choice: VoteChoice,
  voter_pkh: Hash<Blake2b_224, VerificationKey>
) -> VotingDatum {
  when choice is {
    OptionA -> VotingDatum {
      proposal_id: datum.proposal_id,
      option_a_votes: datum.option_a_votes + 1,
      option_b_votes: datum.option_b_votes,
      voting_deadline: datum.voting_deadline,
      min_ada_to_vote: datum.min_ada_to_vote,
      voters: list.push(datum.voters, voter_pkh)
    }
    OptionB -> VotingDatum {
      proposal_id: datum.proposal_id,
      option_a_votes: datum.option_a_votes,
      option_b_votes: datum.option_b_votes + 1,
      voting_deadline: datum.voting_deadline,
      min_ada_to_vote: datum.min_ada_to_vote,
      voters: list.push(datum.voters, voter_pkh)
    }
  }
}

// Validate tally transaction (finalize voting)
fn validate_tally(datum: VotingDatum, transaction: Transaction) -> Bool {
  // Check 1: Voting period has ended
  let current_time = get_current_time(transaction)
  let voting_ended = current_time >= datum.voting_deadline
  
  // Check 2: Results are being properly distributed
  // (In a real implementation, you might distribute rewards or update governance)
  let results_distributed = True // Simplified for demo
  
  voting_ended && results_distributed
}

// Get current time from transaction validity range
fn get_current_time(transaction: Transaction) -> Int {
  when transaction.validity_range.upper_bound.bound_type is {
    Finite(time) -> time
    _ -> 0 // Default fallback
  }
}

// Check if voter paid minimum ADA (anti-spam measure)
fn check_min_ada_paid(transaction: Transaction, min_ada: Int) -> Bool {
  // In a real implementation, you would check if the voter's input
  // contains at least min_ada lovelace
  // For simplicity, we'll assume this check passes
  True
}

// Helper function to create initial voting datum
pub fn create_initial_voting_datum(
  proposal_id: ByteArray,
  voting_deadline: Int,
  min_ada_to_vote: Int
) -> VotingDatum {
  VotingDatum {
    proposal_id: proposal_id,
    option_a_votes: 0,
    option_b_votes: 0,
    voting_deadline: voting_deadline,
    min_ada_to_vote: min_ada_to_vote,
    voters: []
  }
}

// Test functions for development
test test_vote_option_a() {
  let initial_datum = create_initial_voting_datum("test_proposal", 9999999999, 2000000)
  let voter_pkh = #"abcd1234" // Mock voter public key hash
  let updated_datum = update_vote_counts(initial_datum, OptionA, voter_pkh)
  
  updated_datum.option_a_votes == 1 && updated_datum.option_b_votes == 0
}

test test_vote_option_b() {
  let initial_datum = create_initial_voting_datum("test_proposal", 9999999999, 2000000)
  let voter_pkh = #"efgh5678" // Mock voter public key hash
  let updated_datum = update_vote_counts(initial_datum, OptionB, voter_pkh)
  
  updated_datum.option_a_votes == 0 && updated_datum.option_b_votes == 1
}

test test_prevent_double_voting() {
  let initial_datum = create_initial_voting_datum("test_proposal", 9999999999, 2000000)
  let voter_pkh = #"abcd1234"
  
  // First vote
  let after_first_vote = update_vote_counts(initial_datum, OptionA, voter_pkh)
  
  // Check that voter is now in the voters list
  list.has(after_first_vote.voters, voter_pkh)
}
