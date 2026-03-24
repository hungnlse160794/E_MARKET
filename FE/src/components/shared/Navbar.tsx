import { ShoppingCart, Bell, User } from "lucide-react"
import { Link } from "react-router-dom"
import { PATHS } from "@/routes/paths"
import { useAuthStore } from "@/stores/useAuthStore"

export function Navbar() {
  const { user } = useAuthStore()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F9F8F4]">
      <div className="max-w-[1400px] mx-auto h-[90px] px-8 flex items-center justify-between">
        
        {/* Left Section: Logo */}
        <Link to="/" className="flex items-center">
          <span className="text-[26px] font-serif text-[#8C7654] italic tracking-tight">The Digital Curator</span>
        </Link>

        {/* Center: Navigation */}
        <div className="hidden md:flex items-center gap-12 pl-16">
          <Link to="/" className="text-[14px] font-semibold text-[#4B5563] hover:text-[#1A1F2C] transition-colors">Gallery</Link>
          <Link to="/" className="text-[14px] font-semibold text-[#4B5563] hover:text-[#1A1F2C] transition-colors">Vendors</Link>
          <Link to="/" className="text-[14px] font-semibold text-[#4B5563] hover:text-[#1A1F2C] transition-colors">Archive</Link>
          <Link to="/" className="text-[14px] font-semibold text-[#4B5563] hover:text-[#1A1F2C] transition-colors">Orders</Link>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-8 pr-12">
          <button className="text-[#4B5563] hover:text-[#8C7654] transition-colors relative">
            <Bell size={20} fill="currentColor" className="text-[#4B5563]" />
          </button>

          <Link to={PATHS.CART} className="text-[#4B5563] hover:text-[#8C7654] transition-colors relative">
             <ShoppingCart size={20} fill="currentColor" className="text-[#4B5563]" strokeWidth={0} />
          </Link>

          {user ? (
            <Link to={PATHS.PROFILE}>
              <div className="h-9 w-9 rounded-full bg-[#E5D2BA] overflow-hidden shadow-sm hover:scale-105 transition-transform flex items-center justify-center">
                 <User size={20} className="text-[#8C7654]" fill="currentColor" strokeWidth={0} />
              </div>
            </Link>
          ) : (
            <Link to={PATHS.AUTH.LOGIN}>
              <div className="h-9 w-9 rounded-full bg-[#E5D2BA] overflow-hidden shadow-sm hover:scale-105 transition-transform flex items-center justify-center">
                 <User size={20} className="text-[#8C7654]" fill="currentColor" strokeWidth={0} />
              </div>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
