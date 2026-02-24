'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Coins, CheckCircle, RotateCcw, Gift, Clock, Zap } from 'lucide-react'
import { api, getTelegramUser } from '../../lib/api'
import BottomNav from '../../components/BottomNav'

export default function CoinsPage() {
  const router = useRouter()
  const [user, setUser]         = useState<any>(null)
  const [balance, setBalance]   = useState(0)
  const [history, setHistory]   = useState<any[]>([])
  const [rewards, setRewards]   = useState<any[]>([])
  const [checkinStatus, setCS]  = useState<any>(null)
  const [prizes, setPrizes]     = useState<any[]>([])
  const [tab, setTab]           = useState<'rewards'|'history'|'spin'>('rewards')
  const [checkinLoading, setCL] = useState(false)
  const [spinLoading, setSL]    = useState(false)
  const [spinResult, setSpinResult] = useState<any>(null)
  const [claimingId, setClaimingId] = useState<string|null>(null)
  const [claimedId, setClaimedId]   = useState<string|null>(null)

  useEffect(() => {
    const u = getTelegramUser(); setUser(u)
    if (!u) return
    api.get('/api/coins/balance').then(r => setBalance(r.data.balance||0)).catch(()=>{})
    api.get('/api/coins/history').then(r => setHistory(r.data)).catch(()=>{})
    api.get('/api/coins/rewards').then(r => setRewards(r.data)).catch(()=>{})
    api.get('/api/coins/checkin/status').then(r => setCS(r.data)).catch(()=>{})
    api.get('/api/coins/spin/prizes').then(r => setPrizes(r.data)).catch(()=>{})
  }, [])

  const checkin = async () => {
    if (!user || checkinStatus?.checked_today) return
    setCL(true)
    try {
      const r = await api.post('/api/coins/checkin')
      setBalance(r.data.new_balance)
      setCS((s:any) => ({...s, checked_today: true, streak: r.data.streak}))
      alert(`🎉 +${r.data.coins_earned} coins! Streak: ${r.data.streak} days`)
    } catch (e: any) { alert(e?.response?.data?.detail || 'Failed') }
    setCL(false)
  }

  const spin = async () => {
    if (!user) return
    setSL(true); setSpinResult(null)
    try {
      const r = await api.post('/api/coins/spin')
      setSpinResult(r.data); setBalance(r.data.new_balance)
    } catch (e: any) { alert(e?.response?.data?.detail || 'Not enough coins') }
    setSL(false)
  }

  const claim = async (rewardId: string) => {
    if (!user) return
    setClaimingId(rewardId)
    try {
      const r = await api.post(`/api/coins/claim/${rewardId}`)
      setBalance(r.data.new_balance)
      setClaimedId(rewardId)
      const msg = r.data.coupon_code ? `Claimed! Coupon: ${r.data.coupon_code}` : 'Claimed successfully!'
      alert(`✅ ${msg}`)
    } catch (e: any) { alert(e?.response?.data?.detail || 'Failed to claim') }
    setClaimingId(null)
  }

  const TYPE_ICON: Record<string,string> = { order:'📦', checkin:'📅', spin:'🎰', birthday:'🎂', claim:'🎁', referral:'👥', double_event:'⚡' }

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', paddingBottom:80 }}>
      <header style={{ position:'sticky', top:0, zIndex:40, background:'white', borderBottom:'1px solid #f1f5f9', height:52, display:'flex', alignItems:'center', padding:'0 14px', gap:10 }}>
        <button onClick={() => router.back()} style={{ width:34, height:34, borderRadius:10, background:'#f8fafc', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
          <ChevronLeft size={18} color="#0f172a"/>
        </button>
        <p style={{ fontWeight:700, fontSize:15, color:'#0f172a' }}>Coins & Rewards</p>
      </header>

      <div style={{ padding:'14px 14px', display:'flex', flexDirection:'column', gap:12 }}>

        {/* Balance Card */}
        <div style={{ background:'linear-gradient(135deg,#7c3aed,#4f46e5)', borderRadius:20, padding:20, color:'white', textAlign:'center' }}>
          <p style={{ fontSize:13, fontWeight:600, opacity:.8, marginBottom:4 }}>Your Coins</p>
          <p style={{ fontSize:42, fontWeight:800, letterSpacing:'-1px' }}>🪙 {balance}</p>
          <p style={{ fontSize:12, opacity:.7, marginTop:4 }}>Keep shopping to earn more!</p>
        </div>

        {/* Daily Check-in */}
        <div style={{ background:'white', borderRadius:16, padding:16, border:'1px solid #f1f5f9' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <p style={{ fontWeight:700, fontSize:14, color:'#0f172a' }}>Daily Check-in</p>
              <p style={{ fontSize:12, color:'#64748b', marginTop:2 }}>
                Streak: {checkinStatus?.streak||0} days 🔥 · Earn {checkinStatus?.coins_to_earn||5} coins
              </p>
            </div>
            <button onClick={checkin} disabled={checkinStatus?.checked_today || checkinLoading} style={{
              padding:'9px 18px', borderRadius:11, border:'none', cursor:'pointer', fontWeight:700, fontSize:12,
              background: checkinStatus?.checked_today ? '#dcfce7' : 'linear-gradient(135deg,#7c3aed,#4f46e5)',
              color: checkinStatus?.checked_today ? '#16a34a' : 'white',
              opacity: checkinStatus?.checked_today ? 1 : undefined,
            }}>
              {checkinLoading ? '...' : checkinStatus?.checked_today ? '✓ Done' : 'Check In'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', background:'white', borderRadius:14, padding:4, border:'1px solid #f1f5f9' }}>
          {([['rewards','Rewards'],['spin','Spin Wheel'],['history','History']] as const).map(([t,l]) => (
            <button key={t} onClick={() => setTab(t)} style={{ flex:1, padding:'9px 6px', borderRadius:10, border:'none', cursor:'pointer', fontSize:12, fontWeight:700, background: tab===t?'linear-gradient(135deg,#7c3aed,#4f46e5)':'transparent', color: tab===t?'white':'#64748b' }}>
              {l}
            </button>
          ))}
        </div>

        {/* Rewards */}
        {tab === 'rewards' && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {rewards.length === 0 && <p style={{ textAlign:'center', color:'#94a3b8', padding:'24px 0', fontSize:13 }}>No rewards available</p>}
            {rewards.map((r:any) => (
              <div key={r.id} style={{ background:'white', borderRadius:16, padding:14, border:'1px solid #f1f5f9', display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:46, height:46, borderRadius:13, background:'#f5f3ff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:22 }}>
                  {r.type==='free_delivery'?'🚚':r.type==='discount_coupon'?'🎟️':'💰'}
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontWeight:700, fontSize:13, color:'#0f172a' }}>{r.title}</p>
                  {r.description && <p style={{ fontSize:11, color:'#64748b', marginTop:2 }}>{r.description}</p>}
                  <p style={{ fontSize:12, fontWeight:800, color:'#7c3aed', marginTop:4 }}>🪙 {r.coin_cost} coins</p>
                </div>
                <button onClick={() => claim(r.id)} disabled={!!claimingId || balance < r.coin_cost || claimedId===r.id} style={{ padding:'8px 14px', borderRadius:10, border:'none', cursor:'pointer', fontWeight:700, fontSize:12, background: claimedId===r.id?'#dcfce7':balance<r.coin_cost?'#f1f5f9':'linear-gradient(135deg,#7c3aed,#4f46e5)', color: claimedId===r.id?'#16a34a':balance<r.coin_cost?'#94a3b8':'white', opacity: claimingId===r.id?0.6:1 }}>
                  {claimedId===r.id ? '✓' : claimingId===r.id ? '...' : balance < r.coin_cost ? 'Need more' : 'Claim'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Spin Wheel */}
        {tab === 'spin' && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ background:'white', borderRadius:18, padding:20, border:'1px solid #f1f5f9', textAlign:'center' }}>
              <div style={{ width:100, height:100, borderRadius:'50%', background:'linear-gradient(135deg,#7c3aed,#4f46e5)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', boxShadow:'0 8px 24px rgba(109,40,217,.3)', fontSize:40 }}>
                🎰
              </div>
              <p style={{ fontWeight:700, fontSize:15, color:'#0f172a', marginBottom:4 }}>Spin the Wheel</p>
              <p style={{ fontSize:12, color:'#64748b', marginBottom:16 }}>Costs 50 coins per spin</p>
              <button onClick={spin} disabled={spinLoading || balance < 50} style={{ padding:'13px 32px', borderRadius:13, border:'none', cursor:'pointer', fontWeight:800, fontSize:14, background: balance<50?'#f1f5f9':'linear-gradient(135deg,#7c3aed,#4f46e5)', color: balance<50?'#94a3b8':'white', boxShadow: balance>=50?'0 4px 14px rgba(109,40,217,.3)':undefined }}>
                {spinLoading ? '🎰 Spinning...' : balance < 50 ? 'Need 50 coins' : '🎰 Spin! (50 coins)'}
              </button>
              {spinResult && (
                <div style={{ marginTop:16, padding:14, borderRadius:14, background:'#f5f3ff', border:'1px solid #ede9fe' }}>
                  <p style={{ fontWeight:800, fontSize:16, color:'#7c3aed' }}>🎉 You won: {spinResult.prize.label}!</p>
                  {spinResult.coupon_code && <p style={{ fontSize:13, color:'#64748b', marginTop:6, fontFamily:'monospace', fontWeight:700 }}>Coupon: {spinResult.coupon_code}</p>}
                  <p style={{ fontSize:12, color:'#94a3b8', marginTop:4 }}>Balance: 🪙 {spinResult.new_balance}</p>
                </div>
              )}
            </div>
            {/* Prize list */}
            <div style={{ background:'white', borderRadius:16, padding:14, border:'1px solid #f1f5f9' }}>
              <p style={{ fontWeight:700, fontSize:13, color:'#0f172a', marginBottom:10 }}>Possible Prizes</p>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {prizes.map((pr:any) => (
                  <div key={pr.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 10px', borderRadius:10, background:'#f8fafc' }}>
                    <p style={{ fontSize:12, fontWeight:600, color:'#0f172a' }}>{pr.label}</p>
                    <p style={{ fontSize:11, color:'#94a3b8' }}>{(pr.probability*100).toFixed(0)}% chance</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* History */}
        {tab === 'history' && (
          <div style={{ background:'white', borderRadius:18, border:'1px solid #f1f5f9', overflow:'hidden' }}>
            {history.length === 0 && <p style={{ textAlign:'center', padding:'24px', color:'#94a3b8', fontSize:13 }}>No transactions yet</p>}
            {history.map((h:any, i:number) => (
              <div key={h.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderBottom: i<history.length-1?'1px solid #f8fafc':'none' }}>
                <span style={{ fontSize:20 }}>{TYPE_ICON[h.type]||'🪙'}</span>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:12, fontWeight:600, color:'#0f172a' }}>{h.description}</p>
                  <p style={{ fontSize:11, color:'#94a3b8', marginTop:1 }}>{new Date(h.created_at).toLocaleDateString()}</p>
                </div>
                <span style={{ fontWeight:800, fontSize:13, color: h.amount>0?'#10b981':'#ef4444' }}>
                  {h.amount>0?'+':''}{h.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav/>
    </div>
  )
}
