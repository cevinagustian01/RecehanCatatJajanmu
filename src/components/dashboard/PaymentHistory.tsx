"use client";

import * as React from "react";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { Calendar as CalendarIcon, Download, ArrowUpRight, ArrowDownLeft, Trash2 } from "lucide-react";
import * as xlsx from "xlsx";
import { deleteTransaction } from "@/app/actions/transactions";
import { DateRange } from "react-day-picker";

import { cn, formatRupiah } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// --- Types ---
export interface Transaction {
  id: string;
  name: string;
  category: string;
  wallet: string;
  amount: number;
  type: "credit" | "debit";
  date: Date;
  status: string;
}

const statusCls: Record<string, string> = {
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  failed: "bg-red-50 text-red-700 border-red-200",
};

export default function PaymentHistory({ initialData = [] }: { initialData?: Transaction[] }) {
  const [data, setData] = React.useState<Transaction[]>(initialData);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  // Compute dynamic filters based on real data
  const CATEGORIES = React.useMemo(() => Array.from(new Set(data.map(t => t.category))), [data]);
  const WALLETS = React.useMemo(() => Array.from(new Set(data.map(t => t.wallet))), [data]);

  
  // Filters
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [walletFilter, setWalletFilter] = React.useState<string>("all");
  
  // Pagination
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  // Apply filters
  const filteredData = React.useMemo(() => {
    return data.filter((tx) => {
      // Date Filter
      if (dateRange?.from) {
        const from = startOfDay(dateRange.from);
        const to = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
        if (!isWithinInterval(tx.date, { start: from, end: to })) {
          return false;
        }
      }
      
      // Category Filter
      if (categoryFilter !== "all" && tx.category !== categoryFilter) {
        return false;
      }
      
      // Wallet Filter
      if (walletFilter !== "all" && tx.wallet !== walletFilter) {
        return false;
      }
      
      return true;
    });
  }, [data, dateRange, categoryFilter, walletFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setCurrentPage(1);
  };

  const handleCategoryChange = (val: string | null) => {
    if (val !== null) {
      setCategoryFilter(val);
      setCurrentPage(1);
    }
  };

  const handleWalletChange = (val: string | null) => {
    if (val !== null) {
      setWalletFilter(val);
      setCurrentPage(1);
    }
  };

  const clearFilters = () => {
    setDateRange(undefined);
    setCategoryFilter("all");
    setWalletFilter("all");
    setCurrentPage(1);
  };

  const handleExportExcel = () => {
    const exportData = filteredData.map(tx => ({
      Tanggal: format(tx.date, "yyyy-MM-dd"),
      Kategori: tx.category,
      Dompet: tx.wallet,
      Tipe: tx.type === 'credit' ? 'Pemasukan' : 'Pengeluaran',
      "Nominal Rupiah": tx.amount,
      Merchant: tx.name
    }));

    const worksheet = xlsx.utils.json_to_sheet(exportData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Transactions");
    
    xlsx.writeFile(workbook, "Transaksi_Keuangan.xlsx");
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Yakin mau hapus transaksi ini? Saldo dompet akan dihitung ulang.")) return;
    
    setIsLoading(true);
    try {
      const res = await deleteTransaction(id);
      if (!res.success) {
        alert(res.message);
      }
    } catch (e) {
      console.error(e);
      alert("Gagal menghapus transaksi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Payment History</h3>
          <p className="mt-0.5 text-sm text-slate-500">Interactive analytics table</p>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleExportExcel}
          className="text-slate-600 hover:text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50"
        >
          <Download className="mr-2 h-4 w-4" />
          Export Excel
        </Button>
      </div>

      {/* Filters Section */}
      <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
        <Popover>
          <PopoverTrigger
            id="date"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-[260px] justify-start text-left font-normal bg-white",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-emerald-600" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Filter by date range...</span>
            )}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={handleDateRangeChange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        <Select value={categoryFilter} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={walletFilter} onValueChange={handleWalletChange}>
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="Wallet" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Wallets</SelectItem>
            {WALLETS.map(w => (
              <SelectItem key={w} value={w}>{w}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {(dateRange || categoryFilter !== "all" || walletFilter !== "all") && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="text-slate-500 hover:text-slate-900"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Table Section */}
      <div className="rounded-md border border-slate-100 overflow-x-auto w-full">
        <Table className="min-w-[800px]">
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold text-slate-600 w-[250px]">Merchant</TableHead>
              <TableHead className="font-semibold text-slate-600">Category</TableHead>
              <TableHead className="font-semibold text-slate-600">Wallet</TableHead>
              <TableHead className="font-semibold text-slate-600">Date</TableHead>
              <TableHead className="font-semibold text-slate-600">Status</TableHead>
              <TableHead className="text-right font-semibold text-slate-600">Amount</TableHead>
              <TableHead className="w-[50px] font-semibold text-slate-600 text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p>Loading transactions...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((tx) => (
                <TableRow key={tx.id} className="hover:bg-slate-50/50 group">
                  <TableCell className="font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full shrink-0",
                        tx.type === "credit" ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"
                      )}>
                        {tx.type === "credit" ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                      </div>
                      <span className="truncate max-w-[200px] block">{tx.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500">{tx.category}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-xs font-medium text-slate-600">
                      {tx.wallet}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {format(tx.date, "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("rounded-lg border px-2 py-0.5 text-[11px] font-semibold capitalize shadow-none", statusCls[tx.status] || statusCls.completed)}>
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      "font-semibold",
                      tx.type === "credit" ? "text-emerald-600" : "text-slate-900"
                    )}>
                      {tx.type === "credit" ? "+" : "-"}{formatRupiah(tx.amount)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(tx.id)}
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                      title="Hapus Transaksi"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-slate-900 font-medium">No transactions found</p>
                    <p className="text-sm mt-1">Get started by creating a new transaction.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Section */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={cn(
                    "cursor-pointer",
                    currentPage === 1 && "pointer-events-none opacity-50"
                  )}
                />
              </PaginationItem>
              
              {/* Simple pagination logic for demo */}
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 2 + i;
                  if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                }
                
                return (
                  <PaginationItem key={i}>
                    <PaginationLink 
                      onClick={() => setCurrentPage(pageNum)}
                      isActive={currentPage === pageNum}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={cn(
                    "cursor-pointer",
                    currentPage === totalPages && "pointer-events-none opacity-50"
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
