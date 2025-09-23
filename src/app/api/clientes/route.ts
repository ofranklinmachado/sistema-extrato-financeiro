import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { ClienteInsert } from '@/types'

export async function GET() {
  try {
    const { data: clientes, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nome')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(clientes)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ClienteInsert = await request.json()

    const { data: cliente, error } = await supabase
      .from('clientes')
      .insert(body)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(cliente, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

