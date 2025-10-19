'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Printer,
  Settings,
  Users,
  Wallet,
  ArrowRight,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from '@/components/icons';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import type { Transaction } from '@/lib/types';
import { useAuth, useCollection, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useEffect, useState } from 'react';
import { BrandedLoader } from '@/components/ui/branded-loader';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/events', icon: Wallet, label: 'Events' },
  { href: '/dashboard/prints', icon: Printer, label: 'Prints' },
  { href: '/dashboard/students', icon: Users, label: 'Students' },
  { href: '/dashboard/reports', icon: FileText, label: 'Reports' },
];

function MainNav() {
  const pathname = usePathname();
  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href}>
            <SidebarMenuButton
              isActive={pathname.startsWith(item.href) && (item.href === '/dashboard' ? pathname === item.href : true)}
              icon={<item.icon />}
              tooltip={item.label}
            >
              {item.label}
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col p-0">
        <SheetHeader className="p-4 border-b">
           <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Logo className="h-6 w-6 text-primary" />
            <span className="font-headline">FundEd</span>
          </Link>
        </SheetHeader>
        <nav className="flex-1 overflow-y-auto p-4">
            <MainNav />
        </nav>
      </SheetContent>
    </Sheet>
  );
}

const NotificationItem = ({ transaction }: { transaction: Transaction }) => {
    
    return (
        <DropdownMenuItem asChild>
            <Link href={`/dashboard/events/${transaction.eventId}/payments`}>
                <div className="flex flex-col">
                    <p className="text-sm font-medium">{transaction.studentName}</p>
                    <p className="text-xs text-muted-foreground">{transaction.eventName} - ₹{transaction.amount}</p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </Link>
        </DropdownMenuItem>
    );
};


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  // TODO: Replace with dynamic classId from user profile
  const classId = 'class-1';

  const pendingTransactionsQuery = useMemoFirebase(() =>
    (firestore && classId) ? query(collection(firestore, `classes/${classId}/payments`), where('status', '==', 'Verification Pending')) : null,
  [firestore, classId]);

  const { data: pendingTransactions } = useCollection<Transaction>(pendingTransactionsQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = () => {
    if(auth) {
        auth.signOut();
    }
  }

  if (isUserLoading || !user) {
    return <BrandedLoader />
  }


  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex">
        <Sidebar
          collapsible="icon"
          className="border-r bg-card hidden md:flex flex-col"
        >
          <SidebarHeader className="p-4">
             <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <Logo className="h-6 w-6 text-primary" />
              <span className={cn(
                "font-headline text-lg whitespace-nowrap",
                "group-data-[collapsible=icon]:hidden",
              )}>FundEd</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <MainNav />
          </SidebarContent>
          <SidebarFooter className="p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/dashboard/settings">
                  <SidebarMenuButton icon={<Settings/>} tooltip="Settings" isActive={pathname === '/dashboard/settings'}>
                    Settings
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1">
          <header className="flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30">
            <MobileNav />
            <div className="w-full flex-1">
              {/* Optional: Add a search bar here */}
            </div>
            <ThemeToggle />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative rounded-full">
                        <Bell className="h-5 w-5" />
                        {pendingTransactions && pendingTransactions.length > 0 && (
                            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                                {pendingTransactions.length}
                            </Badge>
                        )}
                        <span className="sr-only">Toggle notifications</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>Pending Verifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {pendingTransactions && pendingTransactions.length > 0 ? (
                        <DropdownMenuGroup>
                            {pendingTransactions.map(t => (
                                <NotificationItem key={t.id} transaction={t} />
                            ))}
                        </DropdownMenuGroup>
                    ) : (
                       <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                            No pending verifications.
                       </div>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.photoURL ?? "https://picsum.photos/seed/1/100/100"} alt={user?.displayName ?? ""} />
                    <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.displayName ?? "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-muted/40">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
