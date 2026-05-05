import React, { createContext, useContext, useState, useEffect } from 'react';
import { format, addMonths, addDays, isPast, isToday } from 'date-fns';

export type Role = 'owner' | 'staff';
export type PaymentMethod = 'Cash' | 'bKash' | 'Nagad' | 'Upay';

export interface User {
  role: Role;
  name: string;
}

export interface Member {
  id: string; // Auto Unique ID
  fullName: string;
  phone: string;
  isWhatsApp: boolean;
  address: string;
  age: string;
  gender: string;
  joinDate: string;
  bloodGroup: string;
  photoUrl?: string;
  
  // Subscription info
  planType: 'monthly' | 'yearly' | 'custom';
  monthlyFee: number;
  admissionFee: number;
  discount: number;
  
  expiryDate: string;
  status: 'active' | 'expired' | 'inactive';
}

export interface Payment {
  id: string;
  memberId: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  type: 'admission' | 'monthly_fee' | 'other';
}

export interface Expense {
  id: string;
  amount: number;
  date: string;
  category: string;
  description: string;
}

export interface AttendanceRecord {
  id: string;
  memberId: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent';
}

interface AppContextType {
  language: 'en' | 'bn';
  setLanguage: (lang: 'en' | 'bn') => void;
  currentUser: User | null;
  login: (role: Role) => void;
  logout: () => void;
  
  // Data
  members: Member[];
  addMember: (m: Omit<Member, 'id' | 'status'>, paymentInfo: { amountPaid: number, method: PaymentMethod }) => void;
  updateMember: (id: string, updates: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  
  payments: Payment[];
  addPayment: (p: Omit<Payment, 'id'>) => void;
  
  expenses: Expense[];
  addExpense: (e: Omit<Expense, 'id'>) => void;
  
  attendance: AttendanceRecord[];
  markAttendance: (memberId: string, status: 'present' | 'absent', date: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const demoMembers: Member[] = [
  {
    id: "GYM-1001",
    fullName: "Rahim Uddin",
    phone: "01711000000",
    isWhatsApp: true,
    address: "Gulshan, Dhaka",
    age: "28",
    gender: "Male",
    joinDate: format(new Date(), 'yyyy-MM-dd'),
    bloodGroup: "O+",
    planType: "monthly",
    monthlyFee: 2000,
    admissionFee: 1000,
    discount: 0,
    expiryDate: format(addMonths(new Date(), 1), 'yyyy-MM-dd'),
    status: "active"
  },
  {
    id: "GYM-1002",
    fullName: "Karim Hassan",
    phone: "01811000000",
    isWhatsApp: false,
    address: "Banani, Dhaka",
    age: "34",
    gender: "Male",
    joinDate: format(addDays(new Date(), -40), 'yyyy-MM-dd'),
    bloodGroup: "A+",
    planType: "monthly",
    monthlyFee: 2000,
    admissionFee: 1000,
    discount: 200,
    expiryDate: format(addDays(new Date(), -10), 'yyyy-MM-dd'),
    status: "expired"
  }
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [currentUser, setCurrentUser] = useState<User | null>({ role: 'owner', name: 'Admin' });
  
  const [members, setMembers] = useState<Member[]>(demoMembers);
  const [payments, setPayments] = useState<Payment[]>([
    { id: '1', memberId: 'GYM-1001', amount: 3000, date: format(new Date(), 'yyyy-MM-dd'), method: 'Cash', type: 'admission' },
    { id: '2', memberId: 'GYM-1002', amount: 2800, date: format(addDays(new Date(), -40), 'yyyy-MM-dd'), method: 'bKash', type: 'admission' }
  ]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  // Periodically check statuses
  useEffect(() => {
    setMembers(prev => prev.map(m => {
      if (isPast(new Date(m.expiryDate)) && !isToday(new Date(m.expiryDate))) {
        return { ...m, status: 'expired' };
      }
      return m;
    }));
  }, []);

  const addMember = (m: Omit<Member, 'id' | 'status'>, paymentInfo: { amountPaid: number, method: PaymentMethod }) => {
    const id = `GYM-${1000 + members.length + 1}`;
    const newMember: Member = {
      ...m,
      id,
      status: 'active'
    };
    setMembers([...members, newMember]);
    
    if (paymentInfo.amountPaid > 0) {
      addPayment({
        memberId: id,
        amount: paymentInfo.amountPaid,
        date: format(new Date(), 'yyyy-MM-dd'),
        method: paymentInfo.method,
        type: 'admission'
      });
    }
  };

  const updateMember = (id: string, updates: Partial<Member>) => {
    setMembers(members.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const deleteMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const addPayment = (p: Omit<Payment, 'id'>) => {
    setPayments([...payments, { ...p, id: Date.now().toString() }]);
  };

  const addExpense = (e: Omit<Expense, 'id'>) => {
    setExpenses([...expenses, { ...e, id: Date.now().toString() }]);
  };

  const markAttendance = (memberId: string, status: 'present' | 'absent', date: string) => {
    // replace if already exists for same day
    const existingIndex = attendance.findIndex(a => a.memberId === memberId && a.date === date);
    if (existingIndex >= 0) {
      const newAtt = [...attendance];
      newAtt[existingIndex] = { ...newAtt[existingIndex], status };
      setAttendance(newAtt);
    } else {
      setAttendance([...attendance, { id: Date.now().toString(), memberId, status, date }]);
    }
  };

  const login = (role: Role) => setCurrentUser({ role, name: role === 'owner' ? 'Admin' : 'Staff' });
  const logout = () => setCurrentUser(null);

  const value = {
    language, setLanguage,
    currentUser, login, logout,
    members, addMember, updateMember, deleteMember,
    payments, addPayment,
    expenses, addExpense,
    attendance, markAttendance
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};
