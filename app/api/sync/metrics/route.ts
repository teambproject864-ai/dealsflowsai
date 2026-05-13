import { NextResponse } from 'next/server';
import { getSyncMetrics } from '@/lib/sheets';

export async function GET() {
  try {
    const metrics = await getSyncMetrics(100);
    
    const successCount = metrics.filter(m => m.status === 'success').length;
    const failCount = metrics.filter(m => m.status === 'failed').length;
    const avgDuration = metrics.length > 0 
      ? Math.round(metrics.reduce((sum, m) => sum + m.durationMs, 0) / metrics.length) 
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        summary: {
          total: metrics.length,
          success: successCount,
          failed: failCount,
          successRate: metrics.length > 0 ? (successCount / metrics.length) * 100 : 0,
          avgDurationMs: avgDuration
        }
      }
    });
  } catch (error) {
    console.error('Error fetching sync metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sync metrics' },
      { status: 500 }
    );
  }
}
