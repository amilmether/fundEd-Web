'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DollarSign,
  Users,
  Wallet,
  Activity,
} from 'lucide-react';
import { transactions, chartData } from '@/lib/data';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Bar, BarChart as RechartsBarChart, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function DashboardPage() {
  const totalCollected = transactions
    .filter((t) => t.status === 'Paid')
    .reduce((acc, t) => acc + t.amount, 0);
  const totalPending = transactions
    .filter((t) => t.status === 'Pending')
    .reduce((acc, t) => acc + t.amount, 0);

  const chartConfig = {
    collected: {
      label: 'Collected',
      color: 'hsl(var(--chart-1))',
    },
    pending: {
      label: 'Pending',
      color: 'hsl(var(--chart-2))',
    },
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Collected
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalCollected.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pending
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalPending.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +180.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              1 finishing soon
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{transactions.length}</div>
            <p className="text-xs text-muted-foreground">
              +19% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Funds Overview</CardTitle>
            <CardDescription>Collected vs. Pending funds over the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
              <RechartsBarChart data={chartData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="collected" fill="var(--color-collected)" radius={4} />
                <Bar dataKey="pending" fill="var(--color-pending)" radius={4} />
              </RechartsBarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              A list of the most recent transactions.
            </CardDescription>
          </CardHeader>
          <CardContent>
             {/* Mobile View */}
            <div className="grid gap-4 md:hidden">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="p-4 bg-muted/50 rounded-lg flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{transaction.studentName}</div>
                      <div className="text-sm text-muted-foreground">
                        {transaction.eventName}
                      </div>
                    </div>
                     <div className="text-right font-semibold">
                      ₹{transaction.amount.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Desktop View */}
            <Table className="hidden md:table">
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.slice(0, 5).map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="font-medium">{transaction.studentName}</div>
                      <div className="text-sm text-muted-foreground">
                        {transaction.eventName}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      ₹{transaction.amount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
