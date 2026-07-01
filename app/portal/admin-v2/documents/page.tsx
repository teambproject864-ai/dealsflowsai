'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Upload,
  Edit,
  Trash2,
  Search,
  Download,
  MessageSquare,
  Clock,
  Filter,
  Plus,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassPanel } from '@/components/immersive';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getDb } from '@/lib/firebase-client';
import { demoDocuments } from '@/lib/portal-demo-data';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export default function AdminV2Documents() {
  const [documents, setDocuments] = useState(demoDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Real-time sync
  useEffect(() => {
    const db = getDb();
    if (!db) return;

    const q = query(collection(db, 'documents'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const firestoreDocs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        if (firestoreDocs.length > 0) {
          setDocuments(firestoreDocs as any);
        }
      },
      (error) => console.error('[Admin Documents] Firestore error:', error)
    );

    return unsubscribe;
  }, []);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch = (doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || doc.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = filterType === 'all' || doc.documentType === filterType;
      return matchesSearch && matchesType;
    });
  }, [documents, searchQuery, filterType]);

  const getIconForType = (type: string) => {
    return <FileText className="h-5 w-5 text-teal-400" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
            Documents
          </h1>
          <p className="text-slate-400 mt-2">
            Manage, upload, and organize all customer documents
          </p>
        </div>
        <Button className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      <GlassPanel className="border border-slate-800">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search documents by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700 focus:border-teal-500 text-slate-100 placeholder-slate-500 rounded-xl"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="border border-slate-700 text-slate-300">
                  <Filter className="h-4 w-4 mr-2" />
                  Type: {filterType === 'all' ? 'All' : filterType}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-900 border-slate-800">
                <DropdownMenuItem onClick={() => setFilterType('all')} className="text-slate-200">All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('icp')} className="text-slate-200">ICP</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('requirement')} className="text-slate-200">Requirements</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('onboarding')} className="text-slate-200">Onboarding</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </GlassPanel>

      <div className="grid gap-4">
        {filteredDocuments.map((doc) => (
          <GlassPanel key={doc.id} className="border border-slate-800 hover:border-slate-700 transition-colors">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1 p-3 bg-slate-800 rounded-lg">
                    {getIconForType(doc.documentType)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-100 mb-2">{doc.title}</h3>
                    <p className="text-sm text-slate-400 mb-3">{doc.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span>Type: <span className="text-teal-400 font-semibold">{doc.documentType}</span></span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        Updated: {new Date(doc.updatedAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        Comments: 0
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </GlassPanel>
        ))}
        {filteredDocuments.length === 0 && (
          <div className="text-center py-16">
            <FileText className="h-12 w-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">No documents found</h3>
            <p className="text-slate-500 mb-4">Try adjusting your filters or upload a new document</p>
          </div>
        )}
      </div>
    </div>
  );
}
