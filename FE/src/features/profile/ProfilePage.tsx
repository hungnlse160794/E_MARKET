import { 
  User, ShieldCheck, SlidersHorizontal, CreditCard, Store, 
  Pencil, BadgeCheck, Github, Linkedin, MonitorPlay, 
  Settings, ChevronDown, Monitor 
} from "lucide-react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { profileSchema, type ProfileInput, preferencesSchema, type PreferencesInput } from "@/schemas/profileSchema"
import { toast } from "sonner"
import { useAuthStore } from "@/stores/useAuthStore"
import { useEffect } from "react"

export default function ProfilePage() {
  const { user } = useAuthStore();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || "Julian Vane",
      email: user?.email || "j.vane@digitalcurator.com",
      phone: user?.phone || "+1 (555) 892-0432",
      location: "Geneva, Switzerland",
      bio: "Specializing in high-end horology and digital assets. Managing a private collection of over 400 unique vendor contracts."
    }
  });

  const prefForm = useForm<PreferencesInput>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      language: "English (UK)",
      currency: "USD ($)",
      visualTheme: "LIGHT"
    }
  });

  useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || "",
        location: "Geneva, Switzerland",
        bio: "Specializing in high-end horology and digital assets. Managing a private collection of over 400 unique vendor contracts."
      });
    }
  }, [user, reset]);

  const onProfileSubmit = (data: ProfileInput) => {
    console.log("Saving Profile:", data);
    toast.success("Hồ sơ đã được cập nhật thành công!");
  };

  return (
    <div className="min-h-screen bg-[#F9F8F4] font-sans text-[#1a1f2c] pt-[90px]">
      <div className="max-w-[1400px] mx-auto flex h-full">
        
        {/* Sidebar Navigation */}
        <div className="w-[300px] bg-[#F9F8F4] h-full min-h-[calc(100vh-90px)] flex flex-col pt-10 pb-8 sticky top-[90px] hidden md:flex">
          <div className="px-10 mb-10">
            <h2 className="text-[#8C7654] text-[22px] font-serif mb-1 tracking-tight">Executive Profile</h2>
            <p className="text-[#9CA3AF] text-[10px] font-bold tracking-widest uppercase mb-1">PREMIUM MEMBER</p>
          </div>

          <nav className="flex-1 px-5 space-y-1">
            <a href="#" className="flex items-center gap-4 bg-white px-5 py-4 rounded-xl text-[#1A1F2C] font-bold text-[13px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] border-none mb-4">
              <User size={18} className="text-[#4B5563]" fill="currentColor" /> Profile Overview
            </a>
            <a href="#" className="flex items-center gap-4 px-5 py-4 rounded-xl text-[#374151] font-semibold text-[13px] hover:bg-[#F3F1EC] transition-colors mb-2">
              <ShieldCheck size={18} className="text-[#6B7280]" fill="currentColor" /> Security
            </a>
            <a href="#" className="flex items-center gap-4 px-5 py-4 rounded-xl text-[#374151] font-semibold text-[13px] hover:bg-[#F3F1EC] transition-colors mb-2">
              <SlidersHorizontal size={18} className="text-[#6B7280]" /> Preferences
            </a>
            <a href="#" className="flex items-center gap-4 px-5 py-4 rounded-xl text-[#374151] font-semibold text-[13px] hover:bg-[#F3F1EC] transition-colors mb-2">
              <CreditCard size={18} className="text-[#4B5563]" fill="currentColor" strokeWidth={0} /> Payment Methods
            </a>
            <a href="#" className="flex items-center gap-4 px-5 py-4 rounded-xl text-[#374151] font-semibold text-[13px] hover:bg-[#F3F1EC] transition-colors mb-2">
              <Store size={18} className="text-[#6B7280]" fill="currentColor" /> Vendor Access
            </a>
          </nav>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 pl-12 pr-12 py-10 w-full overflow-hidden">
          
          {/* Header */}
          <div className="flex items-start justify-between mb-[50px] pt-2 px-2 flex-wrap gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="h-[130px] w-[130px] rounded-[10px] overflow-hidden bg-[#1A1F2C]">
                  <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300" alt="Julian Vane" className="w-full h-full object-cover mix-blend-luminosity" />
                </div>
                <button className="absolute -bottom-3 -right-3 h-[30px] w-[30px] bg-white rounded-full flex items-center justify-center shadow-md text-[#4B5563] hover:text-[#8C7654] transition-colors z-10">
                  <Pencil size={12} fill="currentColor" />
                </button>
              </div>
              
              <div className="pt-2">
                <h1 className="text-[#1A1F2C] text-[52px] font-serif font-normal leading-[1.1] mb-2 tracking-tight">{user?.fullName || "Julian Vane"}</h1>
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <span className="text-[#4B5563] text-[15px] font-semibold">Executive Curator</span>
                  <span className="w-[3px] h-[3px] bg-[#D1D5DB] shrink-0" />
                  <span className="bg-[#EAE8E4] text-[#4B5563] text-[9px] font-bold px-3 py-1.5 uppercase tracking-widest rounded-sm">PREMIUM MEMBER</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8 mt-12 pr-4">
              <button onClick={() => reset()} className="text-[#4B5563] text-[14px] font-semibold hover:text-[#1A1F2C] transition-colors">
                Cancel
              </button>
              <button 
                onClick={handleSubmit(onProfileSubmit)}
                disabled={!isDirty}
                className={`bg-[#A18A68] hover:bg-[#8F7959] text-white text-[10px] font-bold tracking-widest uppercase px-6 py-3.5 rounded-[4px] transition-colors ${!isDirty && 'opacity-50 cursor-not-allowed'}`}
              >
                SAVE CHANGES
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              
              {/* Personal Information */}
              <div className="bg-white rounded-[16px] p-8 border border-white pt-10 px-10">
                <div className="flex items-center gap-4 mb-10 text-[#8C7654]">
                  <BadgeCheck size={24} fill="currentColor" className="text-[#8C7654] bg-[#F9F8F4] overflow-hidden rounded-md" />
                  <h2 className="text-[26px] font-serif tracking-tight">Personal Information</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1 pl-1">FULL NAME</label>
                    <input 
                      type="text" 
                      {...register("fullName")}
                      className={`w-full h-12 bg-[#F6F5F2] border-none rounded-lg px-5 text-[#1A1F2C] text-[13px] font-medium outline-none focus:ring-2 focus:ring-[#A18A68]/20 transition-all ${errors.fullName && 'ring-2 ring-rose-500/20'}`}
                    />
                    {errors.fullName && <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest pl-1">{errors.fullName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1 pl-1">EMAIL ADDRESS</label>
                    <input 
                      type="email" 
                      {...register("email")}
                      className={`w-full h-12 bg-[#F6F5F2] border-none rounded-lg px-5 text-[#1A1F2C] text-[13px] font-medium outline-none focus:ring-2 focus:ring-[#A18A68]/20 transition-all ${errors.email && 'ring-2 ring-rose-500/20'}`}
                    />
                    {errors.email && <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest pl-1">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1 pl-1">PHONE NUMBER</label>
                    <input 
                      type="text" 
                      {...register("phone")}
                      className={`w-full h-12 bg-[#F6F5F2] border-none rounded-lg px-5 text-[#1A1F2C] text-[13px] font-medium outline-none focus:ring-2 focus:ring-[#A18A68]/20 transition-all ${errors.phone && 'ring-2 ring-rose-500/20'}`}
                    />
                    {errors.phone && <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest pl-1">{errors.phone.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1 pl-1">LOCATION</label>
                    <input 
                      type="text" 
                      {...register("location")}
                      className="w-full h-12 bg-[#F6F5F2] border-none rounded-lg px-5 text-[#1A1F2C] text-[13px] font-medium outline-none focus:ring-2 focus:ring-[#A18A68]/20 transition-all"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-2 space-y-2">
                    <label className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1 pl-1">PROFESSIONAL BIO</label>
                    <textarea 
                      {...register("bio")}
                      className="w-full h-24 bg-[#F6F5F2] border-none rounded-lg p-5 text-[#1A1F2C] text-[14px] font-medium outline-none resize-none leading-relaxed focus:ring-2 focus:ring-[#A18A68]/20 transition-all"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 
                 {/* Security */}
                 <div className="bg-[#FAF8F4] rounded-[16px] p-8 mt-6">
                    <div className="flex items-center gap-4 mb-10 text-[#8C7654]">
                      <ShieldCheck size={24} fill="currentColor" />
                      <h2 className="text-[26px] font-serif tracking-tight">Security</h2>
                    </div>

                    <div className="mb-10 w-full overflow-hidden">
                      <div className="flex items-center justify-between mb-8 pr-2">
                        <div>
                          <h3 className="text-[#1A1F2C] text-[14px] font-bold mb-1">Two-Factor Auth</h3>
                          <p className="text-[#6B7280] text-[11px] font-medium truncate">Secure your account access</p>
                        </div>
                        {/* Toggle Switch */}
                        <div className="w-[42px] min-w-[42px] h-6 bg-[#6B5A40] rounded-full relative cursor-pointer flex items-center shrink-0">
                          <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 shadow-sm" />
                        </div>
                      </div>

                      <button className="w-full md:w-[95%] bg-white text-[#1A1F2C] hover:bg-[#F6F5F2] text-[11px] font-bold tracking-[0.15em] uppercase py-3.5 rounded shadow-sm transition-colors mb-2 truncate">
                        CHANGE PASSWORD
                      </button>
                    </div>

                    <div>
                      <h3 className="text-[#6B7280] text-[10px] font-bold uppercase tracking-widest mb-4">ACTIVE SESSIONS</h3>
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 pr-6 bg-white rounded-lg shadow-sm border border-[#EAE8E4]/50 w-full overflow-hidden">
                        <Monitor size={20} className="text-[#8C7654] shrink-0" fill="currentColor" strokeWidth={0} />
                        <div className="pt-0.5 overflow-hidden">
                          <p className="text-[#1A1F2C] text-[13px] font-semibold mb-1 leading-tight truncate">MacOS - Geneva, CH</p>
                          <p className="text-[#9CA3AF] text-[10px] uppercase font-medium leading-none truncate">Current Session</p>
                        </div>
                      </div>
                    </div>
                 </div>

                 {/* Preferences */}
                 <div className="bg-[#FAF8F4] rounded-[16px] p-8 mt-6">
                    <div className="flex items-center gap-4 mb-10 text-[#8C7654]">
                      <Settings size={24} fill="currentColor" />
                      <h2 className="text-[26px] font-serif tracking-tight">Preferences</h2>
                    </div>

                    <div className="space-y-6 w-full">
                      <div className="w-full">
                        <label className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-3">LANGUAGE</label>
                        <div className="relative w-full md:w-[95%]">
                          <select 
                            {...prefForm.register("language")}
                            className="w-full h-11 bg-white border-transparent rounded-[4px] px-5 pr-10 text-[#1A1F2C] text-[13px] font-semibold outline-none appearance-none cursor-pointer shadow-sm truncate"
                          >
                            <option>English (UK)</option>
                            <option>French</option>
                            <option>German</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" strokeWidth={3} />
                        </div>
                      </div>

                      <div className="w-full">
                         <label className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-3">CURRENCY</label>
                         <div className="relative w-full md:w-[95%]">
                           <select 
                             {...prefForm.register("currency")}
                             className="w-full h-11 bg-white border-transparent rounded-[4px] px-5 pr-10 text-[#1A1F2C] text-[13px] font-semibold outline-none appearance-none cursor-pointer shadow-sm truncate"
                           >
                             <option>USD ($)</option>
                             <option>EUR (€)</option>
                             <option>CHF (Fr)</option>
                           </select>
                           <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" strokeWidth={3} />
                         </div>
                      </div>

                      <div className="pt-2 w-full">
                        <label className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-3">VISUAL THEME</label>
                        <Controller
                          control={prefForm.control}
                          name="visualTheme"
                          render={({ field }) => (
                            <div className="flex gap-4 w-full md:w-[95%]">
                               <button 
                                 type="button"
                                 onClick={() => field.onChange("LIGHT")}
                                 className={`flex-1 border text-[10px] font-bold uppercase tracking-widest py-[10px] px-2 rounded shadow-sm truncate transition-all ${field.value === 'LIGHT' ? 'bg-white border-[#A18A68] text-[#A18A68]' : 'bg-slate-50 border-transparent text-slate-400'}`}
                               >
                                 LIGHT
                               </button>
                               <button 
                                 type="button"
                                 onClick={() => field.onChange("DARK")}
                                 className={`flex-1 border text-[10px] font-bold uppercase tracking-widest py-[10px] px-2 rounded shadow-md transition-all ${field.value === 'DARK' ? 'bg-[#1A1F2C] border-transparent text-white' : 'bg-slate-50 border-transparent text-slate-400'}`}
                               >
                                 DARK
                               </button>
                            </div>
                          )}
                        />
                      </div>
                    </div>
                 </div>

              </div>
            </div>

            {/* Right Column */}
            <div className="pb-16 w-full max-w-[400px] lg:max-w-none mx-auto lg:mx-0 overflow-hidden">
              
              {/* Linked Accounts */}
              <div className="bg-white rounded-[16px] p-8 border border-white pt-10 px-6 sm:px-8 mb-8">
                <h2 className="text-[26px] font-serif text-[#8C7654] mb-8 truncate">Linked Accounts</h2>

                <div className="space-y-4">
                  {/* GitHub Link */}
                  <div className="flex items-center justify-between p-4 bg-[#FDFCFA] rounded-xl border border-[#F3F1EC] gap-2 overflow-hidden">
                    <div className="flex items-center gap-3 sm:gap-5 overflow-hidden">
                      <div className="w-10 h-10 min-w-[40px] bg-[#1A1F2C] flex items-center justify-center rounded-lg text-white">
                        <Github size={20} fill="currentColor" />
                      </div>
                      <span className="text-[#1A1F2C] text-[13px] font-bold truncate">GitHub</span>
                    </div>
                    <span className="text-[#A18A68] text-[9px] font-black uppercase tracking-widest px-2 sm:px-3 text-right">LINKED</span>
                  </div>

                  {/* Meta Business */}
                  <div className="flex items-center justify-between p-4 bg-[#FDFCFA] rounded-xl border border-[#F3F1EC] gap-2 overflow-hidden">
                    <div className="flex items-center gap-3 sm:gap-5 overflow-hidden">
                      <div className="w-10 h-10 min-w-[40px] bg-[#1877F2] flex items-center justify-center rounded-lg text-white">
                        <MonitorPlay size={20} fill="currentColor" strokeWidth={0} />
                      </div>
                      <span className="text-[#1A1F2C] text-[13px] font-bold leading-tight truncate max-w-[60px] sm:max-w-none">Meta Business</span>
                    </div>
                    <button className="text-[#6B7280] text-[9px] font-black uppercase tracking-widest px-2 hover:text-[#1A1F2C] transition-colors text-right">CONNECT</button>
                  </div>

                  {/* LinkedIn */}
                  <div className="flex items-center justify-between p-4 bg-[#FDFCFA] rounded-xl border border-[#F3F1EC] gap-2 overflow-hidden">
                    <div className="flex items-center gap-3 sm:gap-5 overflow-hidden">
                      <div className="w-10 h-10 min-w-[40px] bg-[#0A66C2] flex items-center justify-center rounded-lg text-white">
                        <Linkedin size={20} fill="currentColor" strokeWidth={0} />
                      </div>
                      <span className="text-[#1A1F2C] text-[13px] font-bold truncate">LinkedIn</span>
                    </div>
                    <span className="text-[#A18A68] text-[9px] font-black uppercase tracking-widest px-2 sm:px-3 text-right">LINKED</span>
                  </div>
                </div>
              </div>

              {/* Profile Verification */}
              <div className="bg-[#FAF8F4] rounded-[16px] p-8 pt-10 pb-0 mt-6 overflow-hidden">
                <h2 className="text-[#4B5563] text-[12px] font-bold uppercase tracking-[0.2em] mb-8 truncate">PROFILE VERIFICATION</h2>

                <div className="flex flex-col px-1">
                  <div className="flex flex-row items-end justify-between mb-3 w-full pr-2">
                    <span className="text-[#8C7654] text-[52px] font-serif leading-[0.8] pr-2 tracking-tight">85%</span>
                    <span className="text-[#4B5563] text-[10px] font-bold tracking-tight translate-y-[2px] truncate max-w-[90px]">Almost complete</span>
                  </div>

                  <div className="w-full h-[5px] bg-[#EAE8E4] mb-8 relative z-10">
                    <div className="h-full bg-[#8C7654] w-[85%]" />
                  </div>

                  <p className="text-[#4B5563] text-[13px] leading-relaxed mb-6 pr-4">
                    Complete your bank verification<br/>to unlock full vendor payout<br/>capabilities.
                  </p>

                  <button className="w-full sm:w-[90%] mx-auto bg-white text-[#8C7654] hover:bg-[#F3F1EC] text-[10px] font-bold tracking-widest uppercase py-[12px] rounded shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-colors mb-8 sm:mr-6 truncate px-2">
                    COMPLETE SETUP
                  </button>
                </div>

                <div className="flex justify-center border-t border-[#EAE8E4] py-5 mx-[-32px] bg-[#EBE9E4] mt-4">
                  <div className="flex items-center gap-2">
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#8C7654] shrink-0"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                     <span className="text-[#4B5563] text-[10px] font-bold uppercase tracking-widest truncate">VERIFIED DIGITAL CURATOR</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
