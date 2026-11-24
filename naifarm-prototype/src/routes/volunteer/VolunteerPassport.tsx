import { Award, BadgeCheck, Clock, ShieldCheck } from 'lucide-react'
import { useDemo } from '../../lib/demo-store'
import { useData } from '../../lib/data'
import { Badge, Card, DemoTag, Notice, SectionHeader } from '../../components/ui'
import { TraceQR } from '../../components/domain/TraceQR'

export function VolunteerPassport() {
  const { farmById, missions } = useData()
  const { logs, submissions, missions: liveMissions } = useDemo()
  const approvedMin = logs.filter((l) => l.volunteerId === 'u-minh-anh').reduce((s, l) => s + l.approvedMinutes, 0)
  const pendingSubs = submissions.filter((s) => s.reviewStatus === 'pending')
  const doneMissions = liveMissions.filter((m) => m.assigneeId === 'u-minh-anh' && m.status === 'Recorded')

  const skills = ['Truyền thông số', 'Thương mại điện tử', 'Nhập liệu & nhật ký', 'Giao tiếp cộng đồng']

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center gap-2">
        <DemoTag />
      </div>

      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-[24px] font-semibold text-text">Hồ sơ năng lực</h1>
          <p className="mt-1 text-[14px] text-muted">Nguyễn Minh Anh · Tình nguyện viên (minh họa)</p>
        </div>
        <Badge tone="success" icon={<BadgeCheck size={13} aria-hidden />}>
          Nội bộ (không phải chứng chỉ nhà nước)
        </Badge>
      </div>

      {/* Hours: approved vs pending */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="space-y-1">
          <span className="flex items-center gap-1 text-[13px] text-muted">
            <Clock size={14} aria-hidden /> Giờ đã duyệt
          </span>
          <p className="tnum text-[30px] font-bold text-success">{Math.round(approvedMin / 60)}h</p>
          <p className="text-[12.5px] text-muted">{approvedMin} phút · đã qua hai lớp xác nhận</p>
        </Card>
        <Card className="space-y-1">
          <span className="flex items-center gap-1 text-[13px] text-muted">
            <Clock size={14} aria-hidden /> Giờ chờ duyệt
          </span>
          <p className="tnum text-[30px] font-bold text-warning">{pendingSubs.length * 2.5}h</p>
          <p className="text-[12.5px] text-muted">Chưa được cộng cho đến khi duyệt</p>
        </Card>
      </div>

      <Notice tone="info">
        Giờ đã duyệt và giờ chờ duyệt được tách riêng. Đây là <strong>ghi nhận nội bộ</strong> có mã xác minh, không thay
        thế chứng nhận của cơ quan có thẩm quyền.
      </Notice>

      {/* Pass card */}
      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <TraceQR code="NF-DEMO-2026-001" size={132} />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-primary" aria-hidden />
            <p className="text-[16px] font-bold text-text">Youth Impact Pass (mẫu demo)</p>
          </div>
          <p className="text-[13.5px] text-muted">Mã: <span className="tnum font-semibold text-text">NF-DEMO-2026-001</span></p>
          <p className="text-[13.5px] text-muted">Đơn vị ghi nhận: NaiFarm (minh họa)</p>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((s) => (
              <Badge key={s} tone="neutral">
                {s}
              </Badge>
            ))}
          </div>
        </div>
      </Card>

      <section>
        <SectionHeader as="h2" title="Nhiệm vụ đã hoàn thành" />
        <div className="space-y-2">
          {doneMissions.length === 0 ? (
            <Card className="text-[14px] text-muted">
              Chưa có nhiệm vụ nào được ghi nhận. Hoàn thành nhiệm vụ với minh chứng và xác nhận để tích lũy.
            </Card>
          ) : (
            doneMissions.map((m) => {
              const farm = farmById(m.farmId)
              return (
                <Card key={m.id} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[14.5px] font-semibold text-text">{m.title}</p>
                    <p className="text-[13px] text-muted">Người thụ hưởng: {farm?.name}</p>
                  </div>
                  <Badge tone="success">Đã ghi giờ</Badge>
                </Card>
              )
            })
          )}
        </div>
      </section>

      <Card className="flex items-start gap-3 bg-surface-soft">
        <ShieldCheck size={18} className="mt-0.5 text-leaf" aria-hidden />
        <p className="text-[13.5px] text-muted">
          Không hiển thị số điện thoại, địa chỉ hay định danh cá nhân trên trang QR công khai. Bạn kiểm soát dữ liệu được
          công khai khi nhận ghi nhận.
        </p>
      </Card>
      <span className="sr-only">{missions.length}</span>
    </div>
  )
}
