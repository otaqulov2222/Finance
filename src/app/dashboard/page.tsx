"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet,
  Zap,
  Activity
} from "lucide-react";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
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
    // 5 soniyada yangilanish - valyuta almashinuvi tez sezilishi uchun
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <Zap className="h-8 w-8 animate-pulse text-primary" />
    </div>
  );

  const isUSD = data?.currency === 'USD';
  const rate = data?.usdRate || 12600;

  const formatValue = (value: number) => {
    if (isUSD) {
      return `$${(value / rate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${value.toLocaleString()} UZS`;
  };

  // Grafik ma'lumotlarini valyutaga qarab hisoblash
  const chartData = (data?.chartData || []).map((item: any) => ({
    ...item,
    kirim: isUSD ? Number((item.income / rate).toFixed(2)) : item.income,
    chiqim: isUSD ? Number((item.expense / rate).toFixed(2)) : item.expense
  }));

  const stats = [
    {
      title: "Umumiy Balans",
      value: formatValue(data?.balance || 0),
      description: "Joriy holat",
      icon: Wallet,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "Oylik Kirim",
      value: formatValue(data?.income || 0),
      description: "Jami tushumlar",
      icon: ArrowUpRight,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      title: "Oylik Chiqim",
      value: formatValue(data?.expense || 0),
      description: "Jami xarajatlar",
      icon: ArrowDownRight,
      color: "text-rose-500",
      bg: "bg-rose-500/10"
    },
    {
      title: "Sof Foyda",
      value: formatValue(data?.profit || 0),
      description: "Kirim - Chiqim",
      icon: TrendingUp,
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    }
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl md:text-3xl font-black tracking-tighter bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent uppercase">
            Boshqaruv Paneli
          </h2>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
              Valyuta: <span className="text-primary">{isUSD ? `USD ($)` : 'UZS (So\'m)'}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none bg-card/40 backdrop-blur-xl transition-all hover:scale-[1.02] ring-1 ring-white/10 overflow-hidden relative group">
            <div className={`absolute top-0 left-0 w-1 h-full ${stat.color.replace('text', 'bg')}`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color} opacity-40 group-hover:opacity-100 transition-opacity`} />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-black text-white tabular-nums truncate">{stat.value}</div>
              <p className="text-[9px] font-bold mt-1 text-muted-foreground uppercase tracking-widest">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-5 border-none bg-card/40 backdrop-blur-xl shadow-2xl ring-1 ring-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-black uppercase tracking-widest">Haftalik Dinamika ({isUSD ? '$' : 'UZS'})</CardTitle>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-white/40 uppercase">Kirim</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-rose-500" />
                <span className="text-[10px] font-bold text-white/40 uppercase">Chiqim</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-2">
            <div className="h-[300px] md:h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} hide={window?.innerWidth < 768} />
                  <Tooltip 
                    cursor={{ fill: '#ffffff05' }}
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff10', borderRadius: '16px', padding: '12px' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    labelStyle={{ marginBottom: '8px', color: '#888', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="kirim" fill="#10b981" radius={[6, 6, 0, 0]} barSize={20} />
                  <Bar dataKey="chiqim" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-none bg-card/40 backdrop-blur-xl shadow-2xl ring-1 ring-white/10 flex flex-col">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest">Xulosa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 flex-1 flex flex-col justify-center">
            <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Samaradorlik</p>
                  <p className="text-xl font-black text-white">94.2%</p>
                </div>
              </div>
              <p className="text-[11px] leading-relaxed text-white/60">
                Sizning moliyaviy o'sish ko'rsatkichingiz juda yaxshi. Oylik balans ijobiy dinamikada.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-primary/10 border border-primary/20">
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Maslahat</p>
              <p className="text-[11px] font-medium text-white/80 leading-relaxed italic">
                "Kichik xarajatlarni nazorat qilish — katta boylikka yo'l."
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
