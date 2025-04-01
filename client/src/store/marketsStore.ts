import create from 'zustand';

const useMarketsStore = create((set) => ({
  markets: [],
  addMarket: (market) => set((state) => ({ 
    markets: [market, ...state.markets] 
  })),
})); 