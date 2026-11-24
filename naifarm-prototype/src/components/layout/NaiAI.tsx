import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, Send, Sparkles, X } from 'lucide-react'
import { useDemo } from '../../lib/demo-store'

interface Msg {
  id: number
  from: 'ai' | 'user'
  text: string
  sources?: { label: string; to: string }[]
}

const chipsByWorkspace: Record<string, { label: string; reply: string; sources?: { label: string; to: string }[] }[]> = {
  W01: [
    {
      label: 'Gợi ý nông sản',
      reply:
        'Mùa này bạn có thể tham khảo chôm chôm Long Khánh và bưởi Tân Triều. Đây là gợi ý tham khảo, giá và tồn do nhà vườn công bố.',
      sources: [{ label: 'Mở Chợ', to: '/' }],
    },
    {
      label: 'Giải thích QR',
      reply:
        'Mã QR mở “Hộ chiếu nông sản” của lô hàng: mã lô, nhà sản xuất, nhật ký và mức xác minh. QR không bảo chứng an toàn thực phẩm.',
      sources: [{ label: 'Xem hộ chiếu mẫu', to: '/trace/NF-DEMO-001' }],
    },
    { label: 'Cách nhận hàng', reply: 'Bạn có thể chọn giao tận nơi hoặc nhận tại vườn/điểm nhận khi đặt hàng.' },
  ],
  W02: [
    { label: 'Hướng dẫn đăng bán', reply: 'Chỉ 3 bước: chụp ảnh → nói thông tin → kiểm tra và đăng.', sources: [{ label: 'Đăng sản phẩm', to: '/farmer/products/new' }] },
    { label: 'Cách ghi nhật ký', reply: 'Mở lô hàng, chọn “Thêm sự kiện”, nhập ảnh hoặc nói. Mỗi mốc lưu người ghi và thời gian.' },
    { label: 'Xem việc cần làm', reply: 'Hôm nay bạn có đơn chờ xác nhận và sản phẩm cần bổ sung tồn.', sources: [{ label: 'Xem đơn', to: '/farmer/orders' }] },
  ],
  W03: [
    { label: 'Tìm nhiệm vụ phù hợp', reply: 'Bạn có thể lọc theo kỹ năng, online/tại chỗ và thời lượng.', sources: [{ label: 'Nhiệm vụ', to: '/volunteer' }] },
    { label: 'Cách nộp minh chứng', reply: 'Mở nhiệm vụ, mục “Nộp minh chứng”, tải ảnh/file/link và ghi giờ thực tế. Nhà vườn xác nhận đầu ra, điều phối duyệt giờ.' },
  ],
  W04: [
    { label: 'Quy trình duyệt giờ', reply: 'Hai lớp xác nhận: nhà vườn xác nhận đầu ra, điều phối độc lập kiểm minh chứng rồi duyệt giờ. Không tự duyệt nhiệm vụ của mình.' },
    { label: 'Giải thích trạng thái hồ sơ', reply: 'Hồ sơ có thể ở mức: tự khai → đã đối chiếu tài liệu → xác nhận nguồn (chỉ đơn vị có thẩm quyền).' },
  ],
  W06: [{ label: 'Phạm vi quyền admin', reply: 'Admin quản lý định danh, tổ chức, grant và an toàn; không tự duyệt giờ, điểm, giá hay cấp chứng nhận.' }],
}

export function NaiAI() {
  const { workspace } = useDemo()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: 0,
      from: 'ai',
      text: 'Chào bạn, mình là NaiAI — trợ lý NaiFarm. Mình có thể hướng dẫn thao tác và giải thích thông tin trong ứng dụng. Nội dung do AI gợi ý, bạn nên kiểm tra lại.',
    },
  ])
  const seq = useRef(1)
  const chips = chipsByWorkspace[workspace] ?? chipsByWorkspace.W01
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [msgs, open])

  function send(text: string, reply?: string, sources?: { label: string; to: string }[]) {
    if (!text.trim()) return
    const id = seq.current++
    setMsgs((m) => [...m, { id, from: 'user', text }])
    setInput('')
    const found = chips.find((c) => c.label === text)
    const aiReply =
      reply ??
      found?.reply ??
      'Mình chưa có đủ dữ liệu để trả lời chắc chắn. Bạn thử hỏi cụ thể hơn, hoặc mở trang hướng dẫn tương ứng nhé. (Đây là trợ lý minh họa.)'
    window.setTimeout(() => {
      setMsgs((m) => [...m, { id: seq.current++, from: 'ai', text: aiReply, sources: sources ?? found?.sources }])
    }, 350)
  }

  return (
    <>
      <button
        aria-label="Mở trợ lý NaiAI"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-20 right-4 z-[55] flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-raised transition-transform active:scale-95 sm:bottom-6 sm:right-6"
      >
        {open ? <X size={22} aria-hidden /> : <MessageCircle size={24} aria-hidden />}
      </button>

      {open && (
        <div
          className="fixed inset-x-0 bottom-0 z-[56] flex max-h-[85dvh] flex-col rounded-t-xl border border-border bg-surface shadow-overlay sm:inset-x-auto sm:bottom-24 sm:right-6 sm:max-h-[560px] sm:w-[380px] sm:rounded-xl"
          role="dialog"
          aria-label="NaiAI · Trợ lý NaiFarm"
        >
          <header className="flex items-center gap-2 border-b border-border px-4 py-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles size={16} aria-hidden />
            </span>
            <div className="flex-1">
              <p className="text-[15px] font-bold text-text">NaiAI · Trợ lý NaiFarm</p>
              <p className="text-[12px] text-muted">Trợ lý minh họa · nội dung do AI gợi ý</p>
            </div>
            <button aria-label="Đóng" onClick={() => setOpen(false)} className="rounded-md p-1.5 hover:bg-surface-soft">
              <X size={18} aria-hidden />
            </button>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {msgs.map((m) => (
              <div key={m.id} className={m.from === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-[14px] ${
                    m.from === 'user' ? 'bg-primary text-on-primary' : 'bg-surface-soft text-text'
                  }`}
                >
                  {m.text}
                  {m.sources && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.sources.map((s) => (
                        <button
                          key={s.to}
                          onClick={() => {
                            navigate(s.to)
                            setOpen(false)
                          }}
                          className="rounded-full border border-primary/30 bg-surface px-2 py-0.5 text-[12px] font-semibold text-primary"
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="no-scrollbar flex gap-1.5 overflow-x-auto border-t border-border px-3 py-2">
            {chips.map((c) => (
              <button
                key={c.label}
                onClick={() => send(c.label)}
                className="whitespace-nowrap rounded-full border border-border bg-surface px-2.5 py-1 text-[12.5px] font-medium text-muted hover:text-text"
              >
                {c.label}
              </button>
            ))}
          </div>

          <form
            className="flex items-center gap-2 border-t border-border p-3"
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
          >
            <input
              aria-label="Nhập câu hỏi cho NaiAI"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi NaiAI…"
              className="h-11 flex-1 rounded-md border border-input-border bg-surface px-3 text-[14.5px]"
            />
            <button
              type="submit"
              aria-label="Gửi"
              className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-on-primary disabled:opacity-40"
              disabled={!input.trim()}
            >
              <Send size={18} aria-hidden />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
