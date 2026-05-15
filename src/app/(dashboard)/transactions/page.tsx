import prisma from "@/lib/prisma";
import TransactionsClient from "./TransactionsClient";

export const revalidate = 30;

export default async function TransactionsPage() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { created_at: 'desc' },
    include: { wallet: true, category: true },
  });

  return <TransactionsClient initialTransactions={transactions} />;
}
