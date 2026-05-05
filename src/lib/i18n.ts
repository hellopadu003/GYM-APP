interface Translations {
  [key: string]: {
    en: string;
    bn: string;
  };
}

export const t: Translations = {
  // Navigation
  dashboard: { en: "Dashboard", bn: "ড্যাশবোর্ড" },
  members: { en: "Members", bn: "সদস্যগণ" },
  registration: { en: "Registration", bn: "নিবন্ধন" },
  attendance: { en: "Attendance", bn: "উপস্থিতি" },
  reminders: { en: "Reminders", bn: "অনুস্মারক" },
  finance: { en: "Finance", bn: "অর্থনীতি" },
  logout: { en: "Logout", bn: "লগ আউট" },
  
  // Dashboard
  totalMembers: { en: "Total Members", bn: "মোট সদস্য" },
  activeMembers: { en: "Active Members", bn: "সক্রিয় সদস্য" },
  expiredMembers: { en: "Expired Members", bn: "মেয়াদোত্তীর্ণ সদস্য" },
  todayAttendance: { en: "Today's Attendance", bn: "আজকের উপস্থিতি" },
  monthlyRevenue: { en: "Monthly Revenue", bn: "মাসিক আয়" },
  pendingPayments: { en: "Pending Payments", bn: "বকেয়া পেমেন্ট" },
  profitOverview: { en: "Profit Overview", bn: "লাভের সারসংক্ষেপ" },

  // Forms
  fullName: { en: "Full Name", bn: "পূর্ণ নাম" },
  phone: { en: "Phone Number", bn: "ফোন নম্বর" },
  isWhatsapp: { en: "Is WhatsApp?", bn: "হোয়াটসঅ্যাপ আছে?" },
  address: { en: "Address", bn: "ঠিকানা" },
  age: { en: "Age", bn: "বয়স" },
  gender: { en: "Gender", bn: "লিঙ্গ" },
  joinDate: { en: "Join Date", bn: "যোগদানের তারিখ" },
  planType: { en: "Plan Type", bn: "প্ল্যানের ধরন" },
  monthlyFee: { en: "Monthly Fee", bn: "মাসিক ফি" },
  admissionFee: { en: "Admission Fee", bn: "ভর্তি ফি" },
  discount: { en: "Discount", bn: "ছাড়" },
  amountPaid: { en: "Amount Paid", bn: "পরিশোধিত অর্থ" },
  paymentMethod: { en: "Payment Method", bn: "পেমেন্ট মাধ্যম" },
  submit: { en: "Submit", bn: "জমা দিন" },
  
  // Actions
  search: { en: "Search...", bn: "অনুসন্ধান..." },
  present: { en: "Present", bn: "উপস্থিত" },
  absent: { en: "Absent", bn: "অনুপস্থিত" },
};
