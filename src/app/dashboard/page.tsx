"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  TrendingUp, 
  Target,
  Zap
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function OverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
        {stats.map((stat, i) => (
          <Card key={i} className="border-none bg-card/40 backdrop-blur-xl shadow-2xl transition-all hover:translate-y-[-4px] hover:shadow-primary/20 ring-1 ring-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold opacity-80">{stat.title}</CardTitle>
              <div className={`rounded-full p-2.5 ${stat.bg} ${stat.color} shadow-inner`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                <span className={stat.color}>{stat.description.split(' ')[0]}</span>
                {stat.description.split(' ').slice(1).join(' ')}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-none bg-card/40 backdrop-blur-xl shadow-2xl ring-1 ring-white/10">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              O'sish Analitikasi
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.chartData || []}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.4)" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.4)" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(23, 23, 23, 0.9)', 
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                    }} 
                    itemStyle={{ color: 'white' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="income" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorIncome)" 
                    strokeWidth={4}
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-none bg-card/40 backdrop-blur-xl shadow-2xl overflow-hidden relative ring-1 ring-white/10">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Target className="h-48 w-48 rotate-12" />
          </div>
          <CardHeader>
            <CardTitle className="text-lg font-bold">Moliyaviy Holat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Jamg'arma Maqsadi</span>
                <span className="font-bold text-primary">85%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-white/5 overflow-hidden ring-1 ring-white/10">
                <div className="h-full w-[85%] rounded-full bg-gradient-to-r from-primary to-emerald-400 shadow-[0_0_20px_rgba(var(--primary),0.6)]" />
              </div>
            </div>
            
            <div className="pt-2 grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Samaradorlik</p>
                <p className="text-2xl font-black italic">94.2%</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Xavf Darajasi</p>
                <p className="text-2xl font-black text-emerald-400 italic">PAST</p>
              </div>
            </div>

            <div className="pt-6">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative rounded-2xl bg-black/40 p-5 border border-white/10 backdrop-blur-md">
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-primary/20 p-2">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm leading-relaxed font-medium">
                      <span className="text-primary font-bold">AI Tahlili:</span> Daromadingiz o'tgan oyga nisbatan 15% oshdi. Bu mablag'ni aktivlarga qayta investitsiya qilishni tavsiya etamiz.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
