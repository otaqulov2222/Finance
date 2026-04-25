"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Building2, 
  Bell, 
  Wallet, 
  LogOut, 
  Save,
  Globe,
  ShieldCheck,
  Zap
} from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    business_name: "",
    currency: "UZS",
    daily_report: true,
    large_expenses: false
  });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        alert("Sozlamalar muvaffaqiyatli saqlandi! ✨");
      }
    } catch (error) {
      alert("Xatolik yuz berdi!");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <Zap className="h-8 w-8 animate-pulse text-primary" />
    </div>
  );

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-700 pb-12">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
          Tizim Sozlamalari
        </h2>
        <p className="text-muted-foreground font-medium">Profil va biznes ma'lumotlarini boshqarish.</p>
      </div>

      <div className="grid gap-6">
        {/* Business Info */}
        <Card className="border-none bg-card/40 backdrop-blur-xl shadow-2xl ring-1 ring-white/10 overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-white/5">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-primary/20 p-2.5">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Biznes Ma'lumotlari</CardTitle>
                <CardDescription>Hisobotlarda ko'rinadigan asosiy ma'lumotlar.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest opacity-60">Biznes Nomi</Label>
                <Input 
                  value={settings.business_name} 
                  onChange={(e) => setSettings({...settings, business_name: e.target.value})}
                  className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-primary/50" 
                  placeholder="Masalan: UzFinance Pro"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest opacity-60">Asosiy Valyuta</Label>
                <div className="flex gap-2">
                  <Button 
                    variant={settings.currency === 'UZS' ? 'default' : 'outline'}
                    className={`flex-1 h-12 rounded-xl font-bold ${settings.currency === 'UZS' ? 'bg-primary text-black' : 'border-white/10 bg-white/5'}`}
                    onClick={() => setSettings({...settings, currency: 'UZS'})}
                  >
                    UZS (So'm)
                  </Button>
                  <Button 
                    variant={settings.currency === 'USD' ? 'default' : 'outline'}
                    className={`flex-1 h-12 rounded-xl font-bold ${settings.currency === 'USD' ? 'bg-primary text-black' : 'border-white/10 bg-white/5'}`}
                    onClick={() => setSettings({...settings, currency: 'USD'})}
                  >
                    USD (Dollar)
                  </Button>
                </div>
              </div>
            </div>
            <div className="pt-4">
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="bg-primary text-black font-bold h-12 px-8 rounded-xl hover:bg-emerald-400 shadow-lg shadow-primary/20 transition-all active:scale-95"
              >
                {saving ? "Saqlanmoqda..." : <><Save className="mr-2 h-4 w-4" /> Saqlash</>}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-none bg-card/40 backdrop-blur-xl shadow-2xl ring-1 ring-white/10 overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-white/5">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-blue-500/20 p-2.5">
                <Bell className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Bildirishnomalar</CardTitle>
                <CardDescription>Telegram bot orqali keladigan hisobotlar sozlamasi.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 space-y-6">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 transition-colors hover:bg-white/10">
              <div className="space-y-0.5">
                <Label className="text-base font-bold">Kunlik Hisobot</Label>
                <p className="text-sm text-muted-foreground">Har kuni soat 20:00 da bot orqali xulosa olish.</p>
              </div>
              <Switch 
                checked={settings.daily_report} 
                onCheckedChange={(val) => {
                  const newSettings = {...settings, daily_report: val};
                  setSettings(newSettings);
                  // Optionally save immediately
                }}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 transition-colors hover:bg-white/10">
              <div className="space-y-0.5">
                <Label className="text-base font-bold">Katta Xarajatlar</Label>
                <p className="text-sm text-muted-foreground">1 mln so'mdan oshgan xarajatlarda ogohlantirish.</p>
              </div>
              <Switch 
                checked={settings.large_expenses}
                onCheckedChange={(val) => setSettings({...settings, large_expenses: val})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security & System */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-none bg-card/40 backdrop-blur-xl shadow-2xl ring-1 ring-white/10 p-6 flex items-center gap-4 group cursor-pointer hover:bg-white/5 transition-all">
            <div className="rounded-xl bg-rose-500/20 p-3 text-rose-500 group-hover:scale-110 transition-transform">
              <LogOut className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold">Tizimdan Chiqish</p>
              <p className="text-xs text-muted-foreground">Sessiyani xavfsiz yakunlash.</p>
            </div>
          </Card>
          <Card className="border-none bg-card/40 backdrop-blur-xl shadow-2xl ring-1 ring-white/10 p-6 flex items-center gap-4 group cursor-pointer hover:bg-white/5 transition-all border-dashed border-primary/20 border-2">
            <div className="rounded-xl bg-primary/20 p-3 text-primary group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-primary">Admin Paneli</p>
              <p className="text-xs text-muted-foreground">Tizimni to'liq boshqarish (Tez kunda).</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
