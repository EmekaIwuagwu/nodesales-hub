# Kortana Wallet — Architecture Overview

## 🔐 Security Layer
- **Encryption**: AES-256-GCM.
- **Key Derivation**: PBKDF2 with 100,000 iterations and SHA-256 salt.
- **Storage**: `Microsoft.Maui.Storage.SecureStorage` for encrypted payloads.
- **Biometrics**: `Plugin.Fingerprint` integration for session unlock and signing.

## ⛓️ Blockchain Layer
- **Library**: `Nethereum.Web3` (v4.x).
- **HD Wallet**: BIP-39 Mnemonic support, derivation path `m/44'/60'/0'/0/0`.
- **Transaction Type**: EIP-1559 (Dynamic fee market).
- **Network**: Kortana Mainnet (Default), EVM-compatible.

## 🎨 UI/UX Patterns
- **MVVM**: Powered by `CommunityToolkit.Mvvm` (Source Generators).
- **Navigation**: MAUI `AppShell` with tabbed navigation and route registration.
- **Design System**: Glassmorphism using `Border` and `Shadow` controls with custom `ResourceDictionaries`.
- **Animations**: SkiaSharp and native `TranslateTo`/`ScaleTo` for 60fps micro-interactions.

## 📁 Source Layout
- `Core/`: Constants, Helpers, and Extensions.
- `Models/`: Persistent and transient data objects.
- `Services/`: Business logic, RPC calls, and hardware access.
- `ViewModels/`: UI logic and state management.
- `Views/`: XAML pages and platform-specific layouts.
- `Controls/`: Reusable custom UI components.
