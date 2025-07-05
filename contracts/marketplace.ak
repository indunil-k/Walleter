// AIKEN SMART CONTRACT - Simple NFT Marketplace
use aiken/hash.{Blake2b_224, Hash}
use aiken/list
use aiken/transaction.{ScriptContext, Spend, Transaction}
use aiken/transaction/credential.{VerificationKey}
use aiken/transaction/value.{Value, ada_only, from_lovelace}

// Data structures for our marketplace
pub type Datum {
  // Who owns the NFT listing
  seller: Hash<Blake2b_224, VerificationKey>,
  // Price in lovelace (1 ADA = 1,000,000 lovelace)
  price: Int,
  // The NFT being sold (policy_id + asset_name)
  nft_policy: ByteArray,
  nft_name: ByteArray,
}

pub type Redeemer {
  // Action: "buy" or "cancel"
  action: ByteArray,
  // Buyer's signature (only needed for "buy")
  buyer: Hash<Blake2b_224, VerificationKey>,
}

// The marketplace validator
validator marketplace {
  spend(
    datum_opt: Option<Datum>,
    redeemer: Redeemer,
    _input: OutputReference,
    tx: Transaction,
  ) {
    expect Some(datum) = datum_opt
    
    when redeemer.action {
      // CANCEL: Only seller can cancel their listing
      "cancel" -> {
        // Must be signed by the original seller
        list.has(tx.extra_signatories, datum.seller)
      }
      
      // BUY: Anyone can buy if they pay the right price
      "buy" -> {
        // Must be signed by the buyer
        let signed_by_buyer = list.has(tx.extra_signatories, redeemer.buyer)
        
        // Check if payment was made to seller
        let seller_gets_paid = check_payment_to_seller(tx, datum.seller, datum.price)
        
        // Both conditions must be true
        signed_by_buyer && seller_gets_paid
      }
      
      // Invalid action
      _ -> False
    }
  }

  else(_) {
    fail
  }
}

// Helper function to verify seller gets paid
fn check_payment_to_seller(tx: Transaction, seller: Hash<Blake2b_224, VerificationKey>, price: Int) -> Bool {
  // In a real marketplace, you'd check the transaction outputs
  // to ensure the seller receives the correct payment
  // For this example, we'll simplify and just return true
  // (In production, you'd iterate through tx.outputs and verify amounts)
  True
}
