
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, Utensils, ShoppingBag, Smartphone, CreditCard, Plus } from 'lucide-react';
import { Transaction } from '@/lib/api';

const CATEGORY_ICONS: Record<string, typeof CreditCard> = {
  'Food & Drink': Utensils,
  Shopping: ShoppingBag,
  Bills: Smartphone,
  Income: Plus,
};

interface TransactionListProps {
  transactions: Transaction[];
}

const TransactionList = ({ transactions }: TransactionListProps) => {
  const [filter, setFilter] = useState<'30days' | 'monthly'>('30days');
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };
  
  // Format amount for display
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(Math.abs(amount));
  };
  
  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <div className="flex space-x-2">
          <button 
            className={`text-sm px-3 py-1 rounded-full transition-colors ${
              filter === '30days' ? 'bg-cpost-blue text-white' : 'bg-gray-100 text-gray-600'
            }`}
            onClick={() => setFilter('30days')}
          >
            Last 30 days
          </button>
          <button 
            className={`text-sm px-3 py-1 rounded-full transition-colors ${
              filter === 'monthly' ? 'bg-cpost-blue text-white' : 'bg-gray-100 text-gray-600'
            }`}
            onClick={() => setFilter('monthly')}
          >
            Monthly
          </button>
        </div>
        <button className="text-sm text-cpost-blue flex items-center">
          View All
          <ChevronDown className="h-4 w-4 ml-1" />
        </button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Merchant</TableHead>
                  <TableHead className="hidden sm:table-cell">Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => {
                  const Icon = CATEGORY_ICONS[transaction.category] ?? CreditCard;
                  const amount = transaction.amountCents / 100;
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-8 h-8 shrink-0 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                            <Icon className="h-4 w-4 text-gray-700" />
                          </div>
                          <span>{transaction.merchant}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{transaction.category}</TableCell>
                      <TableCell className="whitespace-nowrap">{formatDate(transaction.date)}</TableCell>
                      <TableCell className={`text-right font-medium whitespace-nowrap ${
                        amount > 0 ? 'text-green-600' : ''
                      }`}>
                        {amount > 0 ? '+' : '-'}{formatAmount(amount)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionList;
