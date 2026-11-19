
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowDown, ArrowUp, DollarSign } from 'lucide-react';
import { Account, formatCents } from '@/lib/api';

interface AccountSummaryProps {
  account?: Account;
}

const AccountSummary = ({ account }: AccountSummaryProps) => {
  const show = (cents?: number) => (cents === undefined ? '—' : formatCents(cents));

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Balance</p>
              <h3 className="text-xl sm:text-2xl font-bold mt-1">{show(account?.balanceCents)}</h3>
            </div>
            <div className="rounded-full bg-blue-100 p-2">
              <DollarSign className="h-5 w-5 text-cpost-blue" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Current balance
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Spending</p>
              <h3 className="text-xl sm:text-2xl font-bold mt-1">{show(account?.spendingCents)}</h3>
            </div>
            <div className="rounded-full bg-red-100 p-2">
              <ArrowUp className="h-5 w-5 text-red-500" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Last 30 days
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Savings</p>
              <h3 className="text-xl sm:text-2xl font-bold mt-1">{show(account?.savingsCents)}</h3>
            </div>
            <div className="rounded-full bg-green-100 p-2">
              <ArrowDown className="h-5 w-5 text-green-500" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Savings pot
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSummary;
