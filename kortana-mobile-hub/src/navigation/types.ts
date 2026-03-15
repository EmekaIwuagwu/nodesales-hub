export type RootStackParamList = {
    Onboarding: undefined;
    Auth: undefined;
    Main: undefined;
};

export type OnboardingStackParamList = {
    Welcome: undefined;
    CreateWallet: undefined;
    SeedPhraseReveal: { mnemonic: string };
    SeedPhraseVerify: { mnemonic: string };
    ImportWallet: undefined;
    SetPin: { mnemonic: string; isImport: boolean };
};
