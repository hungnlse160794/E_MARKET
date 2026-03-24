import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, Search, LogOut,
  Menu, User, ChevronDown,
  LayoutDashboard,
  Wallet
} from "lucide-react"
import { useAuthStore } from '@/stores/useAuthStore'
import { UserRole } from '@/types'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Sidebar } from '@/components/layout/Sidebar'
import { 
  Popover, 
  PopoverTrigger, 
  PopoverContent 
} from "@/components/ui/popover"

export const MainLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useAuthStore();
  const { logout } = useAuth();

  const isDashboardView = location.pathname.startsWith('/dashboard') || 
                          location.pathname.startsWith('/profile') || 
                          location.pathname.startsWith('/shop');
  const isHome = location.pathname === '/';

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <div className="flex h-screen overflow-hidden bg-primary-extralight text-text-deep font-sans">
      
      {/* Sidebar for Dashboard views */}
      <AnimatePresence mode="wait">
        {isDashboardView && user && (
          <Sidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10 w-full bg-primary-extralight">
        <header className={`h-20 ${isHome ? 'bg-white/80 backdrop-blur-md' : 'bg-white'} border-b border-slate-100 px-6 md:px-12 flex items-center justify-between shrink-0 z-30`}>
          <div className="flex items-center gap-10">
            {(isHome || !isDashboardView) ? (
              <Link to="/" className="flex items-center gap-3">
                <div className="w-8 h-8 bg-linear-to-br from-indigo-500 to-violet-500 rounded-lg shadow-sm" />
                <span className="font-serif font-bold text-xl text-slate-800">E-Market</span>
              </Link>
            ) : (
              <button 
                onClick={toggleSidebar}
                className="md:hidden p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
              >
                <Menu size={20} />
              </button>
            )}
            
            <div className="relative w-full max-w-[400px] hidden md:block">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={16} />
              </div>
              <input 
                type="text" 
                placeholder="Tìm kiếm..." 
                className="w-full h-10 bg-slate-50 rounded-full pl-11 pr-6 text-[13px] text-slate-500 outline-none border border-transparent focus:bg-white focus:border-indigo-200 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            {(isHome || !isDashboardView) && (
              <nav className="hidden lg:flex items-center gap-8 mr-4 text-[13px] font-semibold text-slate-500">
                <Link to="/" className={location.pathname === '/' ? "text-indigo-600 border-b-2 border-indigo-500 pb-1" : "hover:text-slate-700 transition-colors"}>Trang chủ</Link>
                <Link to="/products" className={location.pathname === '/products' ? "text-indigo-600 border-b-2 border-indigo-500 pb-1" : "hover:text-slate-700 transition-colors"}>Cửa hàng</Link>
                <Link to="/about" className="hover:text-slate-700 transition-colors">Giới thiệu</Link>
              </nav>
            )}

            <button className="relative text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full ring-2 ring-white" />
            </button>

            <div className="h-6 w-px bg-slate-200 mx-1" />
            
            {user && (
              <Popover>
                <PopoverTrigger asChild>
                  <div className="flex items-center gap-3 cursor-pointer group p-1 pr-3 hover:bg-slate-50 rounded-full transition-all border border-transparent hover:border-slate-200">
                    <div className="hidden sm:flex flex-col items-end text-right">
                      <span className="text-[12px] font-bold text-slate-700 group-hover:text-indigo-600 transition-colors truncate max-w-[120px]">{user.fullName}</span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-500 transition-colors">{user.role.replace('_', ' ')}</span>
                    </div>
                    <div className="relative group/avatar">
                      <div className="w-9 h-9 rounded-full bg-linear-to-br from-indigo-100 to-violet-100 border border-indigo-200 overflow-hidden shadow-sm relative z-10">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="avatar" className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute -inset-1 bg-indigo-500/20 rounded-full blur-sm opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                    </div>
                    <ChevronDown size={14} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                  </div>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-72 p-2 bg-white rounded-2xl border-slate-100 shadow-[0_20px_50px_rgba(79,70,229,0.15)] outline-none">
                  <div className="px-4 py-4 border-b border-slate-50 mb-2 bg-slate-50/50 rounded-xl">
                    <p className="text-[13px] font-bold text-slate-800 leading-tight">{user.fullName}</p>
                    <p className="text-[11px] font-medium text-slate-400 truncate opacity-80">{user.email}</p>
                    <div className="mt-2 inline-flex items-center px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-black uppercase tracking-widest">
                      {user.role}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    {user.role !== UserRole.CUSTOMER ? (
                      <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100/50 flex items-center justify-center text-indigo-600">
                          <LayoutDashboard size={14} />
                        </div>
                        Trang quản trị
                      </Link>
                    ) : (
                      <>
                        <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                          <div className="w-8 h-8 rounded-lg bg-slate-100/50 flex items-center justify-center text-slate-500">
                            <User size={14} />
                          </div>
                          Hồ sơ của tôi
                        </Link>

                        <Link to="/profile/wallet" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                           <div className="w-8 h-8 rounded-lg bg-slate-100/50 flex items-center justify-center text-slate-500">
                            <Wallet size={14} />
                          </div>
                          Ví tài chính
                        </Link>
                      </>
                    )}

                    <div className="h-px bg-slate-50 my-1 mx-2" />

                    <button 
                      onClick={() => logout()}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-rose-500 hover:bg-rose-50 transition-all"
                    >
                      <div className="w-8 h-8 rounded-lg bg-rose-100/50 flex items-center justify-center text-rose-500">
                        <LogOut size={14} />
                      </div>
                      Đăng xuất
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            )}
            {!user && (
              <div className="flex items-center gap-4">
                <Link to="/auth/login" className="text-[13px] font-bold text-slate-500">Đăng nhập</Link>
                <Link to="/auth/register" className="h-9 px-6 bg-linear-to-r from-indigo-500 to-violet-500 text-white text-[12px] font-bold rounded-full flex items-center">Đăng ký</Link>
              </div>
            )}
          </div>
        </header>

        <motion.div 
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-auto bg-primary-extralight"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  )
}
