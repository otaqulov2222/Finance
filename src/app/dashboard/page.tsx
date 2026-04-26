"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet,
  Zap
} from "lucide-react";
import { 
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
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
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
      description: "+2.1% o'sish",
      icon: Wallet,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "Oylik Kirim",
      value: formatValue(data?.income || 0),
      description: "+12% oylik",
      icon: ArrowUpRight,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      title: "Oylik Chiqim",
      value: formatValue(data?.expense || 0),
      description: "-4% kamayish",
      icon: ArrowDownRight,
      color: "text-rose-500",
      bg: "bg-rose-500/10"
    },
    {
      title: "Sof Foyda",
      value: formatValue(data?.profit || 0),
      description: "+8% foyda",
      icon: TrendingUp,
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    }
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl md:text-3xl font-black tracking-tighter bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
          Boshqaruv Paneli
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground font-medium uppercase tracking-widest opacity-60">Real vaqt tahlili</p>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none bg-card/40 backdrop-blur-xl transition-all hover:translate-y-[-4px] hover:shadow-2xl ring-1 ring-white/10 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{stat.title}</CardTitle>
              <div className={`rounded-xl ${stat.bg} p-2 transition-transform group-hover:scale-110`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-black text-white tabular-nums truncate">{stat.value}</div>
              <p className={`text-[10px] font-bold mt-1 uppercase tracking-tighter ${stat.color}`}>
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Chart Section */}
        <Card className="lg:col-span-4 border-none bg-card/40 backdrop-blur-xl shadow-2xl ring-1 ring-white/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-bold uppercase tracking-widest">O'sish Analitikasi</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pl-0 md:pl-2">
            <div className="h-[250px] md:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.chartData || []}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} hide={window?.innerWidth < 768} />
                  <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* AI Insight Section */}
        <Card className="lg:col-span-3 border-none bg-card/40 backdrop-blur-xl shadow-2xl ring-1 ring-white/10 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest">Moliyaviy Holat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-muted-foreground">Jamg'arma Maqsadi</span>
                <span className="text-white">85%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden p-[1px]">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400" style={{ width: '85%' }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Samaradorlik</p>
                <p className="text-lg font-black text-white">94.2%</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Xavf</p>
                <p className="text-lg font-black text-primary uppercase">Past</p>
              </div>
            </div>

            <div className="rounded-2xl bg-primary/10 p-4 border border-primary/20 flex gap-3">
              <Zap className="h-4 w-4 text-primary shrink-0 mt-1" />
              <p className="text-[11px] leading-relaxed text-white/60">
                <span className="text-white font-black uppercase tracking-tighter">AI Tahlili:</span> Daromadingiz barqaror o'smoqda. Bozor xarajatlarini 5% kamaytirish tavsiya etiladi.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
