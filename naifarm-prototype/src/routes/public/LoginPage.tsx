import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, ShieldAlert } from 'lucide-react'
import { Badge, Button, Card, DemoTag } from '../../components/ui'
import { DEMO_ACCOUNTS, DEMO_PASSWORD, useAuth } from '../../lib/auth'

export function LoginPage() {
  const { signIn, enabled, signOut, session, profile } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState<string>(DEMO_ACCOUNTS[0].email)
  const [password, setPassword] = useState<string>(DEMO_PASSWORD)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(nextEmail?: string) {
    setBusy(true)
    setError(null)
    try {
      await signIn(nextEmail ?? email, password)
      const account = DEMO_ACCOUNTS.find((a) => a.email === (nextEmail ?? email))
      navigate(account?.entry ?? '/', { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Đăng nhập thất bại')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-[560px] space-y-6 py-6">
      <div className="flex items-center gap-2">
        <h1 className="font-display text-[26px] font-semibold text-text">Đăng nhập demo</h1>
        <DemoTag />
      </div>

      {!enabled && (
        <Card className="flex items-start gap-3 border-warning/40 bg-warning-bg">
          <ShieldAlert size={20} className="mt-0.5 shrink-0 text-warning" aria-hidden />
          <div className="text-[14px] text-text">
            <p className="font-semibold">Chưa cấu hình Supabase</p>
            <p className="mt-1 text-muted">
              Đặt <code className="rounded bg-surface-soft px-1">VITE_SUPABASE_URL</code> và{' '}
              <code className="rounded bg-surface-soft px-1">VITE_SUPABASE_ANON_KEY</code> trong{' '}
              <code className="rounded bg-surface-soft px-1">.env</code> rồi khởi động lại. Prototype vẫn chạy ở
              chế độ dữ liệu seed khi chưa có API.
            </p>
          </div>
        </Card>
      )}

      {session && (
        <Card className="flex items-center justify-between gap-3">
          <div className="text-[14px]">
            <p className="font-semibold text-text">Đang đăng nhập: {profile?.displayName ?? session.user.email}</p>
            <p className="text-muted">{profile ? `Vai trò: ${profile.role}` : 'Chưa tải được hồ sơ'}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => void signOut()}>
            Đăng xuất
          </Button>
        </Card>
      )}

      <Card className="space-y-4">
        <div>
          <p className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-muted">Chọn nhanh tài khoản demo</p>
          <div className="flex flex-wrap gap-2">
            {DEMO_ACCOUNTS.map((a) => (
              <Button
                key={a.email}
                size="sm"
                variant="secondary"
                disabled={busy || !enabled}
                onClick={() => {
                  setEmail(a.email)
                  setPassword(DEMO_PASSWORD)
                  void submit(a.email)
                }}
              >
                {a.label}
              </Button>
            ))}
          </div>
        </div>

        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            void submit()
          }}
        >
          <label className="block text-[14px]">
            <span className="mb-1 block font-semibold text-text">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-[15px] outline-none focus:border-primary"
              autoComplete="username"
            />
          </label>
          <label className="block text-[14px]">
            <span className="mb-1 block font-semibold text-text">Mật khẩu</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-[15px] outline-none focus:border-primary"
              autoComplete="current-password"
            />
          </label>
          {error && <Badge tone="danger">{error}</Badge>}
          <Button type="submit" disabled={busy || !enabled} className="w-full">
            <LogIn size={18} aria-hidden /> {busy ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </Button>
        </form>

        <p className="text-[12.5px] text-muted">
          Mật khẩu chung cho tài khoản demo: <code className="rounded bg-surface-soft px-1">{DEMO_PASSWORD}</code>. Đây là
          tài khoản giả lập, không phải người dùng thật.
        </p>
      </Card>
    </div>
  )
}
