import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  Camera,
  Check,
  ImageIcon,
  Mic,
  MicOff,
  Save,
  Sparkles,
  Wand2,
} from 'lucide-react'
import { useDemo } from '../../lib/demo-store'
import { Badge, Button, Card, DemoTag, Field, Input, Notice, Textarea } from '../../components/ui'
import { ProduceImage } from '../../components/domain'

const steps = ['Chụp ảnh', 'Nói thông tin', 'Kiểm tra & đăng']

export function PublishWizard() {
  const { pushToast } = useDemo()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [photo, setPhoto] = useState<string | null>(null)
  const [camDenied, setCamDenied] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [micDenied, setMicDenied] = useState(false)
  const [recording, setRecording] = useState(false)
  const [aiState, setAiState] = useState<'idle' | 'thinking' | 'done' | 'error'>('idle')
  const [reviewed, setReviewed] = useState(false)

  const [draft, setDraft] = useState({
    name: '',
    category: 'Trái cây',
    price: '',
    unit: 'kg',
    stock: '',
    description: '',
  })

  function runAi() {
    setAiState('thinking')
    window.setTimeout(() => {
      // Mô phỏng AI trích xuất cấu trúc từ lời nói — không thêm chứng nhận/nguồn gốc
      setDraft({
        name: 'Chôm chôm Java',
        category: 'Trái cây',
        price: '35000',
        unit: 'kg',
        stock: '30',
        description:
          'Chôm chôm Java tách hạt, vỏ đỏ, vị ngọt thanh. Thu hoạch tại vườn, đóng theo yêu cầu.',
      })
      setAiState('done')
    }, 1300)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center gap-2">
        <DemoTag />
        <span className="text-[13px] text-muted">Đăng bán bằng ảnh và lời nói</span>
      </div>

      {/* Step indicator */}
      <ol className="flex items-center gap-2">
        {steps.map((s, i) => (
          <li key={s} className="flex flex-1 items-center gap-2">
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[14px] font-bold ${
                i < step ? 'bg-primary text-on-primary' : i === step ? 'bg-primary text-on-primary' : 'bg-surface-soft text-muted'
              }`}
            >
              {i < step ? <Check size={16} aria-hidden /> : i + 1}
            </span>
            <span className={`hidden text-[14px] font-semibold sm:block ${i === step ? 'text-text' : 'text-muted'}`}>{s}</span>
            {i < steps.length - 1 && <span className="h-px flex-1 bg-border" aria-hidden />}
          </li>
        ))}
      </ol>

      {/* Step 1 — photo */}
      {step === 0 && (
        <Card className="space-y-4">
          <h2 className="text-[20px] font-bold text-text">Chụp ảnh sản phẩm</h2>
          <p className="text-[15px] text-muted">
            Đặt sản phẩm ở nơi đủ sáng, chụp cận cảnh để thấy rõ màu và hình dáng.
          </p>
          {photo ? (
            <div className="flex items-center gap-3">
              <ProduceImage seed="upload" label="Ảnh đã chọn" className="h-28 w-28" rounded="rounded-md" />
              <div>
                <p className="text-[15px] font-semibold text-text">{photo}</p>
                <Button variant="ghost" size="sm" onClick={() => setPhoto(null)}>
                  Chọn ảnh khác
                </Button>
              </div>
            </div>
          ) : camDenied ? (
            <Notice tone="warning">
              <span className="flex items-center gap-1">
                <AlertTriangle size={15} aria-hidden /> Chưa được cấp quyền camera.
              </span>
              <p className="mt-1">
                Bạn có thể cho phép lại trong cài đặt trình duyệt, hoặc chọn ảnh có sẵn trong máy.
              </p>
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => { setCamDenied(false); setPhoto('anh_chom_chom.jpg') }}>
                  <ImageIcon size={15} aria-hidden /> Chọn từ thư viện
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setCamDenied(false)}>
                  Thử lại
                </Button>
              </div>
            </Notice>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Button variant="farmer" onClick={() => setPhoto('anh_chom_chom.jpg')}>
                <Camera size={20} aria-hidden /> Chụp ảnh
              </Button>
              <Button variant="secondary" size="lg" onClick={() => setPhoto('anh_tu_thu_vien.jpg')}>
                <ImageIcon size={18} aria-hidden /> Chọn ảnh
              </Button>
            </div>
          )}
          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-[13.5px] text-muted">
              <input type="checkbox" checked={camDenied} onChange={(e) => setCamDenied(e.target.checked)} />
              Mô phỏng bị từ chối quyền camera
            </label>
            <Button disabled={!photo} onClick={() => setStep(1)}>
              Tiếp tục
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2 — voice */}
      {step === 1 && (
        <Card className="space-y-4">
          <h2 className="text-[20px] font-bold text-text">Nói thông tin sản phẩm</h2>
          <p className="text-[15px] text-muted">
            Ví dụ: “Tôi có 30 ký chôm chôm, bán 35 nghìn một ký”. Bạn cũng có thể gõ tay.
          </p>

          {micDenied ? (
            <Notice tone="warning">
              <span className="flex items-center gap-1">
                <MicOff size={15} aria-hidden /> Chưa nhận được giọng nói.
              </span>
              <p className="mt-1">Bạn có thể thử lại hoặc nhập bằng tay bên dưới.</p>
            </Notice>
          ) : (
            <button
              onClick={() => {
                setRecording(true)
                window.setTimeout(() => {
                  setRecording(false)
                  setTranscript('Tôi có 30 ký chôm chôm, bán 35 nghìn một ký')
                }, 1800)
              }}
              className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-dashed border-primary bg-primary/5 py-6 text-primary"
            >
              {recording ? (
                <>
                  <span className="flex items-end gap-0.5" aria-hidden>
                    {[0, 1, 2, 3].map((i) => (
                      <span key={i} className="nf-wave h-6 w-1 rounded-full bg-primary" style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </span>
                  <span className="text-[16px] font-semibold">Đang ghi âm… (bấm dừng mô phỏng)</span>
                </>
              ) : (
                <>
                  <Mic size={24} aria-hidden />
                  <span className="text-[17px] font-semibold">Bấm để nói</span>
                </>
              )}
            </button>
          )}

          <Field label="Hoặc nhập bằng tay" htmlFor="trans">
            <Textarea
              id="trans"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Gõ thông tin sản phẩm…"
            />
          </Field>

          <label className="flex cursor-pointer items-center gap-2 text-[13.5px] text-muted">
            <input type="checkbox" checked={micDenied} onChange={(e) => setMicDenied(e.target.checked)} />
            Mô phỏng nhận giọng nói thất bại
          </label>

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(0)}>
              Quay lại
            </Button>
            <Button
              disabled={!transcript.trim()}
              onClick={() => {
                setStep(2)
                runAi()
              }}
            >
              <Wand2 size={17} aria-hidden /> Tạo bản nháp
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3 — AI draft review */}
      {step === 2 && (
        <Card className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-[20px] font-bold text-text">Kiểm tra bản nháp</h2>
            <Badge tone="warning" icon={<Sparkles size={12} aria-hidden />}>
              AI gợi ý — vui lòng kiểm tra
            </Badge>
          </div>

          {aiState === 'thinking' ? (
            <div className="flex items-center gap-3 rounded-md bg-surface-soft px-4 py-6 text-muted">
              <span className="flex gap-1" aria-hidden>
                <span className="nf-dot h-2 w-2 rounded-full bg-primary" />
                <span className="nf-dot h-2 w-2 rounded-full bg-primary" />
                <span className="nf-dot h-2 w-2 rounded-full bg-primary" />
              </span>
              <span className="text-[15px]">Đang tạo bản nháp…</span>
            </div>
          ) : (
            <div className="space-y-4">
              <Notice tone="info">
                Nội dung dưới đây do AI đề xuất từ ảnh và lời nói của bạn. AI <strong>không tự thêm</strong> chứng nhận,
                nguồn gốc hay công dụng. Vui lòng kiểm tra và sửa trước khi đăng.
              </Notice>

              <Field label="Tên sản phẩm" htmlFor="name">
                <Input id="name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Giá (đ/kg)" htmlFor="price">
                  <Input id="price" inputMode="numeric" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} />
                </Field>
                <Field label="Tồn kho (kg)" htmlFor="stock">
                  <Input id="stock" inputMode="numeric" value={draft.stock} onChange={(e) => setDraft({ ...draft, stock: e.target.value })} />
                </Field>
              </div>
              <Field label="Mô tả" htmlFor="desc" hint="Trường chưa rõ nên để trống, không suy diễn.">
                <Textarea id="desc" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
              </Field>

              <Card className="flex items-start gap-3 bg-surface-soft">
                <AlertTriangle size={17} className="mt-0.5 text-warning" aria-hidden />
                <p className="text-[13.5px] text-muted">
                  Bản nháp <strong>không</strong> gắn nhãn OCOP/VietGAP hay cam kết an toàn thực phẩm. Nếu bạn có hồ sơ
                  chứng nhận, hãy gửi để đối chiếu ở mục Hồ sơ.
                </p>
              </Card>

              <label className="flex items-start gap-2 text-[14px] text-text">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={reviewed}
                  onChange={(e) => setReviewed(e.target.checked)}
                />
                Tôi đã kiểm tra thông tin và xác nhận đăng sản phẩm này.
              </label>
            </div>
          )}

          <div className="flex flex-wrap justify-between gap-2">
            <Button variant="ghost" onClick={() => setStep(1)}>
              Quay lại
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => pushToast('Đã lưu bản nháp (demo)', 'info')}>
                <Save size={16} aria-hidden /> Lưu nháp
              </Button>
              <Button
                variant="farmer"
                disabled={!reviewed || aiState !== 'done'}
                onClick={() => {
                  pushToast('Đã đăng sản phẩm (demo) — chờ hiển thị trên chợ', 'success')
                  navigate('/farmer')
                }}
              >
                Đăng sản phẩm
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
