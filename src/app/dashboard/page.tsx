"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  TrendingUp, 
  CreditCard,
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
      });
  }, []);

  if (loading) return <div className="p-8 text-center">Ma'lumotlar yuklanmoqda...</div>;

  const stats = data?.stats || { income: 0, expense: 0, profit: 0, balance: 0 };
  const recentTransactions = data?.transactions?.slice(0, 5) || [];
  
  // Create chart data from recent transactions
  const chartData = [
    { name: 'Mon', income: 4000, expense: 2400 },
    { name: 'Tue', income: 3000, expense: 1398 },
    { name: 'Wed', income: 2000, expense: 9800 },
    { name: 'Thu', income: 2780, expense: 3908 },
    { name: 'Fri', income: 1890, expense: 4800 },
    { name: 'Sat', income: 2390, expense: 3800 },
    { name: 'Sun', income: 3490, expense: 4300 },
  ];
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Overview</h2>
          <p className="text-muted-foreground">Monitor your business performance in real-time.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Total Balance" 
          value={`${stats.balance.toLocaleString()} UZS`} 
          change="+2.1% from last week" 
          icon={Wallet} 
        />
        <StatsCard 
          title="Monthly Income" 
          value={`${stats.income.toLocaleString()} UZS`} 
          change="+12% from last month" 
          icon={ArrowUpRight} 
          color="text-emerald-500"
        />
        <StatsCard 
          title="Monthly Expense" 
          value={`${stats.expense.toLocaleString()} UZS`} 
          change="-4% from last month" 
          icon={ArrowDownRight} 
          color="text-rose-500"
        />
        <StatsCard 
          title="Net Profit" 
          value={`${stats.profit.toLocaleString()} UZS`} 
          change="+18% from last month" 
          icon={TrendingUp} 
          color="text-primary"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-none bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Financial Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area type="monotone" dataKey="income" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-none bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               {recentTransactions.map((t: any) => (
                 <div key={t.id} className="flex items-center gap-4">
                   <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                     <CreditCard className="h-5 w-5 text-primary" />
                   </div>
                   <div className="flex-1 space-y-1">
                     <p className="text-sm font-medium leading-none">{t.category}</p>
                     <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString()} • {t.type}</p>
                   </div>
                   <div className={`font-medium ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                     {t.type === 'income' ? '+' : '-'}{Number(t.amount).toLocaleString()}
                   </div>
                 </div>
               ))}
               {recentTransactions.length === 0 && (
                 <p className="text-sm text-muted-foreground text-center py-8">No recent transactions.</p>
               )}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({ title, value, change, icon: Icon, color }: any) {
  return (
    <Card className="border-none bg-card/50 backdrop-blur-sm transition-all hover:bg-card/80">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color || 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{change}</p>
      </CardContent>
    </Card>
  );
}
