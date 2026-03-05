/**
 * Price Service
 * Handles exchange rates for DNR and other assets
 */

class PriceService {
    private mockPrices: Record<string, number> = {
        'DNR': 1.42,
        'kUSD': 1.00,
        'KR-ESG': 0.85
    };

    /**
     * Get the current price of an asset in USD
     * Currently returns mock data, but architecture supports future API integration
     */
    async getPrice(symbol: string): Promise<number> {
        // In the future, this will fetch from a CEX (Binance/Bybit) or a DEX aggregator
        return this.mockPrices[symbol] || 0;
    }

    /**
     * Calculate USD value
     */
    calculateValue(amount: string, symbol: string): string {
        const price = this.mockPrices[symbol] || 0;
        const value = Number(amount) * price;
        return value.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    /**
     * Get 24h change percentage
     */
    get24hChange(symbol: string): string {
        // Mocking a slight positive trend for DNR
        return symbol === 'DNR' ? '+2.4%' : '+0.0%';
    }
}

export const priceService = new PriceService();
