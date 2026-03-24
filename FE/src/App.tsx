import { Toaster } from 'sonner';
import { useAuthInit } from '@/features/auth/hooks/useAuthInit';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useSocket } from '@/hooks/useSocket';
import { AppRouter } from '@/routes/Router';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  const { isInitializing } = useAuthInit();
  
  // Khởi chạy Socket lắng nghe sự kiện
  useSocket();

  if (isInitializing) {
     return (
       <div className="flex h-screen w-screen items-center justify-center bg-[#F8F9FC]">
          <div className="text-center space-y-6">
             <div className="relative h-16 w-16 mx-auto">
                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
                <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
             </div>
             <div className="space-y-2">
                <p className="text-slate-400 uppercase tracking-[0.3em] text-[10px] font-bold animate-pulse">Đang khởi tạo hệ thống...</p>
                <h1 className="font-serif font-bold text-xl text-slate-800 tracking-tight">E-Market Premium</h1>
             </div>
          </div>
       </div>
     );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <Toaster richColors position="top-right" closeButton />
      <AppRouter />
      <ReactQueryDevtools initialIsOpen={false} />
    </TooltipProvider>
  );
}

export default App;
