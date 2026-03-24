import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ShoppingBag, 
  LayoutDashboard, 
  Package, 
  BarChart3, 
  Megaphone, 
  Settings, 
  Wallet, 
  LogOut,
  ChevronLeft, 
  ChevronRight, 
  User, 
  Building2, 
  Users, 
  ClipboardList,
  Home, 
  Store, 
  Layers,
  type LucideIcon
} from "lucide-react"
import { useAuthStore } from '@/stores/useAuthStore'
import { UserRole } from '@/types'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
  roles: string[];
}

interface NavSection {
  title: string;
  roles: string[];
  items: NavItem[];
}

const SIDEBAR_NAV_GROUPS: NavSection[] = [
  {
    title: "Hệ thống",
    roles: [UserRole.PLATFORM_ADMIN],
    items: [
      { icon: LayoutDashboard, label: "Tổng quan", href: "/dashboard", roles: [UserRole.PLATFORM_ADMIN] },
      { icon: Store, label: "Quản lý Shop", href: "/dashboard/shops", roles: [UserRole.PLATFORM_ADMIN] },
      { icon: Users, label: "Người dùng", href: "/dashboard/customers", roles: [UserRole.PLATFORM_ADMIN] },
    ]
  },
  {
    title: "Cửa hàng",
    roles: [UserRole.SHOP_OWNER, UserRole.BRANCH_MANAGER],
    items: [
      { icon: LayoutDashboard, label: "Tổng quan", href: "/dashboard", roles: [UserRole.SHOP_OWNER, UserRole.BRANCH_MANAGER] },
      { icon: Store, label: "Cửa hàng của tôi", href: "/shop", roles: [UserRole.SHOP_OWNER] },
      { icon: Building2, label: "Chi nhánh", href: "/dashboard/branches", roles: [UserRole.SHOP_OWNER] },
      { icon: Package, label: "Sản phẩm", href: "/dashboard/catalog", roles: [UserRole.SHOP_OWNER, UserRole.BRANCH_MANAGER] },
      { icon: Layers, label: "Danh mục", href: "/dashboard/categories", roles: [UserRole.SHOP_OWNER, UserRole.BRANCH_MANAGER] },
      { icon: ClipboardList, label: "Kho hàng", href: "/dashboard/inventory", roles: [UserRole.SHOP_OWNER, UserRole.BRANCH_MANAGER] },
      { icon: ShoppingBag, label: "Đơn hàng", href: "/dashboard/orders", roles: [UserRole.SHOP_OWNER, UserRole.BRANCH_MANAGER, UserRole.STAFF] },
      { icon: Users, label: "Nhân viên", href: "/dashboard/staff", roles: [UserRole.SHOP_OWNER] },
    ]
  },
  {
    title: "Kinh doanh",
    roles: [UserRole.SHOP_OWNER],
    items: [
      { icon: Megaphone, label: "Marketing", href: "/dashboard/marketing", roles: [UserRole.SHOP_OWNER] },
      { icon: Wallet, label: "Ví & Tài chính", href: "/dashboard/finances", roles: [UserRole.SHOP_OWNER] },
      { icon: BarChart3, label: "Báo cáo", href: "/dashboard/analytics", roles: [UserRole.SHOP_OWNER] },
    ]
  },
  {
    title: "Cá nhân",
    roles: [UserRole.CUSTOMER, UserRole.SHOP_OWNER, UserRole.BRANCH_MANAGER, UserRole.STAFF],
    items: [
      { icon: Wallet, label: "Ví của tôi", href: "/profile/wallet", roles: [UserRole.CUSTOMER] },
      { icon: ShoppingBag, label: "Đơn hàng của tôi", href: "/profile/orders", roles: [UserRole.CUSTOMER] },
      { icon: User, label: "Hồ sơ cá nhân", href: "/profile", roles: [UserRole.CUSTOMER, UserRole.SHOP_OWNER, UserRole.BRANCH_MANAGER, UserRole.STAFF] },
    ]
  }
];

