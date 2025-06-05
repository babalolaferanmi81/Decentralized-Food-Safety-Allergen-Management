# Decentralized Food Safety Allergen Management System

This project implements a blockchain-based system for managing food safety and allergen tracking using Clarity smart contracts. The system provides a transparent and immutable record of food businesses, ingredients, allergens, and safety protocols to ensure consumer safety.

## Overview

The Decentralized Food Safety Allergen Management System consists of five main components:

1. **Food Business Verification**: Validates and verifies food businesses on the blockchain
2. **Ingredient Tracking**: Tracks food ingredients through the supply chain
3. **Allergen Identification**: Identifies and tracks food allergens
4. **Cross-contamination Prevention**: Manages production lines to prevent allergen cross-contamination
5. **Consumer Alert**: Provides alerts to consumers about allergens and recalls

## Smart Contracts

### Food Business Verification Contract

This contract handles the registration and verification of food businesses:

- Businesses can register themselves with their business name and license number
- An admin can verify businesses after checking their credentials
- Anyone can check if a business is verified

### Ingredient Tracking Contract

This contract tracks ingredients through the supply chain:

- Suppliers can register ingredients with details like name, batch ID, production date, and expiration date
- Ownership of ingredients can be transferred between entities
- The contract tracks expiration dates to ensure food safety

### Allergen Identification Contract

This contract identifies and tracks food allergens:

- Defines common allergens as constants (milk, eggs, fish, etc.)
- Maps ingredients to their allergens
- Provides functions to check if an ingredient contains specific allergens

### Cross-contamination Contract

This contract helps prevent allergen cross-contamination:

- Tracks production lines and their allergen status
- Records cleaning protocols for different allergens
- Provides functions to check if a production line is safe for specific allergens

### Consumer Alert Contract

This contract provides alerts to consumers:

- Tracks food products and their ingredients/allergens
- Allows manufacturers to issue recalls when necessary
- Provides functions to check if a product contains specific allergens or has been recalled

## Testing

The project includes comprehensive tests for each contract using Vitest. The tests cover:

- Registration and verification of food businesses
- Tracking of ingredients and their ownership
- Identification of allergens in ingredients
- Management of production lines to prevent cross-contamination
- Registration of food products and issuance of recalls

## Getting Started

1. Clone the repository
2. Run the tests: `npm test`
3. Deploy the contracts to a Stacks blockchain node

## Usage Examples

### Registering a Food Business

```clarity
(contract-call? .food-business-verification register-business "Healthy Foods Inc" "LICENSE123")
