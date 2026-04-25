"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User, 
  Building2, 
  Bell, 
  ShieldCheck, 
  Zap,
  Save,
  LogOut
} from "lucide-react";

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(d => {
        setProfile(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
          System Settings
        </h2>
        <p className="text-muted-foreground font-medium">Profil va biznes ma'lumotlarini boshqarish.</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-none bg-card/40 backdrop-blur-xl shadow-2xl ring-1 ring-white/10">
          <CardHeader className="border-b border-white/5 pb-6">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-primary/20 p-4 ring-1 ring-primary/40">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Biznes Ma'lumotlari</CardTitle>
                <CardDescription>Barcha hisobotlarda ko'rinadigan biznes nomi.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="businessName" className="text-xs font-bold uppercase tracking-widest opacity-60">Biznes Nomi</Label>
                <Input 
                  id="businessName" 
                  defaultValue={profile?.business_name || "Yuklanmoqda..."} 
                  className="bg-white/5 border-white/10 h-12 focus:ring-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-xs font-bold uppercase tracking-widest opacity-60">Asosiy Valyuta</Label>
                <Input 
                  id="currency" 
                  defaultValue="O'zbek so'mi (UZS)" 
                  disabled 
                  className="bg-white/5 border-white/10 h-12 opacity-50"
                />
              </div>
            </div>
            <Button className="bg-primary text-black font-bold h-12 px-8 hover:bg-emerald-400 shadow-lg shadow-primary/20">
              <Save className="mr-2 h-4 w-4" /> Saqlash
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none bg-card/40 backdrop-blur-xl shadow-2xl ring-1 ring-white/10">
          <CardHeader className="border-b border-white/5 pb-6">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-blue-500/20 p-4 ring-1 ring-blue-500/40">
                <Bell className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <CardTitle>Bildirishnomalar</CardTitle>
                <CardDescription>Telegram bot orqali keladigan hisobotlar.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="space-y-0.5">
                <p className="text-sm font-bold">Kunlik Hisobot</p>
                <p className="text-xs text-muted-foreground">Har kuni soat 20:00 da bot orqali xulosa olish.</p>
              </div>
              <div className="h-6 w-11 rounded-full bg-primary/40 relative">
                <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-primary shadow-sm" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="space-y-0.5">
                <p className="text-sm font-bold">Katta Xarajatlar</p>
                <p className="text-xs text-muted-foreground">1 mln so'mdan oshgan xarajatlarda ogohlantirish.</p>
              </div>
              <div className="h-6 w-11 rounded-full bg-white/10 relative">
                <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white/40 shadow-sm" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="pt-4">
          <Button variant="outline" className="w-full h-14 border-rose-500/20 bg-rose-500/5 text-rose-500 hover:bg-rose-500/10 rounded-2xl font-bold uppercase tracking-widest">
            <LogOut className="mr-2 h-4 w-4" /> Tizimdan chiqish
          </Button>
        </div>
      </div>
    </div>
  );
}
