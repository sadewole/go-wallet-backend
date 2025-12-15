# GoWallet Backend

## Overview

GoWallet Backend is a robust, scalable financial technology service designed to manage user credit systems. This project focuses on the lifecycle of credit management—including credit limit applications, utilization, transaction tracking, and repayment processing. Built with **NestJS**, it leverages a modern stack to ensure security, performance, and maintainability.

## Project Scope

The application's core functionality has evolved to focus on:

- **Credit Management**: Handling applications for credit limits and managing approved credit lines.
- **Transaction Processing**: processing credit requests and tracking utilization.
- **Repayment System**: Facilitating and verifying repayments.
- **Background Processing**: Automated jobs for status updates, notifications, and scheduled maintenance using queues.

## Technology Stack

The project utilizes a cutting-edge, type-safe stack:

- **Framework**: [NestJS](https://nestjs.com/) (Node.js framework)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Payment Gateway**: [Paystack](https://paystack.com/) for secure payment processing.
- **Queue & Caching**: [Redis](https://redis.io/) with [Bull](https://github.com/OptimalBits/bull)
- **Storage**: Google Cloud Storage
- **email**: Nodemailer with Handlebars templates
- **Authentication**: Passport (JWT)
- **CI/CD**: GitHub Actions
- **Infrastructure**: Google Cloud Run (Dockerized)
- **Containerization**: Docker & Docker Compose

## Software Principles

This project adheres to strict software engineering principles to ensure quality and scalability:

- **Modular Architecture**: leveraging NestJS modules to encapsulate related logic (e.g., `CreditModule`, `AuthModule`, `JobsModule`), promoting separation of concerns.
- **Layered Architecture**: distinct separation between Controllers (HTTP layer), Services (Business Logic), and Repositories/DAL (Data Access).
- **Data Integrity & Concurrency**: Usage of database transactions (ACID properties) to handle race conditions and ensure data consistency during critical financial operations.
- **Type Safety**: Comprehensive use of TypeScript and DTOs (Data Transfer Objects) with `class-validator` to ensure data integrity across the application.
- **Asynchronous Processing**: Non-blocking operations for heavy tasks (like emails and calculations) using background job queues.
- **Configuration Management**: Centralized configuration using `@nestjs/config` and environment variables.

## Security Measures

Security is paramount in financial applications. Key measures include:

- **Authentication & Authorization**: Secure JWT-based authentication with Guard-protected endpoints (`JwtAuthGuard`, `VerifiedUserGuard`).
- **Data Encryption**: AES-256 encryption for sensitive data at rest and Bcrypt for password hashing.
- **Input Validation**: Strict validation of all incoming requests using DTOs and validation pipes to prevent injection attacks and malformed data.
- **Rate Limiting**: Implementation of `@nestjs/throttler` to prevent abuse and DDoS attacks.
- **Secure Headers**: Usage of `helmet` to set secure HTTP headers.
- **Infrastructure Security**: Least privilege access for database and cloud storage connections.

## Application Flows

### 1. Credit Application Flow

1.  **User Action**: User submits a request for a credit limit increase via `POST /credit/apply`.
2.  **Processing**: System creates a pending application record.
3.  **Review**: Admin or automated system reviews the application (future scope/Admin module).
4.  **Outcome**: Application is approved or rejected, updating the user's available credit.

### 2. Credit Utilization Request

1.  **User Action**: User requests funds/credit usage via `POST /credit/request`.
2.  **Validation**: System checks available credit limit and user status.
3.  **Transaction**: If valid, a transaction is created, and the available balance is deducted.

### 3. Repayment Flow

1.  **User Action**: User initiates a repayment via `POST /credit/repay/initiate`.
2.  **Verification**: Payment is processed (integrated with payment gateway) and verified via `GET /credit/repay/verify`.
3.  **Settlement**: Upon success, the user's credit balance is restored, and the transaction is marked as settled.

## Installation & Setup

### Prerequisites

- Node.js (v18+)
- Docker & Docker Compose
- PostgreSQL
- Redis

### Quick Start

1.  **Clone the repository**

    ```bash
    git clone https://github.com/sadewole/go-wallet-backend
    cd go-wallet-backend
    ```

2.  **Configure Environment**
    Copy the example environment file and update credentials:

    ```bash
    cp .env.example .env
    ```

3.  **Start Services (Docker)**
    Use Docker Compose to spin up the database and Redis:

    ```bash
    docker-compose up -d
    ```

4.  **Install Dependencies**

    ```bash
    npm install
    ```

5.  **Run Migrations**
    Push the schema to the database:

    ```bash
    npx drizzle-kit migrate
    ```

6.  **Run Application**
    ```bash
    npm run start:dev
    ```

## License

This project is licensed under the MIT License.
