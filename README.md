# KortanaDEX Standalone

This repository contains the production-ready frontend and smart contracts for KortanaDEX.

## Project Structure
- **/frontend**: Next.js application (Web UI)
- **/contracts**: Solidity Smart Contracts
- **/scripts**: Deployment and utility scripts

## Deployment (Vercel)
To deploy this project on Vercel:
1.  Connect this repository.
2.  Set **Root Directory** to `frontend`.
3.  Override **Install Command** to `npm install --legacy-peer-deps`.
4.  Add necessary environment variables for the RPC and WalletConnect Project ID.

## Local Development
1. `cd frontend`
2. `npm install`
3. `npm run dev`
