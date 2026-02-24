'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Bell, Package, Coins, Tag, RefreshCw } from 'lucide-react'
import { api, getTelegramUser } from '../../lib/api'
import BottomNav from '../../components/BottomNav'

const TYPE_ICON: Record<string,any> = {
  order:   { icon:'📦', bg:'#ede9fe', c:'#7c3aed' },
  coin:    { icon:'🪙', bg:'#fef3c7', c:'#d97706' },
  offer:   { icon:'🎁', bg:'#dcfce7', c:'#16a34a' },
  restock: { icon:'🔔', bg:'#dbeafe', c:'#2563eb' },
  ticket:  { icon:'💬', bg:'#f5f3ff', c:'#7c3aed' },
  referral:{ icon:'👥', bg:'#dcfce7', c:'#059669' },
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifs, setNotifs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const u = getTelegramUser()
    if (!u) return
    api.get('/api/notifications').then(r => { setNotifs(r.data); setLoading(false) }).catch(()=>setLoading(false))
    api.put('/api/notifications/read-all').catch(()=>{})
  }, [])

  const markRead = (id: string) => {
    api.put(`/api/notifications/${id}/read`).catch(()=>{})
    setNotifs(n => n.map(x => x.id===id ? {...x, is_read:true} : x))
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', paddingBottom:80 }}>
      <header style={{ position:'sticky', top:0, zIndex:40, background:'white', borderBottom:'1px solid #f1f5f9', height:52, display:'flex', alignItems:'center', padding:'0 14px', gap:10 }}>
        <button onClick={() => router.back()} style={{ width:34, height:34, borderRadius:10, background:'#f8fafc', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
          <ChevronLeft size={18} color="#0f172a"/>
        </button>
        <p style={{ fontWeight:700, fontSize:15, color:'#0f172a' }}>Notifications</p>
      </header>

      <div style={{ padding:'12px 14px', display:'flex', flexDirection:'column', gap:8 }}>
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', paddingTop:60 }}>
            <div style={{ width:28, height:28, borderRadius:'50%', border:'3px solid #ede9fe', borderTopColor:'#7c3aed', animation:'spin 1s linear infinite' }}/>
          </div>
        ) : notifs.length === 0 ? (
          <div style={{ textAlign:'center', paddingTop:60 }}>
            <Bell size={40} color="#e2e8f0" style={{ margin:'0 auto 12px' }}/>
            <p style={{ fontWeight:700, color:'#0f172a', marginBottom:4 }}>No notifications yet</p>
            <p style={{ fontSize:12, color:'#94a3b8' }}>Order updates and offers will appear here</p>
          </div>
        ) : notifs.map((n:any) => {
          const cfg = TYPE_ICON[n.type] || TYPE_ICON.offer
          return (
            <div key={n.id} onClick={() => markRead(n.id)} style={{ background: n.is_read?'white':'#faf7ff', borderRadius:16, padding:'13px 14px', border:`1px solid ${n.is_read?'#f1f5f9':'#ede9fe'}`, display:'flex', gap:12, cursor:'pointer' }}>
              <div style={{ width:42, height:42, borderRadius:13, background:cfg.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:20 }}>
                {cfg.icon}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', justifyContent:'space-between', gap:8, marginBottom:3 }}>
                  <p style={{ fontWeight:700, fontSize:13, color:'#0f172a' }}>{n.title}</p>
                  {!n.is_read && <div style={{ width:8, height:8, borderRadius:'50%', background:'#7c3aed', flexShrink:0, marginTop:3 }}/>}
                </div>
                {n.body && <p style={{ fontSize:12, color:'#64748b' }}>{n.body}</p>}
                <p style={{ fontSize:11, color:'#94a3b8', marginTop:4 }}>{new Date(n.created_at).toLocaleString()}</p>
              </div>
            </div>
          )
        })}
      </div>
      <BottomNav/>
    </div>
  )
}
