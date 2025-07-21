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

export async function GET(request: NextRequest | Request) {
  try {
    await connectDatabase();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    console.log('🔍 Fetching products with category:', category);
    
    let products;

    if (category) {
      products = await Product.find({ category })
        .select('title description price buttonLabel category duration media')
        .sort({ title: 1 })
        .lean();
    } else {
      products = await Product.find()
        .select('title description price buttonLabel category duration media')
        .sort({ title: 1 })
        .lean();
    }
    
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
