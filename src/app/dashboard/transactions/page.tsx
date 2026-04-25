"use client";

import { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Download, 
  Search, 
  Filter, 
  History,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  FileText
} from "lucide-react";
import * as XLSX from "xlsx";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/transactions')
      .then(res => res.json())
      .then(d => {
        setTransactions(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(transactions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Amallar");
    XLSX.writeFile(wb, "uzfinance_amallar.xlsx");
  };

  const filtered = transactions.filter(t => 
    t.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.note?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
            Amallar Tarixi
          </h2>
          <p className="text-muted-foreground font-medium">Barcha kirim va chiqimlarni nazorat qiling.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportToExcel} className="border-white/10 bg-white/5 hover:bg-white/10 text-white backdrop-blur-md">
            <Download className="mr-2 h-4 w-4 text-primary" /> Excelga yuklash
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-md group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-emerald-500/20 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Qidirish (Kategoriya yoki izoh)..." 
              className="pl-10 bg-card/40 border-white/10 backdrop-blur-xl h-12 rounded-xl focus:ring-primary/50 text-sm" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Button variant="outline" className="border-white/10 bg-white/5 h-12 w-12 rounded-xl">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-card/40 backdrop-blur-xl shadow-2xl overflow-hidden ring-1 ring-white/5">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent bg-white/5">
              <TableHead className="py-4 text-white font-bold"><Calendar className="inline mr-2 h-4 w-4 text-primary" /> Sana</TableHead>
              <TableHead className="text-white font-bold"><FileText className="inline mr-2 h-4 w-4 text-primary" /> Kategoriya</TableHead>
              <TableHead className="text-white font-bold">Izoh</TableHead>
              <TableHead className="text-white font-bold">Tur</TableHead>
              <TableHead className="text-right text-white font-bold pr-8">Miqdor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <p className="text-muted-foreground">Ma'lumotlar yuklanmoqda...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <History className="h-16 w-16 mb-4 opacity-10" />
                    <p className="text-xl font-bold opacity-50">Hech qanday amal topilmadi</p>
                    <p className="text-sm opacity-40">Telegram bot orqali birinchi amalingizni kiriting.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.id} className="border-white/5 group transition-all duration-300 hover:bg-white/5">
                  <TableCell className="font-medium text-white/80 py-4">
                    {new Date(item.created_at).toLocaleDateString('uz-UZ')}
                  </TableCell>
                  <TableCell>
                    <span className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary shadow-[0_0_15px_rgba(var(--primary),0.1)]">
                      {item.category || 'Boshqa'}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-medium group-hover:text-white transition-colors">
                    {item.note || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {item.type === 'income' ? (
                        <ArrowUpCircle className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <ArrowDownCircle className="h-4 w-4 text-rose-400" />
                      )}
                      <span className={`font-bold text-xs uppercase tracking-tighter ${item.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {item.type === 'income' ? 'Kirim' : 'Chiqim'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-black text-white pr-8 text-lg tabular-nums">
                    {item.type === 'expense' ? '-' : '+'}{Number(item.amount).toLocaleString()} UZS
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
