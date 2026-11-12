export type AssetType = 'index' | 'stock' | 'crypto' | 'forex' | 'commodity' | 'bond';

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Quote {
  symbol: string;
  name: string;
  type: AssetType;
  price: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  volume: string;
  marketCap?: string;
  sector?: string;
  pe?: number;
  dividend?: string;
  rating: 'Strong Buy' | 'Buy' | 'Neutral' | 'Sell' | 'Strong Sell';
  sparkline: number[];
  candles?: Candle[];
  currency?: string;
  exchange?: string;
  description?: string;
  flash?: 'up' | 'down' | null;
}

export interface SectorPerformance {
  name: string;
  changePercent: number;
  marketCap: string;
  topStock: string;
}

export interface EconomicEvent {
  id: string;
  time: string;
  country: string;
  flag: string;
  event: string;
  impact: 'high' | 'medium' | 'low';
  actual: string;
  forecast: string;
  previous: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  category: string;
  url?: string;
  summary: string;
  relatedSymbols: string[];
}

export interface PaperPosition {
  id: string;
  symbol: string;
  name: string;
  type: 'BUY' | 'SELL';
  shares: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  openedAt: string;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  createdAt: string;
  active: boolean;
}
