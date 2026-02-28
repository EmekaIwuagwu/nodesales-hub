# BelloMundo — Smart City Financial Operating System

BelloMundo is a next-generation Smart City payment platform built on the Kortana Blockchain, settling all transactions in DNR (Dinar). This project is the financial Operating System for the smart city, as familiar as Airbnb, as powerful as a bank, but Web3-native.

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- MongoDB (Local or Atlas)
- MetaMask or Kortana Wallet extension

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Copy `.env.local` and fill in the required values.

4. Run the development server:
   ```bash
   npm run dev
   ```

## 🏗 Project Structure

- `src/app/` - Next.js App Router pages and layouts.
- `src/components/` - Shared UI components (Landing, Dashboard, Verticals).
- `src/models/` - Mongoose database models.
- `src/lib/` - Utility libraries (MongoDB, Auth, Web3).
- `src/hooks/` - Custom React hooks for blockchain and state.
- `src/styles/` - Global styles and custom Tailwind utilities.

## 🛠 Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, Framer Motion, Three.js (R3F)
- **State**: Zustand, TanStack Query
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: MongoDB (Atlas)
- **Blockchain**: Kortana Blockchain (EVM), viem, wagmi

## 🎨 Design Language
- **Theme**: Warm Futurism
- **Primary Colors**: Kortana Teal (#1A7A8A), Dinar Gold (#D97706)
- **Aesthetic**: Glassmorphism, premium obsidian dark mode, fluid animations.

## 🌍 Modules Implemented
- **Landing Page**: Marketing hero and feature grid.
- **Dashboard**: Central command with wallet and analytics.
- **Properties**: Real-estate discovery and listing management.
- **Utilities**: Civic billing and usage tracking.
- **e-Residency**: Digital on-chain identity and KYC management.

---
Built by Antigravity Studio for the BelloMundo Smart City Authority.
Powered by **Kortana Blockchain**.
