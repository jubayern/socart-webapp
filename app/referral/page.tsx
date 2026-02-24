'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Copy, Users, ArrowUpRight, Check } from 'lucide-react'
import { api, getTelegramUser } from '../../lib/api'
import BottomNav from '../../components/BottomNav'

export default function ReferralPage() {
  const router = useRouter()
  const [user, setUser]       = useState<any>(null)
  const [info, setInfo]       = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied]   = useState(false)
  const [tab, setTab]         = useState<'info'|'history'|'withdraw'>('info')
  const [form, setForm]       = useState({ amount:'', method:'bkash', account:'' })
  const [withdrawing, setWithdrawing] = useState(false)
  const iS: React.CSSProperties = { width:'100%', padding:'12px 14px', borderRadius:12, border:'1.5px solid #e2e8f0', fontSize:13, color:'#0f172a', outline:'none' }

  useEffect(() => {
    const u = getTelegramUser(); setUser(u)
    if (!u) return
    api.get('/api/referral/info').then(r => { setInfo(r.data); setLoading(false) }).catch(()=>setLoading(false))
  }, [])

  const copy = () => {
    navigator.clipboard.writeText(info?.referral_code||'').catch(()=>{})
    setCopied(true); setTimeout(()=>setCopied(false), 2000)
  }

  const withdraw = async () => {
    if (!form.amount || !form.account) return
    setWithdrawing(true)
    try {
      await api.post('/api/referral/withdraw', { amount: +form.amount, method: form.method, account_number: form.account })
      alert('✅ Withdrawal requested! Admin will process within 24 hours.')
      setForm({ amount:'', method:'bkash', account:'' })
      api.get('/api/referral/info').then(r => setInfo(r.data)).catch(()=>{})
    } catch (e:any) { alert(e?.response?.data?.detail || 'Failed') }
    setWithdrawing(false)
  }

  if (!user) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}><p style={{ color:'#94a3b8' }}>Open via Telegram</p></div>

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', paddingBottom:80 }}>
      <header style={{ position:'sticky', top:0, zIndex:40, background:'white', borderBottom:'1px solid #f1f5f9', height:52, display:'flex', alignItems:'center', padding:'0 14px', gap:10 }}>
        <button onClick={() => router.back()} style={{ width:34, height:34, borderRadius:10, background:'#f8fafc', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
          <ChevronLeft size={18} color="#0f172a"/>
        </button>
        <p style={{ fontWeight:700, fontSize:15, color:'#0f172a' }}>Referral Program</p>
      </header>

      <div style={{ padding:'14px 14px', display:'flex', flexDirection:'column', gap:12 }}>
        {/* Balance */}
        <div style={{ background:'linear-gradient(135deg,#059669,#10b981)', borderRadius:20, padding:20, color:'white', textAlign:'center' }}>
          <p style={{ fontSize:13, opacity:.85, marginBottom:4 }}>Referral Balance</p>
          <p style={{ fontSize:40, fontWeight:800 }}>৳{(info?.referral_balance||0).toFixed(2)}</p>
          <p style={{ fontSize:12, opacity:.7, marginTop:4 }}>Earn {info?.pct||5}% on each referred order</p>
        </div>

        {/* Code */}
        <div style={{ background:'white', borderRadius:16, padding:16, border:'1px solid #dcfce7', display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:11, color:'#64748b', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }}>Your Code</p>
            <p style={{ fontSize:22, fontWeight:800, color:'#059669', fontFamily:'monospace', letterSpacing:'0.1em' }}>{info?.referral_code || '...'}</p>
          </div>
          <button onClick={copy} style={{ padding:'10px 16px', borderRadius:11, border:'none', background: copied?'#dcfce7':'#f0fdf4', color: copied?'#16a34a':'#059669', fontWeight:700, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
            {copied ? <><Check size={13}/>Copied</> : <><Copy size={13}/>Copy</>}
          </button>
        </div>

        {/* How it works */}
        <div style={{ background:'white', borderRadius:16, padding:14, border:'1px solid #f1f5f9' }}>
          <p style={{ fontWeight:700, fontSize:13, color:'#0f172a', marginBottom:10 }}>How it works</p>
          {[
            ['1', 'Share your code with friends'],
            ['2', 'Friend places an order using your code'],
            ['3', `You earn ${info?.pct||5}% of their order as balance`],
            ['4', 'Use balance at checkout or withdraw'],
          ].map(([n,t]) => (
            <div key={n} style={{ display:'flex', gap:10, marginBottom:8, alignItems:'flex-start' }}>
              <div style={{ width:22, height:22, borderRadius:'50%', background:'#ede9fe', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:11, fontWeight:800, color:'#7c3aed' }}>{n}</div>
              <p style={{ fontSize:12, color:'#475569', paddingTop:2 }}>{t}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', background:'white', borderRadius:14, padding:4, border:'1px solid #f1f5f9' }}>
          {([['info','Summary'],['history','History'],['withdraw','Withdraw']] as const).map(([t,l]) => (
            <button key={t} onClick={() => setTab(t)} style={{ flex:1, padding:'9px 6px', borderRadius:10, border:'none', cursor:'pointer', fontSize:12, fontWeight:700, background: tab===t?'linear-gradient(135deg,#059669,#10b981)':'transparent', color: tab===t?'white':'#64748b' }}>
              {l}
            </button>
          ))}
        </div>

        {tab === 'info' && (
          <div style={{ background:'white', borderRadius:16, padding:14, border:'1px solid #f1f5f9' }}>
            {[
              ['Total Earned', `৳${(info?.total_earned||0).toFixed(2)}`],
              ['Total Referrals', info?.history?.length||0],
              ['Pending Withdrawals', info?.withdrawals?.filter((w:any)=>w.status==='pending').length||0],
            ].map(([l,v]) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:'1px solid #f8fafc' }}>
                <span style={{ fontSize:13, color:'#64748b' }}>{l}</span>
                <span style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>{v}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'history' && (
          <div style={{ background:'white', borderRadius:16, border:'1px solid #f1f5f9', overflow:'hidden' }}>
            {(!info?.history||info.history.length===0) && <p style={{ textAlign:'center', padding:'24px', color:'#94a3b8', fontSize:13 }}>No referral history yet</p>}
            {info?.history?.map((h:any,i:number) => (
              <div key={h.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 14px', borderBottom: i<info.history.length-1?'1px solid #f8fafc':'none' }}>
                <div style={{ width:36, height:36, borderRadius:10, background:'#dcfce7', display:'flex', alignItems:'center', justifyContent:'center' }}><Users size={16} color="#059669"/></div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:12, fontWeight:600, color:'#0f172a' }}>{h.referred?.name||'User'}</p>
                  <p style={{ fontSize:11, color:'#94a3b8' }}>Order ৳{h.order_amount?.toFixed(0)}</p>
                </div>
                <span style={{ fontSize:13, fontWeight:800, color:'#059669' }}>+৳{h.earned_amount?.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'withdraw' && (
          <div style={{ background:'white', borderRadius:16, padding:16, border:'1px solid #f1f5f9', display:'flex', flexDirection:'column', gap:10 }}>
            <p style={{ fontSize:12, color:'#64748b' }}>Min withdrawal: ৳100 · Balance: <strong style={{ color:'#059669' }}>৳{(info?.referral_balance||0).toFixed(2)}</strong></p>
            <input value={form.amount} onChange={e => setForm(f=>({...f,amount:e.target.value}))} type="number" placeholder="Amount (৳)" style={iS}/>
            <select value={form.method} onChange={e => setForm(f=>({...f,method:e.target.value}))} style={iS}>
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
              <option value="rocket">Rocket</option>
            </select>
            <input value={form.account} onChange={e => setForm(f=>({...f,account:e.target.value}))} placeholder={`Your ${form.method} number`} style={iS}/>
            <button onClick={withdraw} disabled={withdrawing||!form.amount||!form.account} style={{ padding:'13px', borderRadius:12, border:'none', cursor:'pointer', fontWeight:700, fontSize:13, background:'linear-gradient(135deg,#059669,#10b981)', color:'white', opacity: (!form.amount||!form.account)?0.5:1 }}>
              {withdrawing ? 'Processing...' : 'Request Withdrawal'}
            </button>
            {/* Withdrawal history */}
            {info?.withdrawals?.length > 0 && (
              <div style={{ marginTop:8 }}>
                <p style={{ fontWeight:700, fontSize:13, color:'#0f172a', marginBottom:8 }}>Past Withdrawals</p>
                {info.withdrawals.map((w:any) => (
                  <div key={w.id} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #f8fafc', fontSize:12 }}>
                    <span style={{ color:'#64748b' }}>{w.method} · {w.account_number}</span>
                    <div style={{ textAlign:'right' }}>
                      <p style={{ fontWeight:700 }}>৳{w.amount}</p>
                      <span style={{ fontSize:10, padding:'1px 6px', borderRadius:99, background: w.status==='approved'?'#dcfce7':w.status==='rejected'?'#fee2e2':'#fef3c7', color: w.status==='approved'?'#16a34a':w.status==='rejected'?'#dc2626':'#d97706' }}>{w.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <BottomNav/>
    </div>
  )
}
