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
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Download, 
  Search, 
  Filter, 
  History,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  FileText,
  Pencil,
  Trash2,
  AlertCircle
} from "lucide-react";
import * as XLSX from "xlsx";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchTransactions = () => {
    setLoading(true);
    fetch('/api/transactions')
      .then(res => res.json())
      .then(d => {
        setTransactions(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Ushbu amalni o'chirishni tasdiqlaysizmi?")) return;
    
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTransactions(transactions.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setEditForm({
      amount: item.amount,
      category: item.category,
      note: item.note,
      type: item.type
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(`/api/transactions/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          amount: Number(editForm.amount)
        })
      });
      
      if (res.ok) {
        setIsEditDialogOpen(false);
        fetchTransactions();
      } else {
        const error = await res.json();
        alert("Xatolik yuz berdi: " + (error.error || "Saqlab bo'lmadi"));
      }
    } catch (error) {
      console.error("Failed to update", error);
      alert("Server bilan bog'lanishda xatolik!");
    }
  };

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
          <p className="text-muted-foreground font-medium">Kirim va chiqimlarni tahrirlash yoki o'chirish.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportToExcel} className="border-white/10 bg-white/5 hover:bg-white/10 text-white backdrop-blur-md">
            <Download className="mr-2 h-4 w-4 text-primary" /> Excelga yuklash
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md group">
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
      </div>

      <div className="rounded-2xl border border-white/10 bg-card/40 backdrop-blur-xl shadow-2xl overflow-hidden ring-1 ring-white/5">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent bg-white/5">
              <TableHead className="py-4 text-white font-bold"><Calendar className="inline mr-2 h-4 w-4 text-primary" /> Sana</TableHead>
              <TableHead className="text-white font-bold"><FileText className="inline mr-2 h-4 w-4 text-primary" /> Kategoriya</TableHead>
              <TableHead className="text-white font-bold">Izoh</TableHead>
              <TableHead className="text-white font-bold">Tur</TableHead>
              <TableHead className="text-right text-white font-bold">Miqdor</TableHead>
              <TableHead className="text-right text-white font-bold pr-8">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <p className="text-muted-foreground">Ma'lumotlar yuklanmoqda...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <History className="h-16 w-16 mb-4 opacity-10" />
                    <p className="text-xl font-bold opacity-50">Hech qanday amal topilmadi</p>
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
                  <TableCell className="text-right font-black text-white text-lg tabular-nums">
                    {item.type === 'expense' ? '-' : '+'}{Number(item.amount).toLocaleString()} UZS
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 rounded-xl bg-white/5 hover:bg-primary/20 hover:text-primary transition-colors border border-white/5"
                        onClick={() => handleEdit(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 rounded-xl bg-white/5 hover:bg-rose-500/20 hover:text-rose-500 transition-colors border border-white/5"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="border-white/10 bg-black/90 backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
              Amalni tahrirlash
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid gap-2">
              <Label htmlFor="amount" className="text-xs font-bold uppercase tracking-widest opacity-60">Summa</Label>
              <Input 
                id="amount" 
                type="number"
                value={editForm.amount} 
                onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                className="bg-white/5 border-white/10 h-12 focus:ring-primary/50 text-lg font-bold"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category" className="text-xs font-bold uppercase tracking-widest opacity-60">Kategoriya</Label>
              <Input 
                id="category" 
                value={editForm.category} 
                onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                className="bg-white/5 border-white/10 h-12"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="note" className="text-xs font-bold uppercase tracking-widest opacity-60">Izoh</Label>
              <Input 
                id="note" 
                value={editForm.note} 
                onChange={(e) => setEditForm({...editForm, note: e.target.value})}
                className="bg-white/5 border-white/10 h-12"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-widest opacity-60">Turi</Label>
              <div className="flex gap-2">
                <Button 
                  variant={editForm.type === 'income' ? 'default' : 'outline'}
                  className={`flex-1 h-12 rounded-xl font-bold ${editForm.type === 'income' ? 'bg-emerald-500 hover:bg-emerald-600' : 'border-white/10'}`}
                  onClick={() => setEditForm({...editForm, type: 'income'})}
                >
                  <ArrowUpCircle className="mr-2 h-4 w-4" /> Kirim
                </Button>
                <Button 
                  variant={editForm.type === 'expense' ? 'default' : 'outline'}
                  className={`flex-1 h-12 rounded-xl font-bold ${editForm.type === 'expense' ? 'bg-rose-500 hover:bg-rose-600' : 'border-white/10'}`}
                  onClick={() => setEditForm({...editForm, type: 'expense'})}
                >
                  <ArrowDownCircle className="mr-2 h-4 w-4" /> Chiqim
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="h-12 px-8 font-bold">Bekor qilish</Button>
            <Button onClick={handleUpdate} className="bg-primary text-black font-bold h-12 px-8 hover:bg-emerald-400">
              O'zgarishlarni saqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
