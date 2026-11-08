import React, { useEffect, useState } from 'react';
import { supabase } from './supabase';

const emptyEntry = { entry_date: new Date().toISOString().slice(0,10), category: 'Site Expense', description: '', amount: '', party_name: '', reference_no: '' };
const emptyBill = { bill_type: 'RA Bill', bill_no: '', bill_date: new Date().toISOString().slice(0,10), client_name: '', gross_amount: '', gst_amount: '', net_amount: '' };

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [email,setEmail] = useState(''); const [password,setPassword] = useState('');
  const [tab,setTab] = useState('Dashboard'); const [entries,setEntries] = useState([]);
  const [bills,setBills] = useState([]); const [entry,setEntry] = useState(emptyEntry); const [bill,setBill] = useState(emptyBill);
  const [message,setMessage] = useState('');
  const isAdmin = profile?.role === 'admin';

  async function loadData() {
    if (!supabase) return;
    const [{data:e,error:ee},{data:b,error:be},{data:p}] = await Promise.all([
      supabase.from('site_transactions').select('*').order('entry_date',{ascending:false}),
      supabase.from('site_bills').select('*').order('bill_date',{ascending:false}),
      supabase.from('profiles').select('*').eq('id',session.user.id).maybeSingle()
    ]);
    if (ee || be) setMessage((ee || be).message);
    setEntries(e || []); setBills(b || []); setProfile(p || null);
  }
  useEffect(()=>{ if(!supabase) return; supabase.auth.getSession().then(({data})=>setSession(data.session)); const {data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s)); return ()=>subscription.unsubscribe(); },[]);
  useEffect(()=>{ if(session) loadData(); else {setEntries([]);setBills([]);setProfile(null);} },[session]);
  async function login(ev){ev.preventDefault();setMessage('');const {error}=await supabase.auth.signInWithPassword({email,password});setMessage(error?.message || 'Login successful');}
  async function addEntry(ev){ev.preventDefault();const {error}=await supabase.from('site_transactions').insert({...entry,amount:Number(entry.amount)});setMessage(error?.message || 'Entry saved');if(!error){setEntry(emptyEntry);loadData();}}
  async function addBill(ev){ev.preventDefault();const {error}=await supabase.from('site_bills').insert({...bill,gross_amount:Number(bill.gross_amount||0),gst_amount:Number(bill.gst_amount||0),net_amount:Number(bill.net_amount||0)});setMessage(error?.message || 'Bill saved');if(!error){setBill(emptyBill);loadData();}}
  async function logout(){await supabase.auth.signOut();}
  if(!supabase) return <main className="setup"><h1>PRANUSHA ERP</h1><p><b>Configuration required</b></p><p>Project URL aur Supabase publishable/anon key ko hosting environment variables mein set karein:</p><code>VITE_SUPABASE_URL</code><code>VITE_SUPABASE_ANON_KEY</code><p>Secret/service_role key kabhi browser app mein na daalein.</p></main>;
  if(!session) return <main className="login"><section className="panel"><h1>PRANUSHA ERP</h1><p>PRANUSHA INFRATECH PVT. LTD.</p><form onSubmit={login}><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></label><button>Login</button></form>{message && <p>{message}</p>}</section></main>;
  const income = bills.reduce((s,x)=>s+Number(x.net_amount||0),0);
  const expense = entries.filter(x=>x.category!=='Sales').reduce((s,x)=>s+Number(x.amount||0),0);
  return <div className="app"><header><div><h1>PRANUSHA ERP</h1><small>PRANUSHA INFRATECH PVT. LTD. · NTPC NABI NAGAR, BIHAR</small></div><div>{profile?.role || 'Staff'} <button className="secondary" onClick={logout}>Logout</button></div></header>
  <nav>{['Dashboard','Site Entry','RA / Final Bill','Register'].map(x=><button className={tab===x?'active':''} onClick={()=>setTab(x)} key={x}>{x}</button>)}</nav>
  <main>{message && <p className="message">{message}</p>}
  {tab==='Dashboard' && <><h2>Site Dashboard</h2><div className="cards"><article><small>Total Billing</small><strong>₹{income.toLocaleString('en-IN')}</strong></article><article><small>Site Expenses</small><strong>₹{expense.toLocaleString('en-IN')}</strong></article><article><small>Indicative Balance</small><strong>₹{(income-expense).toLocaleString('en-IN')}</strong></article></div><p className="note">Yeh basic billing-minus-expense summary hai; final audited Profit & Loss nahi.</p></>}
  {tab==='Site Entry' && <><h2>Site Transaction Entry</h2><form className="form" onSubmit={addEntry}><label>Date<input type="date" value={entry.entry_date} onChange={e=>setEntry({...entry,entry_date:e.target.value})}/></label><label>Category<select value={entry.category} onChange={e=>setEntry({...entry,category:e.target.value})}>{['Site Expense','Purchase','Sales','Labour','Contractor','Other'].map(x=><option>{x}</option>)}</select></label><label>Description<input required value={entry.description} onChange={e=>setEntry({...entry,description:e.target.value})}/></label><label>Amount<input type="number" min="0" step="0.01" required value={entry.amount} onChange={e=>setEntry({...entry,amount:e.target.value})}/></label><label>Party<input value={entry.party_name} onChange={e=>setEntry({...entry,party_name:e.target.value})}/></label><label>Reference No.<input value={entry.reference_no} onChange={e=>setEntry({...entry,reference_no:e.target.value})}/></label><button>Save Entry</button></form></>}
  {tab==='RA / Final Bill' && <><h2>Billing Entry</h2><form className="form" onSubmit={addBill}><label>Bill Type<select value={bill.bill_type} onChange={e=>setBill({...bill,bill_type:e.target.value})}><option>RA Bill</option><option>Final Bill</option></select></label><label>Bill No.<input required value={bill.bill_no} onChange={e=>setBill({...bill,bill_no:e.target.value})}/></label><label>Date<input type="date" value={bill.bill_date} onChange={e=>setBill({...bill,bill_date:e.target.value})}/></label><label>Client<input value={bill.client_name} onChange={e=>setBill({...bill,client_name:e.target.value})}/></label><label>Gross Amount<input type="number" step="0.01" value={bill.gross_amount} onChange={e=>setBill({...bill,gross_amount:e.target.value})}/></label><label>GST Amount<input type="number" step="0.01" value={bill.gst_amount} onChange={e=>setBill({...bill,gst_amount:e.target.value})}/></label><label>Net Amount<input type="number" step="0.01" value={bill.net_amount} onChange={e=>setBill({...bill,net_amount:e.target.value})}/></label><button>Save Bill</button></form></>}
  {tab==='Register' && <><h2>Recent Transactions</h2><div className="tablewrap"><table><thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th><th>Party</th></tr></thead><tbody>{entries.map(x=><tr key={x.id}><td>{x.entry_date}</td><td>{x.category}</td><td>{x.description}</td><td>₹{Number(x.amount).toLocaleString('en-IN')}</td><td>{x.party_name}</td></tr>)}</tbody></table></div><h2>Bills</h2><div className="tablewrap"><table><thead><tr><th>Type</th><th>Bill No.</th><th>Date</th><th>Net Amount</th></tr></thead><tbody>{bills.map(x=><tr key={x.id}><td>{x.bill_type}</td><td>{x.bill_no}</td><td>{x.bill_date}</td><td>₹{Number(x.net_amount).toLocaleString('en-IN')}</td></tr>)}</tbody></table></div></>}
  </main><footer>PRANUSHA ERP · Starter version</footer></div>;
}
