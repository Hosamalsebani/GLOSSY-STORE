'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

const MIGRATION_QUERIES = [
  {
    label: 'Enable UUID extension',
    sql: `create extension if not exists "uuid-ossp"`
  },
  {
    label: 'Create users table',
    sql: `create table if not exists public.users (
      id uuid references auth.users on delete cascade not null primary key,
      email text,
      full_name text,
      role text default 'user',
      created_at timestamp with time zone default timezone('utc'::text, now()) not null
    )`
  },
  {
    label: 'Create products table',
    sql: `create table if not exists public.products (
      id uuid default uuid_generate_v4() primary key,
      name text not null,
      description text,
      price numeric not null,
      stock integer default 0,
      image_url text,
      category text,
      created_at timestamp with time zone default timezone('utc'::text, now()) not null
    )`
  },
  {
    label: 'Create mystery_boxes table',
    sql: `create table if not exists public.mystery_boxes (
      id uuid default uuid_generate_v4() primary key,
      name text not null,
      description text,
      price numeric not null,
      image_url text,
      created_at timestamp with time zone default timezone('utc'::text, now()) not null
    )`
  },
  {
    label: 'Create orders table',
    sql: `create table if not exists public.orders (
      id uuid default uuid_generate_v4() primary key,
      user_id uuid references public.users on delete set null,
      status text default 'pending',
      total numeric not null,
      shipping_address jsonb,
      created_at timestamp with time zone default timezone('utc'::text, now()) not null
    )`
  },
  {
    label: 'Create order_items table',
    sql: `create table if not exists public.order_items (
      id uuid default uuid_generate_v4() primary key,
      order_id uuid references public.orders on delete cascade not null,
      product_id uuid references public.products on delete set null,
      quantity integer not null,
      price numeric not null
    )`
  },
  {
    label: 'Create sliders table',
    sql: `create table if not exists public.sliders (
      id uuid default uuid_generate_v4() primary key,
      image_url text not null,
      title text not null,
      subtitle text,
      sort_order integer default 0,
      created_at timestamp with time zone default timezone('utc'::text, now()) not null
    )`
  },
  {
    label: 'Create shipping_zones table',
    sql: `create table if not exists public.shipping_zones (
      id uuid default uuid_generate_v4() primary key,
      city text not null,
      cost numeric not null,
      estimated_days text
    )`
  }
];

export default function SetupPage() {
  const [results, setResults] = useState<{ label: string; status: string; error?: string }[]>([]);
  const [running, setRunning] = useState(false);
  const [testResult, setTestResult] = useState<string>('');
  const supabase = createClient();

  const testConnection = async () => {
    setTestResult('Testing...');
    try {
      const { data, error } = await supabase.from('products').select('id').limit(1);
      if (error) {
        setTestResult(`❌ Error: ${error.message} (code: ${error.code})`);
      } else {
        setTestResult(`✅ Connected! Found ${data?.length || 0} products.`);
      }
    } catch (err: any) {
      setTestResult(`❌ Exception: ${err.message}`);
    }
  };

  const runMigration = async () => {
    setRunning(true);
    setResults([]);
    const newResults: typeof results = [];

    for (const query of MIGRATION_QUERIES) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: query.sql });
        if (error) {
          newResults.push({ label: query.label, status: '❌ Failed', error: error.message });
        } else {
          newResults.push({ label: query.label, status: '✅ Success' });
        }
      } catch (err: any) {
        newResults.push({ label: query.label, status: '❌ Exception', error: err.message });
      }
      setResults([...newResults]);
    }

    setRunning(false);
  };

  const insertTestProduct = async () => {
    const { data, error } = await supabase.from('products').insert([{
      name: 'Test Product',
      price: 29.99,
      category: 'skincare',
      stock: 10,
      description: 'A test product to verify the database is working.',
      image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800'
    }]).select();

    if (error) {
      alert(`Insert failed: ${error.message}`);
    } else {
      alert(`✅ Product inserted successfully! ID: ${data?.[0]?.id}`);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: 20, fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>🔧 Database Setup</h1>
      <p style={{ color: '#666', marginBottom: 30 }}>Use this page to diagnose and set up your Supabase database.</p>

      <div style={{ marginBottom: 30, padding: 20, background: '#f8f8f8', borderRadius: 8 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>Step 1: Test Connection</h2>
        <button onClick={testConnection} style={{ padding: '10px 20px', background: '#333', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
          Test Supabase Connection
        </button>
        {testResult && <p style={{ marginTop: 12, padding: 10, background: '#fff', borderRadius: 4 }}>{testResult}</p>}
      </div>

      <div style={{ marginBottom: 30, padding: 20, background: '#f0f7ff', borderRadius: 8 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>Step 2: Create Tables (via RPC)</h2>
        <p style={{ color: '#666', fontSize: 14, marginBottom: 12 }}>This tries to create tables using Supabase RPC. If it fails, you need to create them via the Supabase SQL Editor.</p>
        <button onClick={runMigration} disabled={running} style={{ padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', opacity: running ? 0.5 : 1 }}>
          {running ? 'Running...' : 'Run Migration'}
        </button>
        {results.length > 0 && (
          <div style={{ marginTop: 16 }}>
            {results.map((r, i) => (
              <div key={i} style={{ padding: 8, borderBottom: '1px solid #e0e0e0' }}>
                <span>{r.status} {r.label}</span>
                {r.error && <p style={{ color: 'red', fontSize: 12, margin: '4px 0 0 24px' }}>{r.error}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginBottom: 30, padding: 20, background: '#f0fff4', borderRadius: 8 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>Step 3: Test Insert</h2>
        <button onClick={insertTestProduct} style={{ padding: '10px 20px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
          Insert Test Product
        </button>
      </div>

      <div style={{ padding: 20, background: '#fffbeb', borderRadius: 8, border: '1px solid #fbbf24' }}>
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>⚠️ If Migration Fails</h2>
        <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>
          The RPC method only works if you have an <code>exec_sql</code> function set up. If it fails, go to your 
          <strong> Supabase Dashboard → Table Editor</strong> and check if you can see the tables. If not, go to 
          <strong> SQL Editor</strong>, create a new query, and <strong>type</strong> (don't paste) the first line:
        </p>
        <pre style={{ background: '#fff', padding: 12, borderRadius: 4, overflow: 'auto', fontSize: 13, marginTop: 8 }}>
{`create extension if not exists "uuid-ossp";`}
        </pre>
        <p style={{ fontSize: 14, color: '#666', marginTop: 8 }}>Click Run. Then type the next table creation query and run again, one at a time.</p>
      </div>
    </div>
  );
}
