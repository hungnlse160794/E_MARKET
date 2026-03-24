import { Bar, BarChart, XAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface RevenueChartProps {
  data: {
    month: string;
    projected: number;
    actual: number;
  }[];
}

const chartConfig = {
  actual: {
    label: "Doanh thu thực tế",
    color: "hsl(var(--indigo-500))",
  },
  projected: {
    label: "Dự kiến",
    color: "hsl(var(--slate-200))",
  },
} satisfies ChartConfig

export const RevenueChart = ({ data }: RevenueChartProps) => {
  return (
    <div className="h-full flex flex-col bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className="p-8 pb-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight uppercase">Dòng chảy kinh tế</h3>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Theo dõi doanh thu thời gian thực.</p>
          </div>
          
          <div className="flex bg-slate-50 border border-slate-100 p-1 rounded-xl">
              {['24H', '7N', '30N'].map(t => (
                  <button key={t} className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${t === '30N' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                      {t}
                  </button>
              ))}
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 min-h-[300px]">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart accessibilityLayer data={data} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value}
                fontSize={10}
                fontWeight={700}
                stroke="rgba(0,0,0,0.3)"
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar
                dataKey="actual"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
                animationDuration={800}
                animationEasing="ease-out"
              />
              <Bar
                dataKey="projected"
                fill="#e2e8f0"
                radius={[4, 4, 0, 0]}
                animationDuration={1000}
                animationEasing="ease-out"
                opacity={0.4}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <div className="p-8 pt-4 flex items-center justify-between border-t border-slate-50">
          <div className="flex items-center gap-8">
              <div className="flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-sm shadow-indigo-200" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Doanh thu thực tế</span>
              </div>
              <div className="flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-slate-200" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dự kiến</span>
              </div>
          </div>
          <button className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">
              Xem chi tiết
          </button>
      </div>
    </div>
  )
}
