import { Lottery } from '@/types';
import { create } from 'zustand';

export interface LotteryState {
    createModalOpen: boolean;
    myLotteries: Lottery[];
    lotteries: Lottery[];
    handleCreateLotteryModal: () => void;
    setMyLotteries: (lotteries: Lottery[]) => void;
    setLotteries: (lotteries: Lottery[]) => void;
}

const useLotteryStore = create<LotteryState>((set) => ({
    createModalOpen: false,
    myLotteries: [],
    lotteries: [],
    handleCreateLotteryModal: () => set((state) => ({ createModalOpen: !state.createModalOpen })),
    setMyLotteries: (lotteries) => set({ myLotteries: lotteries }),
    setLotteries: (lotteries) => set({ lotteries }),
}));

export default useLotteryStore;