export const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  const location = useLocation();
  const { user } = useAuthStore();
  const { logout } = useAuth();

  const filteredGroups = SIDEBAR_NAV_GROUPS.map(group => ({
    ...group,
    items: group.items.filter(item => user && item.roles.includes(user.role as string))
  })).filter(group => group.items.length > 0);

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      className="bg-white border-r border-slate-100 flex flex-col justify-between shrink-0 h-full relative z-20 shadow-sm"
    >
      <button 
        onClick={onToggle}
        className="absolute top-10 -right-4 z-40 h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-300 shadow-lg hover:shadow-indigo-100 ring-4 ring-slate-50/50 transition-all group/toggle cursor-pointer"
      >
        {isCollapsed ? (
          <ChevronRight size={16} className="group-hover/toggle:translate-x-0.5 transition-transform" />
        ) : (
          <ChevronLeft size={16} className="group-hover/toggle:-translate-x-0.5 transition-transform" />
        )}
      </button>

      <div className="flex flex-col h-full overflow-hidden">
        {/* Brand */}
        <motion.div 
          animate={{ 
            paddingLeft: isCollapsed ? 0 : 32,
            paddingRight: isCollapsed ? 0 : 32,
            justifyContent: isCollapsed ? 'center' : 'flex-start'
          }}
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          className="h-20 flex items-center border-b border-slate-100 gap-3 shrink-0"
        >
          <div className="flex flex-col gap-0.5 mt-1 shrink-0">
            <div className="flex gap-0.5"><div className="w-2.5 h-2.5 bg-indigo-500 rounded-sm"/><div className="w-2.5 h-2.5 bg-violet-400 rounded-sm"/></div>
            <div className="flex gap-0.5"><div className="w-2.5 h-2.5 bg-teal-400 rounded-sm"/><div className="w-2.5 h-2.5 bg-indigo-300 rounded-sm"/></div>
          </div>
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col justify-center"
            >
              <Link to="/" className="flex flex-col">
                <span className="font-serif font-bold text-[18px] text-slate-800 tracking-tight leading-none mb-1 uppercase">E-Market</span>
                <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest leading-none">PREMIUM SELLER</span>
              </Link>
            </motion.div>
          )}
        </motion.div>

        {/* Navigation */}
        <div className="py-6 px-4 space-y-8 font-medium flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <Link to="/" className={cn(
            "relative flex items-center h-14 py-3 mb-4 rounded-xl text-[13px] font-bold text-slate-600 border border-slate-100 shadow-sm transition-all group/home",
            isCollapsed ? 'justify-center bg-white' : 'bg-slate-50 hover:bg-slate-100 hover:border-indigo-100 hover:text-indigo-600 px-4'
          )}>
            <Home size={18} className={isCollapsed ? 'shrink-0 group-hover/home:text-indigo-600' : 'mr-4 shrink-0'} />
            {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">Quay về Trang chủ</span>}
          </Link>

          {filteredGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-3">
              {!isCollapsed && (
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] px-4 mb-3">{group.title}</p>
              )}
              <div className="space-y-1">
                {group.items.map((item, idx) => {
                  const isActive = location.pathname === item.href || 
                    (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                  
                  const navLink = (
                    <Link 
                      key={idx} 
                      to={item.href}
                      className="relative flex items-center h-14 py-3 rounded-xl text-[13px] font-semibold group/nav"
                    >
                      <motion.div 
                        animate={{
                          paddingLeft: isCollapsed ? 0 : 16,
                          paddingRight: isCollapsed ? 0 : 16,
                          justifyContent: isCollapsed ? 'center' : 'flex-start',
                          color: isActive ? '#4f46e5' : '#64748b'
                        }}
                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                        className="flex items-center w-full h-full gap-4 relative z-10"
                      >
                        {isActive && (
                          <motion.div 
                            layoutId="sidebar-active-pill"
                            className="absolute inset-0 bg-indigo-50/80 border border-indigo-100/50 rounded-xl -z-10"
                          />
                        )}
                        <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                        {!isCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="whitespace-nowrap overflow-hidden"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </motion.div>
                    </Link>
                  );

                  if (isCollapsed) {
                    return (
                      <Tooltip key={idx}>
                        <TooltipTrigger asChild>{navLink}</TooltipTrigger>
                        <TooltipContent side="right" className="font-bold text-[10px] uppercase tracking-widest">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }
                  return navLink;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className={cn("p-4 border-t border-slate-100 space-y-1 shrink-0", isCollapsed && "items-center flex flex-col")}>
        <button 
          onClick={logout}
          className={cn(
            "w-full flex items-center gap-4 py-3 text-[13px] font-semibold text-rose-500 hover:bg-rose-50 rounded-xl transition-all group",
            isCollapsed ? "justify-center px-0" : "px-4"
          )}
        >
          <LogOut size={18} />
          {!isCollapsed && <span>Đăng xuất</span>}
        </button>
        
        <Link 
          to="/profile" 
          className={cn(
            "w-full flex items-center gap-4 py-3 text-[13px] font-semibold text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all group",
            isCollapsed ? "justify-center px-0" : "px-4"
          )}
        >
          <Settings size={18} />
          {!isCollapsed && <span>Cài đặt</span>}
        </Link>
      </div>
    </motion.aside>
  );
};
