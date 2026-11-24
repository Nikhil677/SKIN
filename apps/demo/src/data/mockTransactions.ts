export interface Transaction {
  id: string;
  date: string;
  ref: string;
  narration: string;
  type: "DEBIT" | "CREDIT";
  amount: number;
  balance: number;
  category: string;
}

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "tx_01",
    date: "2026-11-23",
    ref: "UPI/632810928371/Apollo",
    narration: "Apollo Pharmacy Medical Care — Prescription Medicines",
    type: "DEBIT",
    amount: 1420.0,
    balance: 142850.5,
    category: "Healthcare",
  },
  {
    id: "tx_02",
    date: "2026-11-20",
    ref: "NEFT/EPFO/PEN783921",
    narration: "Central Pension Processing Monthly Credit (EPFO)",
    type: "CREDIT",
    amount: 32500.0,
    balance: 144270.5,
    category: "Pension",
  },
  {
    id: "tx_03",
    date: "2026-11-18",
    ref: "UPI/632481029384/BigBasket",
    narration: "BigBasket Supermarket Grocery Supplies",
    type: "DEBIT",
    amount: 2840.0,
    balance: 111770.5,
    category: "Groceries",
  },
  {
    id: "tx_04",
    date: "2026-11-15",
    ref: "BILL/TNEB/ELEC98231",
    narration: "Tamil Nadu Electricity Board Residential Utility Bill",
    type: "DEBIT",
    amount: 1250.0,
    balance: 114610.5,
    category: "Utilities",
  },
  {
    id: "tx_05",
    date: "2026-11-10",
    ref: "ATM/WDL/SBI992182",
    narration: "State Bank ATM Cash Withdrawal Malleswaram Branch",
    type: "DEBIT",
    amount: 5000.0,
    balance: 115860.5,
    category: "Cash",
  },
  {
    id: "tx_06",
    date: "2026-11-05",
    ref: "INT/SB/Q3CREDIT",
    narration: "Quarterly Savings Account Interest Credit",
    type: "CREDIT",
    amount: 980.5,
    balance: 120860.5,
    category: "Interest",
  },
  {
    id: "tx_07",
    date: "2026-11-01",
    ref: "UPI/631982736152/MilkCoop",
    narration: "Nandini Dairy Fresh Milk Monthly Subscription",
    type: "DEBIT",
    amount: 1680.0,
    balance: 119880.0,
    category: "Groceries",
  },
];
