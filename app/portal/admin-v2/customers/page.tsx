'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  UserPlus,
  MoreHorizontal,
  Mail,
  Phone,
  Building2,
  Filter,
  Loader2,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GlassPanel, ExtrudedButton } from '@/components/immersive';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { getDb } from '@/lib/firebase-client';
import { cn } from '@/lib/utils';

export default function AdminV2Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Real-time Firestore sync
  useEffect(() => {
    const db = getDb();
    if (!db) {
      setIsLoading(false);
      return;
    }

    const q = query(collection(db, 'customers'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const customerData: any[] = [];
        snapshot.forEach((doc) => {
          customerData.push({ id: doc.id, ...doc.data() });
        });
        setCustomers(customerData);
        setIsLoading(false);
      },
      (error) => {
        console.error('[Admin Customers] Firestore error:', error);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  // Filter customers
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      (customer.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (customer.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (customer.companyName?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || customer.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
            Customer Management
          </h1>
          <p className="text-slate-400 mt-2">
            Manage customer accounts, onboarding, and status
          </p>
        </div>
        <Button
          className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Onboard New Customer
        </Button>
      </div>

      {/* Filters */}
      <GlassPanel className="border border-slate-800">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search customers by name, email, or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-slate-700 focus:border-teal-500 text-slate-100 placeholder-slate-500 rounded-xl"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 rounded-xl">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="onboarding">Onboarding</SelectItem>
                  <SelectItem value="resigned">Resigned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </GlassPanel>

      {/* Customers list */}
      <div className="grid gap-4">
        {filteredCustomers.map((customer) => (
          <GlassPanel
            key={customer.id}
            className="border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-white">
                      {customer.name?.charAt(0)?.toUpperCase() || 'C'}
                    </span>
                  </div>

                  {/* Customer info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-slate-100">
                        {customer.name || 'Unnamed Customer'}
                      </h3>
                      <span
                        className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          customer.status === 'active'
                            ? 'bg-green-500/10 text-green-400'
                            : customer.status === 'inactive'
                            ? 'bg-slate-700 text-slate-400'
                            : customer.status === 'onboarding'
                            ? 'bg-blue-500/10 text-blue-400'
                            : 'bg-red-500/10 text-red-400'
                        )}
                      >
                        {customer.status || 'active'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                      {customer.email && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5" />
                          {customer.email}
                        </div>
                      )}
                      {customer.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5" />
                          {customer.phone}
                        </div>
                      )}
                      {customer.companyName && (
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5" />
                          {customer.companyName}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-white"
                    >
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-slate-900 border-slate-800">
                    <DropdownMenuItem className="text-slate-200 cursor-pointer">
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-slate-200 cursor-pointer">
                      Edit Customer
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-400 cursor-pointer">
                      Process Resignation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </GlassPanel>
        ))}

        {filteredCustomers.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <Users className="h-12 w-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">
              No customers found
            </h3>
            <p className="text-slate-500 mb-4">
              Try adjusting your search or filters, or onboard a new customer
            </p>
            <Button
              asChild
              variant="ghost"
              className="text-slate-400 hover:text-white"
            >
              <a href="/portal/admin">Go to Legacy Portal</a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
