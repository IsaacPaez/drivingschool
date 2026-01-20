import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from "@/lib/mongodb";
import Product from '@/models/Product';

// Compatible con ambas formas de importación de DB
async function connectDatabase() {
  try {
    await connectDB();
  } catch (error) {
    // Fallback para dbConnect si existe
    const { default: dbConnect } = await import('@/lib/dbConnect').catch(() => ({ default: null }));
    if (dbConnect) {
      await dbConnect();
    } else {
      throw error;
    }
  }
}

export async function GET() {
  try {
    await connectDatabase();

    console.log('🔍 Fetching all products');

    const products = await Product.find()
      .select('title description price buttonLabel tag duration media order')
      .sort({ order: 1, title: 1 })
      .lean();

    console.log('📦 Products found:', products.length);

    return NextResponse.json(products);

  } catch (error) {
    console.error('❌ Error fetching products:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Error fetching products' },
      { status: 500 }
    );
  }
}
