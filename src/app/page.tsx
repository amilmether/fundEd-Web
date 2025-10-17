import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Zap, Shield, BarChart, Mail, Users } from 'lucide-react';
import { Logo } from '@/components/icons';

export default function Home() {
  const features = [
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: 'Unified Management',
      description: 'Admin, class rep, and student panels for role-based access and streamlined workflows.',
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: 'Seamless Payments',
      description: 'Integrate Razorpay and QR-based payments with screenshot uploads for easy tracking.',
    },
    {
      icon: <BarChart className="h-8 w-8 text-primary" />,
      title: 'Insightful Reporting',
      description: 'Visualize fund collection, pending payments, and expenses with dynamic charts and reports.',
    },
    {
      icon: <Mail className="h-8 w-8 text-primary" />,
      title: 'Automated Notifications',
      description: 'Keep everyone in the loop with automatic email alerts for payments and deadlines.',
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: 'AI-Powered Security',
      description: 'Detect potential fraud with an AI tool that analyzes payment patterns and screenshots.',
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-primary" />,
      title: 'Invoice Generation',
      description: 'Automatically generate and download professional invoices and receipts for all transactions.',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold font-headline text-foreground">FundEdHQ</span>
          </Link>
          <Button asChild>
            <Link href="/dashboard">Login</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        <section className="container mx-auto flex flex-col items-center px-4 py-20 text-center">
          <h1 className="font-headline text-4xl font-extrabold tracking-tight md:text-6xl lg:text-7xl">
            Effortless Fund Management for Education
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            FundEdHQ simplifies class funds and event payments, bringing transparency and efficiency to students, reps, and admins.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link href="/dashboard">Get Started</Link>
            </Button>
          </div>
        </section>

        <section id="features" className="bg-card py-20">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="font-headline text-3xl font-bold md:text-4xl">Everything You Need in One Place</h2>
              <p className="mt-4 max-w-xl mx-auto text-muted-foreground">
                From payment collection to financial reporting, FundEdHQ has you covered.
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="flex flex-col items-center text-center p-6 rounded-lg">
                  {feature.icon}
                  <h3 className="mt-4 font-headline text-xl font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-background py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} FundEdHQ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
