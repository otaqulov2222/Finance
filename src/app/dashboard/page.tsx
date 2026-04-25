"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet,
  Calendar,
  ChevronRight,
  Zap
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    // Har 15 soniyada statistikani yangilab turish
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <Zap className="h-8 w-8 animate-pulse text-primary" />
    </div>
  );

  const formatValue = (value: number) => {
    if (data?.currency === 'USD') {
      return `$${(value / data.usdRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${value.toLocaleString()} UZS`;
  };

  const stats = [
    {
      title: "Umumiy Balans",
      value: formatValue(data?.balance || 0),
      description: "O'tgan haftaga nisbatan +2.1%",
      icon: Wallet,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "Oylik Kirim",
      value: formatValue(data?.income || 0),
      description: "O'tgan oyga nisbatan +12%",
      icon: ArrowUpRight,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      title: "Oylik Chiqim",
      value: formatValue(data?.expense || 0),
      description: "O'tgan oyga nisbatan -4%",
      icon: ArrowDownRight,
      color: "text-rose-500",
      bg: "bg-rose-500/10"
    },
    {
      title: "Sof Foyda",
      value: formatValue(data?.profit || 0),
      description: "O'tgan oyga nisbatan +8%",
      icon: TrendingUp,
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
          Boshqaruv Paneli
        </h2>
        <p className="text-muted-foreground font-medium">Biznesingiz ko'rsatkichlarini real vaqtda kuzating.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none bg-card/40 backdrop-blur-xl transition-all hover:translate-y-[-4px] hover:shadow-2xl ring-1 ring-white/10 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`rounded-xl ${stat.bg} p-2 transition-transform group-hover:scale-110`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-white tabular-nums">{stat.value}</div>
              <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-tighter">
                <span className={stat.color}>{stat.description.split(' ')[0]}</span> {stat.description.split(' ').slice(1).join(' ')}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="col-span-4 border-none bg-card/40 backdrop-blur-xl shadow-2xl ring-1 ring-white/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <CardTitle>O'sish Analitikasi</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.chartData || []}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff10', borderRadius: '12px' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="income" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorIncome)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-none bg-card/40 backdrop-blur-xl shadow-2xl ring-1 ring-white/10 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-1000">
            <Target className="h-32 w-32 text-primary" />
          </div>
          <CardHeader>
            <CardTitle>Moliyaviy Holat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Jamg'arma Maqsadi</span>
                <span className="text-white font-bold">85%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-white/5 overflow-hidden ring-1 ring-white/10 p-[2px]">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400 shadow-[0_0_10px_rgba(var(--primary),0.5)]" style={{ width: '85%' }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Samaradorlik</p>
                <p className="text-xl font-black text-white">94.2%</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Xavf Darajasi</p>
                <p className="text-xl font-black text-primary">PAST</p>
              </div>
            </div>

            <div className="rounded-2xl bg-primary/10 p-5 border border-primary/20 flex gap-4">
              <div className="mt-1">
                <Zap className="h-5 w-5 text-primary fill-primary" />
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                <span className="text-white font-bold">AI Tahlili:</span> Daromadingiz o'tgan oyga nisbatan 15% oshdi. Bu mablag'ni aktivlarga qayta investitsiya qilishni tavsiya etamiz.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Target({ className }: { className?: string }) {
  return (
    <svg 
      className={className}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  );
}
