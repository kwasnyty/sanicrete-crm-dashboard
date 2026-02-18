import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { schedule, command, data } = body;

    // In a real implementation, this would integrate with OpenClaw's cron system
    // For now, we'll simulate the response
    
    const cronJobId = `crm_job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Log the cron job creation for debugging
    console.log('Creating OpenClaw cron job:', {
      cronJobId,
      schedule,
      command,
      data,
      timestamp: new Date().toISOString()
    });

    // Simulate API call to OpenClaw
    // const openclawResponse = await fetch('https://openclaw-instance.com/api/cron', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${process.env.OPENCLAW_API_KEY}`
    //   },
    //   body: JSON.stringify({
    //     schedule,
    //     command,
    //     data,
    //     source: 'sanicrete-crm'
    //   })
    // });

    return NextResponse.json({ 
      success: true, 
      cronJobId,
      message: 'Cron job created successfully'
    });

  } catch (error) {
    console.error('Failed to create cron job:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create cron job',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cronJobId = searchParams.get('jobId');

    if (!cronJobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // In a real implementation, this would delete the cron job from OpenClaw
    console.log('Deleting OpenClaw cron job:', cronJobId);

    return NextResponse.json({ 
      success: true, 
      message: 'Cron job deleted successfully'
    });

  } catch (error) {
    console.error('Failed to delete cron job:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete cron job',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    // In a real implementation, this would get cron job status from OpenClaw
    console.log('Getting cron job status:', jobId);

    return NextResponse.json({
      success: true,
      jobs: jobId ? [
        {
          id: jobId,
          status: 'active',
          schedule: '0 9 * * 1', // Example: Every Monday at 9 AM
          lastRun: new Date().toISOString(),
          nextRun: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ] : []
    });

  } catch (error) {
    console.error('Failed to get cron job status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get cron job status',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}