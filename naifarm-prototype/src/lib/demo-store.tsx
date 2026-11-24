import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  orders as seedOrders,
  missions as seedMissions,
  missionSubmissions as seedSubs,
  volunteerLogs as seedLogs,
  profiles,
  type Order,
  type OrderStatus,
  type Mission,
  type MissionSubmission,
  type VolunteerLog,
} from './seed'

export type WorkspaceKey = 'W01' | 'W02' | 'W03' | 'W04' | 'W06'

export interface CartLine {
  productId: string
  qtyKg: number
}

export interface Toast {
  id: number
  message: string
  tone: 'success' | 'info' | 'warning' | 'danger'
}

interface DemoState {
  workspace: WorkspaceKey
  currentUserId: string
  cart: CartLine[]
  orders: Order[]
  missions: Mission[]
  submissions: MissionSubmission[]
  logs: VolunteerLog[]
  toasts: Toast[]
  setWorkspace: (w: WorkspaceKey) => void
  addToCart: (productId: string, qtyKg: number) => void
  updateCartQty: (productId: string, qtyKg: number) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  createOrder: (opts: { fulfillment: 'delivery' | 'pickup'; shippingFee: number }) => Order
  setOrderStatus: (orderId: string, status: OrderStatus, note: string) => void
  acceptMission: (missionId: string) => void
  submitMission: (missionId: string, opts: { note: string; hours: number }) => void
  beneficiaryConfirm: (submissionId: string) => void
  reviewHours: (submissionId: string, decision: 'approved' | 'revision', note: string) => void
  pushToast: (message: string, tone?: Toast['tone']) => void
  dismissToast: (id: number) => void
}

const Ctx = createContext<DemoState | null>(null)

const defaultUserForWorkspace: Record<WorkspaceKey, string> = {
  W01: 'u-ngoc-linh',
  W02: 'u-ba-tu',
  W03: 'u-minh-anh',
  W04: 'u-thu-ha',
  W06: 'u-admin',
}

let toastSeq = 1
let orderSeq = 10

