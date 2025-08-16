// app/api/properties/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

const ALLOW_ORIGIN = process.env.CORS_ALLOW_ORIGIN || '*';

function withCors(res: NextResponse) {
  res.headers.set('Access-Control-Allow-Origin', ALLOW_ORIGIN);
  res.headers.set('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return res;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const payload = {
      seller_email: String(body.seller_email || ''),
      address_line: String(body.address_line || ''),
      city: String(body.city || ''),
      postcode: String(body.postcode || ''),
      property_type: String(body.property_type || ''),
      beds: Number(body.beds || 0),
      baths: Number(body.baths || 0),
      floor_area_m2: Number(body.floor_area_m2 || 0),
      epc_rating: body.epc_rating ? String(body.epc_rating) : null,
      condition: body.condition ? String(body.condition) : null,
    };

    if (!payload.seller_email) {
      return withCors(NextResponse.json({ error: 'seller_email required' }, { status: 400 }));
    }

    const { data, error } = await supabase.from('properties').insert(payload).select('id').single();
    if (error) throw error;

    return withCors(NextResponse.json({ property_id: data.id }));
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Server error';
    return withCors(NextResponse.json({ error: msg }, { status: 500 }));
  }
}
