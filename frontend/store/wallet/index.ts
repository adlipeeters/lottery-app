import { create } from 'zustand';

export interface WalletState {
    wallet: string;
    setWallet: (wallet: string) => void;
}

const useWalletStore = create<WalletState>((set) => ({
    wallet: "",
    setWallet: (wallet) => set({ wallet }),
}));

export default useWalletStore;
