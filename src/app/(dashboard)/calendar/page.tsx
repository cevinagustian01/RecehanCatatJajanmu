export const dynamic = "force-dynamic";

import { fetchTransactionsByDate } from "@/app/actions/transactions";
import CalendarClient from "./CalendarClient";
import { startOfMonth, endOfMonth } from "date-fns";

export default async function CalendarPage(props: {
  searchParams: Promise<{ month?: string; year?: string }>
}) {
  const searchParams = await props.searchParams;
  const now = new Date();
  const month = searchParams.month ? parseInt(searchParams.month) : now.getMonth();
  const year = searchParams.year ? parseInt(searchParams.year) : now.getFullYear();

  const startDate = startOfMonth(new Date(year, month));
  const endDate = endOfMonth(new Date(year, month));

  const { transactions } = await fetchTransactionsByDate(startDate, endDate);

  return (
    <CalendarClient 
      initialTransactions={transactions} 
      currentMonth={month} 
      currentYear={year} 
    />
  );
}
