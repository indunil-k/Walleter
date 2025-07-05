// AIKEN SMART CONTRACT - Voting System
use aiken/hash.{Blake2b_224, Hash}
use aiken/list
use aiken/transaction.{ScriptContext, Spend, Transaction}
use aiken/transaction/credential.{VerificationKey}
use aiken/transaction/value.{Value, ada_only, from_lovelace}

// Data structures for our voting system
pub type Datum {
  // The proposal being voted on
  proposal_id: ByteArray,
  proposal_title: ByteArray,
  proposal_description: ByteArray,
  
  // Voting statistics
  accept_votes: Int,
  reject_votes: Int,
  
  // Voting parameters
  min_ada_to_vote: Int,        // Minimum ADA required to vote (prevents spam)
  voting_deadline: Int,         // POSIX timestamp when voting ends
  creator: Hash<Blake2b_224, VerificationKey>,  // Who created the proposal
  
  // Tracking voters (simplified - in production, use a more efficient structure)
  voters: List<Hash<Blake2b_224, VerificationKey>>,
}

pub type Redeemer {
  action: ByteArray,  // "vote", "tally", or "withdraw"
  
  // For voting action
  vote_choice: ByteArray,  // "accept" or "reject"
  voter: Hash<Blake2b_224, VerificationKey>,
  
  // For tally action (to finalize results)
  // No additional fields needed
  
  // For withdraw action (creator can withdraw after voting ends)
  // No additional fields needed
}

// The voting validator
validator voting_system {
  spend(
    datum_opt: Option<Datum>,
    redeemer: Redeemer,
    _input: OutputReference,
    tx: Transaction,
  ) {
    expect Some(datum) = datum_opt
    
    when redeemer.action {
      // VOTE: Add a vote to the proposal
      "vote" -> {
        // Check if voter hasn't already voted
        let not_already_voted = !list.has(datum.voters, redeemer.voter)
        
        // Check if voting period is still active
        let voting_active = get_current_time(tx) < datum.voting_deadline
        
        // Check if transaction is signed by the voter
        let signed_by_voter = list.has(tx.extra_signatories, redeemer.voter)
        
        // Check if voter sent minimum ADA (anti-spam measure)
        let has_minimum_ada = check_minimum_ada_sent(tx, datum.min_ada_to_vote)
        
        // Check vote choice is valid
        let valid_vote = redeemer.vote_choice == "accept" || redeemer.vote_choice == "reject"
        
        // Verify new datum is correctly updated
        let correct_update = check_vote_update(datum, redeemer, tx)
        
        // All conditions must be true
        not_already_voted && voting_active && signed_by_voter && has_minimum_ada && valid_vote && correct_update
      }
      
      // TALLY: Finalize the voting results (anyone can call this after deadline)
      "tally" -> {
        // Check if voting period has ended
        let voting_ended = get_current_time(tx) >= datum.voting_deadline
        
        // Check if the final state is correctly recorded
        let correct_final_state = check_final_tally(datum, tx)
        
        voting_ended && correct_final_state
      }
      
      // WITHDRAW: Creator can withdraw remaining funds after voting ends
      "withdraw" -> {
        // Check if voting period has ended
        let voting_ended = get_current_time(tx) >= datum.voting_deadline
        
        // Check if transaction is signed by the creator
        let signed_by_creator = list.has(tx.extra_signatories, datum.creator)
        
        voting_ended && signed_by_creator
      }
      
      // Invalid action
      _ -> False
    }
  }

  else(_) {
    fail
  }
}

// Helper function to get current time from transaction
fn get_current_time(tx: Transaction) -> Int {
  // In a real implementation, you'd extract the time from the transaction's validity interval
  // For this example, we'll assume it's available
  // tx.validity_interval.after
  1640995200  // Placeholder timestamp
}

// Helper function to check if minimum ADA was sent
fn check_minimum_ada_sent(tx: Transaction, min_ada: Int) -> Bool {
  // Check if any input contains at least min_ada lovelace
  // In a real implementation, you'd iterate through tx.inputs and check values
  True  // Simplified for this example
}

// Helper function to verify vote was correctly recorded
fn check_vote_update(old_datum: Datum, redeemer: Redeemer, tx: Transaction) -> Bool {
  // Verify that the new datum in the output correctly reflects the vote
  // This would check:
  // 1. Vote count is incremented by 1 for the correct choice
  // 2. Voter is added to the voters list
  // 3. All other fields remain the same
  
  // In a real implementation, you'd extract the new datum from tx.outputs
  // and compare it with the expected updated state
  True  // Simplified for this example
}

// Helper function to verify final tally is correct
fn check_final_tally(datum: Datum, tx: Transaction) -> Bool {
  // Verify that the final results are correctly recorded
  // This could include storing the winner in the final datum
  True  // Simplified for this example
}
