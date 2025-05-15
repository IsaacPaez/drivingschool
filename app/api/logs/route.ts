import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Verificar si hay parámetros de consulta
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter');
    
    // Aquí puedes implementar la lógica para obtener los logs
    return NextResponse.json({ 
      message: 'Logs retrieved successfully',
      filter: filter || 'all'
    });
  } catch (error) {
    console.error('Error retrieving logs:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve logs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const logData = await request.json();
    // Aquí puedes implementar la lógica para guardar los logs
    console.log('Received log data:', logData);
    return NextResponse.json({ 
      message: 'Log saved successfully',
      data: logData
    });
  } catch (error) {
    console.error('Error saving log:', error);
    return NextResponse.json(
      { error: 'Failed to save log' },
      { status: 500 }
    );
  }
} 