export function DemoProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspaceState] = useState<WorkspaceKey>('W01')
  // Giỏ hàng khởi tạo sẵn 1 dòng (dữ liệu demo) để luồng mua hiển thị đầy đủ.
  const [cart, setCart] = useState<CartLine[]>([{ productId: 'P01', qtyKg: 2 }])
  const [orders, setOrders] = useState<Order[]>(seedOrders)
  const [missions, setMissions] = useState<Mission[]>(seedMissions)
  const [submissions, setSubmissions] = useState<MissionSubmission[]>(seedSubs)
  const [logs, setLogs] = useState<VolunteerLog[]>(seedLogs)
  const [toasts, setToasts] = useState<Toast[]>([])

  const currentUserId = defaultUserForWorkspace[workspace]

  const pushToast = useCallback((message: string, tone: Toast['tone'] = 'info') => {
    const id = toastSeq++
    setToasts((t) => [...t, { id, message, tone }])
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200)
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const setWorkspace = useCallback((w: WorkspaceKey) => setWorkspaceState(w), [])

  const addToCart = useCallback((productId: string, qtyKg: number) => {
    setCart((c) => {
      const found = c.find((l) => l.productId === productId)
      if (found) {
        return c.map((l) => (l.productId === productId ? { ...l, qtyKg: l.qtyKg + qtyKg } : l))
      }
      return [...c, { productId, qtyKg }]
    })
  }, [])

  const updateCartQty = useCallback((productId: string, qtyKg: number) => {
    setCart((c) => c.map((l) => (l.productId === productId ? { ...l, qtyKg } : l)))
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setCart((c) => c.filter((l) => l.productId !== productId))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const createOrder = useCallback<DemoState['createOrder']>(
    ({ fulfillment, shippingFee }) => {
      const farmId = 'farm-ba-tu-demo'
      const id = `o-${orderSeq}`
      const code = `NF-ORD-DEMO-${String(orderSeq).padStart(3, '0')}`
      orderSeq++
      const order: Order = {
        id,
        code,
        customerId: 'u-ngoc-linh',
        farmId,
        status: 'Pending',
        fulfillment,
        shippingFee,
        paymentStatus: 'COD',
        items: cart.map((l) => ({
          productId: l.productId,
          batchId: 'b-001',
          qtyKg: l.qtyKg,
          unitPrice: 35000,
        })),
        createdAt: new Date().toISOString(),
        history: [
          { at: new Date().toISOString(), status: 'Pending', note: 'Khách đặt hàng (demo).' },
        ],
      }
      setOrders((o) => [order, ...o])
      setCart([])
      return order
    },
    [cart],
  )

  const setOrderStatus = useCallback<DemoState['setOrderStatus']>((orderId, status, note) => {
    setOrders((o) =>
      o.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              status,
              history: [...ord.history, { at: new Date().toISOString(), status, note }],
            }
          : ord,
      ),
    )
  }, [])

  const acceptMission = useCallback<DemoState['acceptMission']>((missionId) => {
    setMissions((m) =>
      m.map((x) =>
        x.id === missionId ? { ...x, status: 'Assigned', assigneeId: 'u-minh-anh' } : x,
      ),
    )
  }, [])

  const submitMission = useCallback<DemoState['submitMission']>((missionId, opts) => {
    setMissions((m) => m.map((x) => (x.id === missionId ? { ...x, status: 'Submitted' } : x)))
    setSubmissions((s) => [
      ...s.filter((sub) => sub.missionId !== missionId),
      {
        id: `sub-${Date.now()}`,
        missionId,
        submitterId: 'u-minh-anh',
        version: 1,
        evidence: ['Ảnh sản phẩm (demo)', 'Liên kết bàn giao (demo)'],
        outputNote: opts.note,
        actualHours: opts.hours,
        beneficiaryStatus: 'pending',
        reviewStatus: 'pending',
      },
    ])
  }, [])

  const beneficiaryConfirm = useCallback<DemoState['beneficiaryConfirm']>((submissionId) => {
    setSubmissions((s) =>
      s.map((sub) =>
        sub.id === submissionId ? { ...sub, beneficiaryStatus: 'accepted' } : sub,
      ),
    )
    setMissions((m) => m.map((x) => (x.status === 'Submitted' ? { ...x, status: 'BeneficiaryAccepted' } : x)))
  }, [])

  const reviewHours = useCallback<DemoState['reviewHours']>((submissionId, decision, note) => {
    setSubmissions((s) =>
      s.map((sub) => (sub.id === submissionId ? { ...sub, reviewStatus: decision } : sub)),
    )
    const sub = seedSubs.find((x) => x.id === submissionId)
    if (decision === 'approved') {
      setMissions((m) =>
        m.map((x) => (x.status === 'BeneficiaryAccepted' ? { ...x, status: 'Recorded' } : x)),
      )
      setLogs((l) => [
        ...l,
        {
          id: `vl-${Date.now()}`,
          missionId: sub?.missionId ?? 'm-001',
          volunteerId: sub?.submitterId ?? 'u-minh-anh',
          submissionId,
          approvedMinutes: Math.round((sub?.actualHours ?? 2) * 60),
          reviewerId: 'u-thu-ha',
          beneficiaryConfirmationId: 'bc-demo',
          at: new Date().toISOString(),
          adjustmentOf: null,
        },
      ])
    } else {
      setMissions((m) => m.map((x) => (x.status === 'BeneficiaryAccepted' ? { ...x, status: 'Revision' } : x)))
    }
  }, [])

  const value = useMemo<DemoState>(
    () => ({
      workspace,
      currentUserId,
      cart,
      orders,
      missions,
      submissions,
      logs,
      toasts,
      setWorkspace,
      addToCart,
      updateCartQty,
      removeFromCart,
      clearCart,
      createOrder,
      setOrderStatus,
      acceptMission,
      submitMission,
      beneficiaryConfirm,
      reviewHours,
      pushToast,
      dismissToast,
    }),
    [
      workspace,
      currentUserId,
      cart,
      orders,
      missions,
      submissions,
      logs,
      toasts,
      setWorkspace,
      addToCart,
      updateCartQty,
      removeFromCart,
      clearCart,
      createOrder,
      setOrderStatus,
      acceptMission,
      submitMission,
      beneficiaryConfirm,
      reviewHours,
      pushToast,
      dismissToast,
    ],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useDemo(): DemoState {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useDemo must be used within DemoProvider')
  return ctx
}

export function currentProfileFor(workspace: WorkspaceKey) {
  return profiles.find((p) => p.workspace === workspace)
}
