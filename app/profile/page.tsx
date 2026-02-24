'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Package, Heart, Tag, Coins, Users, TicketCheck, Bell, Settings, ChevronRight, Copy, Gift, MapPin, Zap } from 'lucide-react'
import { api, getTelegramUser } from '../../lib/api'
import BottomNav from '../../components/BottomNav'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser]       = useState<any>(null)
  const [info, setInfo]       = useState<any>(null)
  const [coins, setCoins]     = useState(0)
  const [copied, setCopied]   = useState(false)

  useEffect(() => {
    const u = getTelegramUser(); setUser(u)
    if (u) {
      api.get('/api/referral/info').then(r => setInfo(r.data)).catch(()=>{})
      api.get('/api/coins/balance').then(r => setCoins(r.data.balance||0)).catch(()=>{})
    }
  }, [])

  const copyCode = () => {
    if (!info?.referral_code) return
    navigator.clipboard.writeText(info.referral_code).catch(()=>{})
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const MENU = [
    { href:'/orders',        Icon:Package,     label:'My Orders',          sub:'Track all your orders'   },
    { href:'/wishlist',      Icon:Heart,       label:'Wishlist',            sub:'Saved products'          },
    { href:'/coins',         Icon:Coins,       label:'Coins & Rewards',     sub:`${coins} coins available` },
    { href:'/referral',      Icon:Users,       label:'Referral',            sub:'Earn by referring friends' },
    { href:'/support',       Icon:TicketCheck, label:'Support',             sub:'Help & tickets'          },
    { href:'/notifications', Icon:Bell,        label:'Notifications',       sub:'Alerts & updates'        },
    { href:'/order-tracking', Icon:MapPin,     label:'Track Order',         sub:'Real-time tracking'      },
  ]

  if (!user) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:12 }}>
      <Zap size={32} color="#7c3aed"/>
      <p style={{ color:'#94a3b8', fontSize:13 }}>Please open via Telegram</p>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', paddingBottom:80 }}>
      <header style={{ background:'white', borderBottom:'1px solid #f1f5f9', padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <p style={{ fontWeight:800, fontSize:17, color:'#0f172a' }}>Profile</p>
      </header>

      <div style={{ padding:'14px 14px', display:'flex', flexDirection:'column', gap:12 }}>

        {/* User Card */}
        <div style={{ background:'linear-gradient(135deg,#7c3aed,#4f46e5)', borderRadius:22, padding:20, color:'white' }}>
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
            <div style={{ width:56, height:56, borderRadius:18, background:'rgba(255,255,255,.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:800 }}>
              {user.first_name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p style={{ fontWeight:800, fontSize:17, marginBottom:2 }}>{user.first_name} {user.last_name||''}</p>
              {user.username && <p style={{ fontSize:12, opacity:.8 }}>@{user.username}</p>}
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
            {[
              { label:'Coins', val: coins, icon:'🪙' },
              { label:'Ref Balance', val: `৳${(info?.referral_balance||0).toFixed(0)}`, icon:'💰' },
              { label:'Orders', val: info?.total_orders||0, icon:'📦' },
            ].map(({label,val,icon}) => (
              <div key={label} style={{ background:'rgba(255,255,255,.15)', borderRadius:12, padding:'10px 8px', textAlign:'center' }}>
                <p style={{ fontSize:16 }}>{icon}</p>
                <p style={{ fontWeight:800, fontSize:15 }}>{val}</p>
                <p style={{ fontSize:10, opacity:.75 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Referral Code */}
        {info?.referral_code && (
          <div style={{ background:'white', borderRadius:16, padding:14, border:'1px solid #ede9fe', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:'#ede9fe', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Gift size={18} color="#7c3aed"/>
            </div>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em' }}>Your Referral Code</p>
              <p style={{ fontSize:17, fontWeight:800, color:'#7c3aed', fontFamily:'monospace', letterSpacing:'0.1em' }}>{info.referral_code}</p>
            </div>
            <button onClick={copyCode} style={{ padding:'8px 14px', borderRadius:10, background: copied?'#dcfce7':'#ede9fe', border:'none', cursor:'pointer', fontSize:12, fontWeight:700, color: copied?'#16a34a':'#7c3aed' }}>
              {copied ? '✓ Copied!' : <><Copy size={12}/> Copy</>}
            </button>
          </div>
        )}

        {/* Menu */}
        <div style={{ background:'white', borderRadius:18, border:'1px solid #f1f5f9', overflow:'hidden' }}>
          {MENU.map(({ href, Icon, label, sub }, i) => (
            <Link key={href} href={href} style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', borderBottom: i<MENU.length-1?'1px solid #f8fafc':'none', textDecoration:'none' }}>
              <div style={{ width:38, height:38, borderRadius:12, background:'#f5f3ff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Icon size={17} color="#7c3aed"/>
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:700, fontSize:13, color:'#0f172a' }}>{label}</p>
                <p style={{ fontSize:11, color:'#94a3b8', marginTop:1 }}>{sub}</p>
              </div>
              <ChevronRight size={15} color="#cbd5e1"/>
            </Link>
          ))}
        </div>
      </div>
      <BottomNav/>
    </div>
  )
}
