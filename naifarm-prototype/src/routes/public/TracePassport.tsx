import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BadgeCheck, Calendar, MapPin, QrCode, ScanLine, ShieldAlert, User } from 'lucide-react'
import { useData } from '../../lib/data'
import { certLabel, certTone, sourceStatusLabel } from '../../lib/labels'
import { Badge, Button, Card, DemoTag, Input, Notice, Timeline } from '../../components/ui'
import { TraceQR } from '../../components/domain/TraceQR'
import { date } from '../../lib/format'

export function TracePassport() {
  const { batchByCode, certificates, farmById, productById } = useData()
  const { code } = useParams()
  const navigate = useNavigate()
  const [manual, setManual] = useState('')
  const batch = code ? batchByCode(code) : undefined

  if (!batch) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <Card className="flex flex-col items-center gap-3 text-center">
          <ShieldAlert size={32} className="text-warning" aria-hidden />
          <h1 className="text-[20px] font-bold text-text">Không tìm thấy hộ chiếu</h1>
          <p className="text-[14px] text-muted">
            Mã QR không hợp lệ hoặc không tồn tại. Bạn có thể nhập mã lô bằng tay (ví dụ: <code>NF-DEMO-001</code>).
          </p>
          <div className="mt-2 flex w-full gap-2">
            <Input
              aria-label="Nhập mã lô"
              placeholder="Nhập mã lô, ví dụ NF-DEMO-001"
              value={manual}
              onChange={(e) => setManual(e.target.value)}
            />
            <Button onClick={() => navigate(`/trace/${manual.trim()}`)} disabled={!manual.trim()}>
              Tra cứu
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const product = productById(batch.productId)
  const farm = farmById(batch.farmId)
  const certs = certificates.filter((c) => c.farmId === batch.farmId)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="primary" icon={<QrCode size={13} aria-hidden />}>
          Hộ chiếu nông sản
        </Badge>
        <DemoTag />
      </div>

      <div className="grid gap-6 md:grid-cols-[auto_1fr]">
        <Card className="flex flex-col items-center gap-3">
          <TraceQR code={batch.publicCode} />
          <p className="text-center text-[12.5px] text-muted">
            Quét để mở hộ chiếu lô. QR không bảo chứng an toàn thực phẩm.
          </p>
        </Card>

        <div className="space-y-4">
          <div>
            <h1 className="font-display text-[26px] font-semibold text-text md:text-[30px]">
              {product?.name ?? 'Sản phẩm'}
            </h1>
            <p className="mt-1 flex items-center gap-1 text-[14px] text-muted">
              <MapPin size={14} aria-hidden /> {farm?.name} · {farm?.address}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Fact icon={<ScanLine size={14} aria-hidden />} label="Mã lô" value={batch.publicCode} />
            <Fact icon={<Calendar size={14} aria-hidden />} label="Ngày thu hoạch" value={date(batch.harvestDate)} />
            <Fact label="Khối lượng lô" value={`${batch.quantityKg} kg`} />
            <Fact label="Giống" value="Chưa ghi nhận" />
          </div>

          <Notice tone="info">
            <strong>Mức xác minh nguồn:</strong> {sourceStatusLabel[batch.sourceStatus]}. Đây là thông tin do nhà sản xuất
            cung cấp và hiển thị công khai tối thiểu; không chứa dữ liệu cá nhân.
          </Notice>
        </div>
      </div>

      {/* Provenance vs document validity — tách riêng */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <p className="text-[14px] font-semibold text-text">Trạng thái nguồn dữ liệu</p>
          <p className="mt-1 text-[13.5px] text-muted">{sourceStatusLabel[batch.sourceStatus]}</p>
        </Card>
        <Card>
          <p className="text-[14px] font-semibold text-text">Hiệu lực chứng nhận (tách riêng)</p>
          <div className="mt-2 space-y-2">
            {certs.length === 0 ? (
              <p className="text-[13.5px] text-muted">Chưa có chứng nhận được đối chiếu.</p>
            ) : (
              certs.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-2">
                  <span className="text-[13.5px] text-text">{c.type}</span>
                  <Badge tone={certTone[c.verificationStatus] as never} icon={<BadgeCheck size={12} aria-hidden />}>
                    {certLabel[c.verificationStatus]}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Diary timeline */}
      <Card>
        <h2 className="mb-4 text-[17px] font-bold text-text">Nhật ký mùa vụ</h2>
        <Timeline
          items={batch.diary.map((d) => ({
            title: d.note,
            meta: `${date(d.at)} · ${d.actor}${d.evidence ? ` · ${d.evidence}` : ''}`,
            tone: d.phase === 'thu_hoach' ? 'accent' : 'default',
          }))}
        />
      </Card>

      <div className="flex flex-wrap gap-2">
        {product && (
          <Link to={`/products/${product.id}`}>
            <Button variant="secondary">Xem sản phẩm</Button>
          </Link>
        )}
        <Link to="/">
          <Button variant="ghost">Về chợ</Button>
        </Link>
      </div>
    </div>
  )
}

function Fact({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2">
      <p className="flex items-center gap-1 text-[12px] text-muted">
        {icon} {label}
      </p>
      <p className="tnum text-[14.5px] font-semibold text-text">{value}</p>
    </div>
  )
}
