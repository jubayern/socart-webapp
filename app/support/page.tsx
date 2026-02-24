'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Send, Plus, X, MessageCircle } from 'lucide-react'
import { api, getTelegramUser } from '../../lib/api'
import BottomNav from '../../components/BottomNav'

const STATUS_STYLE: Record<string,any> = {
  open:        { bg:'#fee2e2', c:'#dc2626', label:'Open'        },
  in_progress: { bg:'#fef3c7', c:'#d97706', label:'In Progress' },
  closed:      { bg:'#dcfce7', c:'#16a34a', label:'Closed'      },
}

export default function SupportPage() {
  const router = useRouter()
  const [user, setUser]         = useState<any>(null)
  const [tickets, setTickets]   = useState<any[]>([])
  const [sel, setSel]           = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [reply, setReply]       = useState('')
  const [openForm, setOpenForm] = useState(false)
  const [form, setForm]         = useState({ subject:'', category:'order', message:'', order_id:'' })
  const [submitting, setSubmitting] = useState(false)
  const iS: React.CSSProperties = { width:'100%', padding:'11px 14px', borderRadius:11, border:'1.5px solid #e2e8f0', fontSize:13, color:'#0f172a', outline:'none', fontFamily:'DM Sans, sans-serif' }

  useEffect(() => {
    const u = getTelegramUser(); setUser(u)
    if (!u) return
    api.get('/api/support/tickets').then(r => setTickets(r.data)).catch(()=>{})
  }, [])

  const openTicket = async (t: any) => {
    const r = await api.get(`/api/support/tickets/${t.id}`).catch(()=>null)
    if (r) { setSel(r.data); setMessages(r.data.messages||[]) }
  }

  const sendReply = async () => {
    if (!reply.trim() || !sel) return
    try {
      await api.post(`/api/support/tickets/${sel.id}/reply`, { message: reply })
      setMessages(m => [...m, { sender:'user', message:reply, created_at:new Date().toISOString() }])
      setReply('')
    } catch {}
  }

  const createTicket = async () => {
    if (!form.subject || !form.message) return
    setSubmitting(true)
    try {
      await api.post('/api/support/tickets', form)
      api.get('/api/support/tickets').then(r => setTickets(r.data)).catch(()=>{})
      setOpenForm(false); setForm({ subject:'', category:'order', message:'', order_id:'' })
    } catch {}
    setSubmitting(false)
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', paddingBottom:80 }}>
      <header style={{ position:'sticky', top:0, zIndex:40, background:'white', borderBottom:'1px solid #f1f5f9', height:52, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 14px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={() => router.back()} style={{ width:34, height:34, borderRadius:10, background:'#f8fafc', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <ChevronLeft size={18} color="#0f172a"/>
          </button>
          <p style={{ fontWeight:700, fontSize:15, color:'#0f172a' }}>Support</p>
        </div>
        <button onClick={() => setOpenForm(true)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:10, background:'linear-gradient(135deg,#7c3aed,#4f46e5)', border:'none', cursor:'pointer', color:'white', fontSize:12, fontWeight:700 }}>
          <Plus size={13}/> New Ticket
        </button>
      </header>

      <div style={{ padding:'12px 14px', display:'flex', flexDirection:'column', gap:10 }}>
        {tickets.length === 0 ? (
          <div style={{ textAlign:'center', paddingTop:60 }}>
            <MessageCircle size={40} color="#e2e8f0" style={{ margin:'0 auto 12px' }}/>
            <p style={{ fontWeight:700, color:'#0f172a', marginBottom:6 }}>No tickets yet</p>
            <p style={{ fontSize:12, color:'#94a3b8', marginBottom:20 }}>Create a ticket for any issue</p>
            <button onClick={() => setOpenForm(true)} style={{ padding:'11px 24px', borderRadius:12, background:'linear-gradient(135deg,#7c3aed,#4f46e5)', border:'none', color:'white', fontWeight:700, fontSize:13, cursor:'pointer' }}>
              Create Ticket
            </button>
          </div>
        ) : tickets.map((t:any) => {
          const s = STATUS_STYLE[t.status]||STATUS_STYLE.open
          return (
            <div key={t.id} onClick={() => openTicket(t)} style={{ background:'white', borderRadius:16, padding:'13px 14px', border:'1px solid #f1f5f9', cursor:'pointer' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99, background:s.bg, color:s.c }}>{s.label}</span>
                <span style={{ fontSize:11, color:'#94a3b8' }}>{new Date(t.updated_at).toLocaleDateString()}</span>
              </div>
              <p style={{ fontWeight:700, fontSize:13, color:'#0f172a' }}>{t.subject}</p>
              <p style={{ fontSize:11, color:'#64748b', marginTop:2, textTransform:'capitalize' }}>{t.category}</p>
            </div>
          )
        })}
      </div>

      {/* Chat Sheet */}
      {sel && (
        <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'flex-end' }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.6)' }} onClick={() => setSel(null)}/>
          <div className="anim-slideup" style={{ position:'relative', width:'100%', height:'88vh', display:'flex', flexDirection:'column', background:'white', borderRadius:'20px 20px 0 0' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom:'1px solid #f1f5f9' }}>
              <div>
                <p style={{ fontWeight:700, fontSize:14, color:'#0f172a' }}>{sel.subject}</p>
                <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:99, background:STATUS_STYLE[sel.status]?.bg, color:STATUS_STYLE[sel.status]?.c }}>{STATUS_STYLE[sel.status]?.label}</span>
              </div>
              <button onClick={() => setSel(null)} style={{ width:30, height:30, borderRadius:8, background:'#f8fafc', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><X size={14} color="#64748b"/></button>
            </div>
            <div style={{ flex:1, overflowY:'auto', padding:'14px 16px', display:'flex', flexDirection:'column', gap:10 }}>
              {messages.map((m:any,i:number) => (
                <div key={i} style={{ display:'flex', flexDirection:'column', alignItems: m.sender==='user'?'flex-end':'flex-start' }}>
                  <div style={{ maxWidth:'80%', padding:'10px 13px', borderRadius:14, fontSize:13, background: m.sender==='user'?'linear-gradient(135deg,#7c3aed,#4f46e5)':'#f8fafc', color: m.sender==='user'?'white':'#0f172a', border: m.sender==='admin'?'1px solid #e2e8f0':undefined }}>
                    {m.message}
                  </div>
                  <p style={{ fontSize:10, color:'#94a3b8', marginTop:3 }}>{m.sender==='user'?'You':'Support'} · {new Date(m.created_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</p>
                </div>
              ))}
            </div>
            {sel.status !== 'closed' && (
              <div style={{ padding:'12px 14px 28px', borderTop:'1px solid #f1f5f9', display:'flex', gap:9 }}>
                <input value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => e.key==='Enter' && sendReply()} placeholder="Type message..." style={{ ...iS, flex:1 }}/>
                <button onClick={sendReply} disabled={!reply.trim()} style={{ width:44, height:44, borderRadius:11, border:'none', background:'linear-gradient(135deg,#7c3aed,#4f46e5)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', opacity:!reply.trim()?0.5:1 }}>
                  <Send size={16} color="white"/>
                </button>
              </div>
            )}
            {sel.status === 'closed' && <div style={{ padding:'12px 14px 28px', textAlign:'center' }}><p style={{ fontSize:12, color:'#94a3b8' }}>This ticket is closed</p></div>}
          </div>
        </div>
      )}

      {/* New Ticket Form */}
      {openForm && (
        <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'flex-end' }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.6)' }} onClick={() => setOpenForm(false)}/>
          <div className="anim-slideup" style={{ position:'relative', width:'100%', background:'white', borderRadius:'20px 20px 0 0', padding:'16px 16px 32px' }}>
            <div style={{ display:'flex', justifyContent:'center', marginBottom:10 }}><div style={{ width:34, height:3, borderRadius:99, background:'#e2e8f0' }}/></div>
            <p style={{ fontWeight:800, fontSize:15, color:'#0f172a', marginBottom:14 }}>New Support Ticket</p>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <select value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))} style={iS}>
                <option value="order">Order Issue</option>
                <option value="payment">Payment Issue</option>
                <option value="delivery">Delivery Issue</option>
                <option value="other">Other</option>
              </select>
              <input value={form.subject} onChange={e => setForm(f=>({...f,subject:e.target.value}))} placeholder="Subject *" style={iS}/>
              <input value={form.order_id} onChange={e => setForm(f=>({...f,order_id:e.target.value}))} placeholder="Order Number (optional)" style={iS}/>
              <textarea value={form.message} onChange={e => setForm(f=>({...f,message:e.target.value}))} rows={4} placeholder="Describe your issue *" style={{ ...iS, resize:'none' }}/>
              <button onClick={createTicket} disabled={submitting||!form.subject||!form.message} style={{ padding:'13px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#7c3aed,#4f46e5)', color:'white', fontWeight:700, fontSize:14, cursor:'pointer', opacity:(!form.subject||!form.message)?0.5:1 }}>
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </div>
          </div>
        </div>
      )}
      <BottomNav/>
    </div>
  )
}
