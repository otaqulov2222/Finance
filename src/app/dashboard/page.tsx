"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet,
  Zap,
  Activity,
  Target,
  Sparkles
} from "lucide-react";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const dRes = await fetch('/api/dashboard');
      const dData = await dRes.json();
      setData(dData);

      const gRes = await fetch('/api/goals');
      const gData = await gRes.json();
      setGoals(gData);

      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

  const chartData = (data?.chartData || []).map((item: any) => ({
    ...item,
    kirim: isUSD ? Number((item.income / rate).toFixed(2)) : item.income,
    chiqim: isUSD ? Number((item.expense / rate).toFixed(2)) : item.expense
  }));

  const stats = [
    { title: "Umumiy Balans", value: formatValue(data?.balance || 0), description: "Joriy holat", icon: Wallet, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Oylik Kirim", value: formatValue(data?.income || 0), description: "Jami tushumlar", icon: ArrowUpRight, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Oylik Chiqim", value: formatValue(data?.expense || 0), description: "Jami xarajatlar", icon: ArrowDownRight, color: "text-rose-500", bg: "bg-rose-500/10" },
    { title: "Sof Foyda", value: formatValue(data?.profit || 0), description: "Kirim - Chiqim", icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10" }
  ];

  const mainGoal = goals[0];
  const goalProgress = mainGoal ? Math.min(Math.round((mainGoal.current_amount / mainGoal.target_amount) * 100), 100) : 0;

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
          <Card key={stat.title} className="border-none bg-card/40 backdrop-blur-xl ring-1 ring-white/10 overflow-hidden relative group">
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
              <CardTitle className="text-sm font-black uppercase tracking-widest">Haftalik Dinamika</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-2">
            <div className="h-[300px] md:h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} hide={window?.innerWidth < 768} />
                  <Tooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff10', borderRadius: '16px' }} />
                  <Bar dataKey="kirim" fill="#10b981" radius={[6, 6, 0, 0]} barSize={20} />
                  <Bar dataKey="chiqim" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none bg-card/40 backdrop-blur-xl shadow-2xl ring-1 ring-white/10">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <CardTitle className="text-xs font-black uppercase tracking-widest">AI Maslahat</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4">
                <p className="text-[11px] leading-relaxed text-amber-200/80 italic font-medium">
                  "{data?.income > data?.expense ? "Sizning daromadingiz xarajatdan ko'p, bu juda yaxshi holat. Ortiqcha mablag'ni maqsadlarga yo'naltirishingizni maslahat beraman." : "Xarajatlar nazoratdan chiqmoqda. Keyingi 3 kunda faqat zaruriy narsalar uchun pul ishlatishga harakat qiling."}"
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-card/40 backdrop-blur-xl shadow-2xl ring-1 ring-white/10">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <CardTitle className="text-xs font-black uppercase tracking-widest">Asosiy Maqsad</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {mainGoal ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white truncate">{mainGoal.name}</span>
                    <span className="text-xs font-black text-primary">{goalProgress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-primary shadow-[0_0_10px_#10b981]" style={{ width: `${goalProgress}%` }} />
                  </div>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Qoldi: {formatValue(mainGoal.target_amount - mainGoal.current_amount)}</p>
                </>
              ) : (
                <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest text-center py-4 italic">Maqsadlar belgilanmagan</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
