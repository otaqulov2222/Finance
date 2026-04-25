"use client";

import { useState } from "react";
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
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  Pencil,
  Trash2,
  History
} from "lucide-react";
import * as XLSX from "xlsx";

const initialData = [
  { id: "1", amount: 150000, type: "expense", category: "Food", note: "Lunch with client", date: "2024-05-20" },
  { id: "2", amount: 5000000, type: "income", category: "Sales", note: "Wholesale delivery", date: "2024-05-19" },
  { id: "3", amount: 1200000, type: "expense", category: "Rent", note: "Office monthly", date: "2024-05-18" },
  { id: "4", amount: 450000, type: "expense", category: "Transport", note: "Gasoline", date: "2024-05-17" },
];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState("");

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(transactions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, "transactions_export.xlsx");
  };

  const filtered = transactions.filter(t => 
    t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.note.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
          <p className="text-muted-foreground">Manage and track every income and expense.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="mr-2 h-4 w-4" /> Export Excel
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Transaction
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search transactions..." 
            className="pl-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="ghost" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="rounded-xl border bg-card/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Note</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <History className="h-12 w-12 mb-4 opacity-20" />
                    <p className="text-lg font-medium">No transactions found</p>
                    <p className="text-sm">Start by adding your first transaction via Telegram.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.id} className="group transition-colors hover:bg-accent/50">
                  <TableCell className="font-medium">{item.date}</TableCell>
                  <TableCell>
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary uppercase">
                      {item.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.note}</TableCell>
                  <TableCell>
                    <span className={item.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}>
                      {item.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {item.amount.toLocaleString()} UZS
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500">
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
    </div>
  );
}
