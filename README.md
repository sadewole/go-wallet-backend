# GoWallet App

## Overview

GoWallet is a digital wallet application designed to securely store and manage various types of cards, including credit/debit cards, loyalty cards, and tickets. It supports peer-to-peer transfers, and provides real-time notifications and alerts.

## Features

- **Digital Card Storage**: Add and manage credit/debit cards, loyalty cards, and tickets.
- **In-App Payments**: Complete online transactions directly from the app.
- **Peer-to-Peer Transfers**: Send money to other users effortlessly.
- **Notifications and Alerts**: Receive transaction notifications and balance updates.
- **Offers and Promotions**: Track loyalty programs and access merchant offers.
- **User Authentication**: Secure access with biometric authentication and PIN/password protection.
- **Transaction history**: View transaction histories.

## Security Measures

- **Data Encryption**: All sensitive data is encrypted both in transit and at rest using AES-256.
- **Secure Authentication**: Supports multi-factor authentication and biometric security.
- **Secure Storage**: Utilizes secure elements for storing tokens, keys, and personal data.
- **Compliance**: Adheres to PCI DSS, GDPR, and other relevant regulations.
- **Fraud Detection**: Implements real-time fraud detection algorithms to monitor suspicious activities.
- **User Privacy**: Collects minimal data and ensures clear, transparent privacy policies.

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

### Clone the Repository

```bash
git clone https://github.com/sadewole/go-wallet-backend
cd go-wallet-backend
```

### Install Dependencies

```bash
npm install
```

### Run the Application

```bash
npm run start:dev
```

## Usage

1. **Add a Card**:

   - Navigate to the "Add Card" section.
   - Scan or manually enter card details.
   - Save the card to the wallet.

2. **Make a Payment**:

   - Select a card from the wallet.
   - Follow the in-app prompts for online transactions.

3. **Send Money**:
   - Go to the "Transfer" section.
   - Enter recipient details and amount.
   - Authenticate and confirm the transfer.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For any questions or support, please contact [@samador](https://twitter.com/samador9).
