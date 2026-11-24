import { useState } from 'react'
import { AlertTriangle, BadgeCheck, FileText, ShieldAlert } from 'lucide-react'
import { useData } from '../../lib/data'
import { certLabel, certTone } from '../../lib/labels'
import { Badge, Button, Card, DemoTag, Field, Notice, SectionHeader, Textarea } from '../../components/ui'
import { dateTime } from '../../lib/format'

export function CertReview() {
  const { certificates, farmById } = useData()
  const cert = certificates.find((c) => c.verificationStatus === 'self_declared')!
  const [status, setStatus] = useState(cert.verificationStatus)
  const [note, setNote] = useState('')
  const [decision, setDecision] = useState<null | 'document_matched' | 'needs_info'>(null)
  const farm = farmById(cert.farmId)

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center gap-2">
        <DemoTag />
        <span className="text-[13px] text-muted">Đối chiếu hồ sơ & chứng nhận (chỉ trong phạm vi địa bàn)</span>
      </div>

      <Card className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-[18px] font-bold text-text">{farm?.name}</h1>
            <p className="text-[13.5px] text-muted">{cert.type}</p>
          </div>
          <Badge tone={certTone[status] as never} icon={<BadgeCheck size={13} aria-hidden />}>
            {certLabel[status]}
          </Badge>
        </div>

        <div className="grid gap-3 sm:grid-cols-[200px_1fr]">
          <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-border bg-background text-center text-[12.5px] text-muted">
            <div>
              <FileText className="mx-auto mb-1" size={22} aria-hidden />
              Ảnh chứng từ (demo)
            </div>
          </div>
          <div className="space-y-2 text-[13.5px]">
            <Row label="Đơn vị ghi nhận" value={cert.issuer} />
            <Row label="Loại" value={cert.type} />
            <Row label="Hiệu lực" value={cert.validity ?? 'Chưa ghi nhận'} />
            <Row label="Người đối chiếu" value={cert.reviewedBy ? 'Thu Hà' : '—'} />
            <Row label="Thời điểm" value={cert.reviewedAt ? dateTime(cert.reviewedAt) : '—'} />
          </div>
        </div>
      </Card>

      <Notice tone="warning">
        <span className="flex items-center gap-1">
          <ShieldAlert size={15} aria-hidden /> Bạn chỉ được chuyển sang <strong>“Đã đối chiếu tài liệu”</strong>.
        </span>
        <p className="mt-1">
          Không được đặt <strong>“Đã xác nhận nguồn”</strong> — việc này thuộc cơ quan/tổ chức có thẩm quyền. Kiểm tra
          tài liệu khớp tên chủ thể, phạm vi sản phẩm và còn hiệu lực.
        </p>
      </Notice>

      <Card className="space-y-4">
        <SectionHeader as="h2" title="Quyết định đối chiếu" subtitle="Kèm lý do, lưu vào lịch sử kiểm tra" />
        <div className="flex flex-wrap gap-2">
          <Button
            variant={decision === 'document_matched' ? 'primary' : 'secondary'}
            onClick={() => setDecision('document_matched')}
          >
            <BadgeCheck size={16} aria-hidden /> Đã đối chiếu tài liệu
          </Button>
          <Button
            variant={decision === 'needs_info' ? 'danger' : 'secondary'}
            onClick={() => setDecision('needs_info')}
          >
            <AlertTriangle size={16} aria-hidden /> Yêu cầu bổ sung
          </Button>
        </div>

        <Field
          label="Lý do / ghi chú (bắt buộc)"
          htmlFor="note"
          hint="Ví dụ: ảnh mờ, sai tên chủ thể, hết hạn…"
        >
          <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nhập lý do…" />
        </Field>

        <div className="flex justify-end">
          <Button
            disabled={!decision || note.trim().length < 3}
            onClick={() => {
              if (decision === 'document_matched') setStatus('document_matched')
              else setStatus('self_declared')
            }}
          >
            Lưu quyết định
          </Button>
        </div>
        {status === 'document_matched' && (
          <Notice tone="success">
            Đã ghi nhận “Đã đối chiếu tài liệu” (demo). Nhãn “chưa xác nhận từ đơn vị cấp” vẫn hiển thị công khai.
          </Notice>
        )}
      </Card>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-1 last:border-0">
      <span className="text-muted">{label}</span>
      <span className="font-semibold text-text">{value}</span>
    </div>
  )
}
