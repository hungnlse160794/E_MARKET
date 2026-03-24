
export interface IProductStat {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  stock: number;
  status: 'LIVE' | 'SOLD OUT' | 'DELISTED';
  img: string;
  lowStock?: boolean;
}

export interface IFinancialDatum {
  month: string;
  gross: number;
  net: number;
}

export interface IPayoutRecord {
  date: string;
  amount: string;
  status: 'PROCESSED' | 'PENDING' | 'FAILED';
  ref: string;
}

export interface IPieData {
  name: string;
  value: number;
  color: string;
}
