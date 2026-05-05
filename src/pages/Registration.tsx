import React, { useState, useRef } from 'react';
import { useAppContext, PaymentMethod, Member } from '../store';
import { t } from '../lib/i18n';
import { format, addMonths, addYears } from 'date-fns';
import { Check, Info, Camera, Upload } from 'lucide-react';

export function Registration() {
  const { language, addMember } = useAppContext();
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    isWhatsApp: false,
    address: '',
    age: '',
    gender: 'Male',
    joinDate: format(new Date(), 'yyyy-MM-dd'),
    bloodGroup: '',
    photoUrl: '',
    planType: 'monthly' as Member['planType'],
    monthlyFee: 2000,
    admissionFee: 1000,
    discount: 0,
    amountPaid: 3000,
    paymentMethod: 'Cash' as PaymentMethod,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // @ts-ignore
    const finalValue = type === 'checkbox' ? e.target.checked : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateExpiry = () => {
    const start = new Date(formData.joinDate);
    if (formData.planType === 'monthly') return format(addMonths(start, 1), 'yyyy-MM-dd');
    if (formData.planType === 'yearly') return format(addYears(start, 1), 'yyyy-MM-dd');
    return format(addMonths(start, 1), 'yyyy-MM-dd'); // default to 1 month for custom
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expiryDate = calculateExpiry();
    
    addMember({
      fullName: formData.fullName,
      phone: formData.phone,
      isWhatsApp: formData.isWhatsApp,
      address: formData.address,
      age: formData.age,
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      photoUrl: formData.photoUrl,
      joinDate: formData.joinDate,
      planType: formData.planType,
      monthlyFee: Number(formData.monthlyFee),
      admissionFee: Number(formData.admissionFee),
      discount: Number(formData.discount),
      expiryDate,
    }, {
      amountPaid: Number(formData.amountPaid),
      method: formData.paymentMethod,
    });

    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    // Reset basic fields
    setFormData(prev => ({ ...prev, fullName: '', phone: '', address: '', age: '', photoUrl: '' }));
  };

  return (
    <div className="max-w-3xl mx-auto">
      {success && (
        <div className="mb-6 p-4 bg-green-50 text-green-800 rounded-xl flex items-center border border-green-200">
          <Check className="w-5 h-5 mr-3 text-green-500" />
          Member Registered Successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Details */}
        <div className="card p-6 md:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-semibold text-slate-900">Personal Details</h2>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Photo Upload Section */}
            <div className="flex flex-col items-center space-y-3 shrink-0">
              <div 
                className="w-32 h-32 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-300 cursor-pointer hover:border-indigo-500 transition-colors relative group"
                onClick={() => fileInputRef.current?.click()}
              >
                {formData.photoUrl ? (
                  <img src={formData.photoUrl} alt="Member preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Upload className="w-6 h-6 text-white" />
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoUpload} 
                accept="image/*" 
                className="hidden" 
              />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Photo</span>
            </div>

            {/* Form Fields */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">{t.fullName[language]} *</label>
                <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-shadow" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t.phone[language]} *</label>
                <div className="flex items-center gap-4">
                  <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-shadow" />
                  <label className="flex items-center whitespace-nowrap text-sm text-slate-600 shrink-0">
                    <input type="checkbox" name="isWhatsApp" checked={formData.isWhatsApp} onChange={handleChange} className="rounded text-indigo-600 focus:ring-indigo-600 w-4 h-4 mr-2" />
                    WhatsApp
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t.joinDate[language]}</label>
                <input type="date" required name="joinDate" value={formData.joinDate} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-shadow" />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">{t.address[language]}</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-shadow" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t.age[language]}</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-shadow" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t.gender[language]}</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-shadow">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Blood Group</label>
                <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-shadow">
                  <option value="">Select...</option>
                  <option value="A+">A+</option><option value="A-">A-</option>
                  <option value="B+">B+</option><option value="B-">B-</option>
                  <option value="O+">O+</option><option value="O-">O-</option>
                  <option value="AB+">AB+</option><option value="AB-">AB-</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription & Payment Details */}
        <div className="card p-6 md:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center">
            <h2 className="text-lg font-semibold text-slate-900 mr-2">Subscription & Payment</h2>
            <Info className="w-4 h-4 text-slate-400" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t.planType[language]}</label>
              <select name="planType" value={formData.planType} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-shadow">
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t.monthlyFee[language]}</label>
              <input type="number" required name="monthlyFee" value={formData.monthlyFee} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-mono" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t.admissionFee[language]}</label>
              <input type="number" required name="admissionFee" value={formData.admissionFee} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-mono" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t.discount[language]}</label>
              <input type="number" name="discount" value={formData.discount} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 text-green-700">Total Payable</label>
              <div className="w-full px-4 py-2 border border-slate-200 bg-white rounded-xl font-mono font-bold text-slate-900">
                ৳{(Number(formData.monthlyFee) + Number(formData.admissionFee) - Number(formData.discount)).toLocaleString()}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t.amountPaid[language]} *</label>
              <input type="number" required name="amountPaid" value={formData.amountPaid} onChange={handleChange} className="w-full px-4 py-2 border border-indigo-600 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-mono bg-indigo-50" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t.paymentMethod[language]}</label>
              <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-shadow">
                <option value="Cash">Cash</option>
                <option value="bKash">bKash</option>
                <option value="Nagad">Nagad</option>
                <option value="Upay">Upay</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5">
            Register Member
          </button>
        </div>
      </form>
    </div>
  );
}
