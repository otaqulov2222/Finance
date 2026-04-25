"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, Lock, User, Zap } from "lucide-react";

export default function LoginPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Oddiy va xavfsiz tekshiruv (Cookie orqali)
    if (login === "Data365" && password === "admin 365") {
      document.cookie = "isLoggedIn=true; path=/; max-age=86400"; // 24 soat
      router.push("/dashboard");
    } else {
      setError("Login yoki parol noto'g'ri!");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_50%)]"></div>
      
      <Card className="w-full max-w-md border-none bg-card/40 backdrop-blur-2xl shadow-2xl ring-1 ring-white/10 animate-in fade-in zoom-in duration-500">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto rounded-2xl bg-gradient-to-br from-primary to-emerald-400 p-3 w-fit shadow-[0_0_30px_rgba(var(--primary),0.3)]">
            <TrendingUp className="h-8 w-8 text-black" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-black tracking-tighter text-white">Xush Kelibsiz</CardTitle>
            <CardDescription className="font-medium">Tizimga kirish uchun ma'lumotlarni kiriting.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Login</Label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input 
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  className="bg-white/5 border-white/10 h-12 pl-10 rounded-xl focus:ring-primary/50 transition-all" 
                  placeholder="Data365"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Parol</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/5 border-white/10 h-12 pl-10 rounded-xl focus:ring-primary/50 transition-all" 
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold flex items-center gap-2 animate-shake">
                <Zap className="h-4 w-4" /> {error}
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 bg-primary text-black font-black uppercase tracking-widest rounded-xl hover:bg-emerald-400 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
            >
              {loading ? "Kirilmoqda..." : "Kirish"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
