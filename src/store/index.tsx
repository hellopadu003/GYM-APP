import React, { createContext, useContext, useState, useEffect } from 'react';
import { format, addMonths, addDays, isPast, isToday } from 'date-fns';
import { supabase } from '../lib/supabase';

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
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  
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
  
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  // Auth & Initial Data Fetch
  useEffect(() => {
    if (localStorage.getItem('dummy_admin_logged_in') === 'true') {
      setCurrentUser({ role: 'owner', name: 'Admin' });
      fetchData();
    }

    if (!supabase) {
      console.warn('Supabase not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to environment variables.');
      setLoading(false);
      return;
    }

    // Check auth status
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Determine role based on email or metadata
        const role = session.user.email?.includes('staff') ? 'staff' : 'owner';
        setCurrentUser({ role: role as Role, name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User' });
        fetchData();
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const role = session.user.email?.includes('staff') ? 'staff' : 'owner';
        setCurrentUser({ role: role as Role, name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User' });
        fetchData();
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    if (!supabase) return;

    try {
      setLoading(true);
        // Using Promise.all to fetch all needed data concurrently
        const [
          { data: membersData },
          { data: paymentsData },
          { data: expensesData },
          { data: attendanceData }
        ] = await Promise.all([
          supabase.from('members').select('*'),
          supabase.from('payments').select('*'),
          supabase.from('expenses').select('*'),
          supabase.from('attendance').select('*')
        ]);

        if (membersData) {
          // Map database structure to local app structure
          const mappedMembers: Member[] = membersData.map(m => ({
            id: m.member_id,
            fullName: m.full_name,
            phone: m.phone,
            isWhatsApp: m.is_whatsapp,
            address: m.address,
            age: m.age?.toString() || '',
            gender: m.gender,
            joinDate: m.join_date,
            bloodGroup: m.blood_group,
            photoUrl: m.photo_url || undefined,
            planType: m.plan_type,
            monthlyFee: m.monthly_fee,
            admissionFee: m.admission_fee || 0,
            discount: m.discount,
            expiryDate: m.expiry_date,
            status: m.status
          }));
          
          // Check for expired members
          const updatedMembers = mappedMembers.map(m => {
            if (m.status === 'active' && isPast(new Date(m.expiryDate)) && !isToday(new Date(m.expiryDate))) {
              const updated = { ...m, status: 'expired' as const };
              // Fire async update but don't block
              supabase.from('members').update({ status: 'expired' }).eq('member_id', m.id);
              return updated;
            }
            return m;
          });
          
          setMembers(updatedMembers);
        }

        if (paymentsData) {
          setPayments(paymentsData.map(p => ({
            id: p.id,
            memberId: p.member_id,
            amount: p.amount,
            date: p.date,
            method: p.method,
            type: p.type
          })));
        }

        if (expensesData) {
          setExpenses(expensesData.map(e => ({
            id: e.id,
            amount: e.amount,
            date: e.date,
            category: e.category,
            description: e.description || ''
          })));
        }

        if (attendanceData) {
          setAttendance(attendanceData.map(a => ({
            id: a.id,
            memberId: a.member_id,
            date: a.date,
            status: a.status
          })));
        }
      } catch (error) {
        console.error('Error fetching data from Supabase:', error);
      } finally {
        setLoading(false);
      }
  };

  const addMember = async (m: Omit<Member, 'id' | 'status'>, paymentInfo: { amountPaid: number, method: PaymentMethod }) => {
    // Generate a quick sequential ID or use a UUID. Here we maintain GYM-100X format.
    const numericPart = members.length > 0 ? Math.max(...members.map(mb => parseInt(mb.id.replace('GYM-', '') || '1000'))) : 1000;
    const id = `GYM-${numericPart + 1}`;
    
    const newMember: Member = { ...m, id, status: 'active' };
    
    // Optimistic UI Update
    setMembers(prev => [...prev, newMember]);
    
    if (supabase) {
      const { error } = await supabase.from('members').insert([{
        member_id: id,
        full_name: m.fullName,
        phone: m.phone,
        is_whatsapp: m.isWhatsApp,
        address: m.address,
        age: parseInt(m.age) || null,
        gender: m.gender,
        join_date: m.joinDate,
        blood_group: m.bloodGroup,
        photo_url: m.photoUrl,
        plan_type: m.planType,
        monthly_fee: m.monthlyFee,
        admission_fee: m.admissionFee,
        discount: m.discount,
        expiry_date: m.expiryDate,
        status: 'active'
      }]);

      if (error) {
        console.error("Member Insert Error:", error);
        alert(`Failed to add member to database: ${error.message}\n\nPlease make sure you have run the setup SQL in Supabase.`);
        // Rollback
        setMembers(prev => prev.filter(mb => mb.id !== id));
        return; // Don't proceed to payment if member insert fails
      }
    }
    
    if (paymentInfo.amountPaid > 0) {
      await addPayment({
        memberId: id,
        amount: paymentInfo.amountPaid,
        date: format(new Date(), 'yyyy-MM-dd'),
        method: paymentInfo.method,
        type: 'admission'
      });
    }
  };

  const updateMember = async (id: string, updates: Partial<Member>) => {
    // Save previous state for rollback
    const previousMembers = [...members];
    // Optimistic UI Update
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    
    if (supabase) {
      const dbUpdates: any = {};
      if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.isWhatsApp !== undefined) dbUpdates.is_whatsapp = updates.isWhatsApp;
      if (updates.address !== undefined) dbUpdates.address = updates.address;
      if (updates.age !== undefined) dbUpdates.age = parseInt(updates.age);
      if (updates.gender !== undefined) dbUpdates.gender = updates.gender;
      if (updates.joinDate !== undefined) dbUpdates.join_date = updates.joinDate;
      if (updates.bloodGroup !== undefined) dbUpdates.blood_group = updates.bloodGroup;
      if (updates.photoUrl !== undefined) dbUpdates.photo_url = updates.photoUrl;
      if (updates.planType !== undefined) dbUpdates.plan_type = updates.planType;
      if (updates.monthlyFee !== undefined) dbUpdates.monthly_fee = updates.monthlyFee;
      if (updates.admissionFee !== undefined) dbUpdates.admission_fee = updates.admissionFee;
      if (updates.discount !== undefined) dbUpdates.discount = updates.discount;
      if (updates.expiryDate !== undefined) dbUpdates.expiry_date = updates.expiryDate;
      if (updates.status !== undefined) dbUpdates.status = updates.status;

      const { error } = await supabase.from('members').update(dbUpdates).eq('member_id', id);
      if (error) {
        console.error("Member Update Error:", error);
        alert(`Failed to update member in database: ${error.message}`);
        setMembers(previousMembers); // Rollback
      }
    }
  };

  const deleteMember = async (id: string) => {
    const previousMembers = [...members];
    setMembers(prev => prev.filter(m => m.id !== id));
    if (supabase) {
      const { error } = await supabase.from('members').delete().eq('member_id', id);
      if (error) {
        console.error("Member Delete Error:", error);
        alert(`Failed to delete member from database: ${error.message}`);
        setMembers(previousMembers); // Rollback
      }
    }
  };

  const addPayment = async (p: Omit<Payment, 'id'>) => {
    const tempId = crypto.randomUUID();
    const newPayment = { ...p, id: tempId };
    setPayments(prev => [...prev, newPayment]);
    
    if (supabase) {
      const { data, error } = await supabase.from('payments').insert([{
        member_id: p.memberId,
        amount: p.amount,
        date: p.date,
        method: p.method,
        type: p.type
      }]).select().single();
      
      if (error) {
        console.error("Payment Insert Error:", error);
        alert(`Failed to add payment: ${error.message}`);
        setPayments(prev => prev.filter(payment => payment.id !== tempId)); // Rollback
      } else if (data) {
        setPayments(prev => prev.map(payment => payment.id === tempId ? { ...payment, id: data.id } : payment));
      }
    }
  };

  const addExpense = async (e: Omit<Expense, 'id'>) => {
    const tempId = crypto.randomUUID();
    const newExpense = { ...e, id: tempId };
    setExpenses(prev => [...prev, newExpense]);
    
    if (supabase) {
      const { data, error } = await supabase.from('expenses').insert([{
        amount: e.amount,
        date: e.date,
        category: e.category,
        description: e.description
      }]).select().single();
      
      if (error) {
        console.error("Expense Insert Error:", error);
        alert(`Failed to add expense: ${error.message}`);
        setExpenses(prev => prev.filter(ex => ex.id !== tempId)); // Rollback
      } else if (data) {
        setExpenses(prev => prev.map(ex => ex.id === tempId ? { ...ex, id: data.id } : ex));
      }
    }
  };

  const markAttendance = async (memberId: string, status: 'present' | 'absent', date: string) => {
    const existingIndex = attendance.findIndex(a => a.memberId === memberId && a.date === date);
    
    if (existingIndex >= 0) {
      const existingRecord = attendance[existingIndex];
      const newAtt = [...attendance];
      newAtt[existingIndex] = { ...newAtt[existingIndex], status };
      setAttendance(newAtt);
      
      if (supabase) {
        await supabase.from('attendance').update({ status }).eq('id', existingRecord.id);
      }
    } else {
      const tempId = crypto.randomUUID();
      setAttendance(prev => [...prev, { id: tempId, memberId, status, date }]);
      
      if (supabase) {
        const { data } = await supabase.from('attendance').insert([{
          member_id: memberId,
          date: date,
          status: status
        }]).select().single();
        
        if (data) {
          setAttendance(prev => prev.map(a => a.id === tempId ? { ...a, id: data.id } : a));
        }
      }
    }
  };

  const login = async (email: string, password: string) => {
    // Hardcoded test credentials
    if (email === 'admin@admin.com' && password === 'admin123') {
      setCurrentUser({ role: 'owner', name: 'Admin' });
      localStorage.setItem('dummy_admin_logged_in', 'true');
      fetchData();
      return;
    }

    if (!supabase) throw new Error("Supabase is not initialized.");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('dummy_admin_logged_in');
    setMembers([]);
    setPayments([]);
    setExpenses([]);
    setAttendance([]);
    setCurrentUser(null);
  };

  const value = {
    language, setLanguage,
    currentUser, login, logout,
    members, addMember, updateMember, deleteMember,
    payments, addPayment,
    expenses, addExpense,
    attendance, markAttendance,
    loading
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};
