// app/api/system/metrics/route.ts
import { NextResponse } from 'next/server';
import { getVectorSystemReport } from '@/lib/vector-monitor';
import { db } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [vectorReport, usersSnapshot] = await Promise.all([
      getVectorSystemReport(),
      db.collection('users').limit(10).get()
    ]);

    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().displayName || doc.data().email || 'Anonymous',
      role: doc.data().role || 'User',
      lastSeen: doc.data().lastLoginAt || doc.data().createdAt || new Date().toISOString()
    }));

    // Mocking some system metrics for the 3D dashboard
    const systemMetrics = {
      memoryUsage: Math.floor(Math.random() * 40) + 20, // 20-60%
      cpuLoad: Math.floor(Math.random() * 30) + 10, // 10-40%
      uptime: process.uptime(),
      vector: vectorReport
    };

    return NextResponse.json({
      success: true,
      metrics: systemMetrics,
      users: users,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[SystemMetricsAPI] Failed to fetch metrics:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to fetch system metrics' 
    }, { status: 500 });
  }
}
