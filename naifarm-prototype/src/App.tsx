import { Navigate, Route, Routes } from 'react-router-dom'
import {
  BadgeCheck,
  Boxes,
  ClipboardList,
  HandHeart,
  LayoutDashboard,
  ListChecks,
  Radio,
  Receipt,
  ShieldCheck,
  Store,
  Users,
} from 'lucide-react'
import { PublicLayout } from './components/layout/PublicLayout'
import { WorkspaceLayout, type MenuItem } from './components/layout/WorkspaceLayout'
import { Toasts } from './components/layout/Toasts'
import { NaiAI } from './components/layout/NaiAI'

import { MarketHome } from './routes/public/MarketHome'
import { FarmProfile } from './routes/public/FarmProfile'
import { ProductDetail } from './routes/public/ProductDetail'
import { TracePassport } from './routes/public/TracePassport'
import { Cart } from './routes/public/Cart'
import { Checkout } from './routes/public/Checkout'
import { OrderTracking } from './routes/public/OrderTracking'
import { Account } from './routes/public/Account'
import { PublicLive } from './routes/public/PublicLive'
import { MapExplore } from './routes/public/MapExplore'
import { LoginPage } from './routes/public/LoginPage'

import { FarmerHome } from './routes/farmer/FarmerHome'
import { PublishWizard } from './routes/farmer/PublishWizard'
import { FarmerOrders } from './routes/farmer/FarmerOrders'
import { FarmerSupport } from './routes/farmer/FarmerSupport'

import { VolunteerHome } from './routes/volunteer/VolunteerHome'
import { MissionDetail } from './routes/volunteer/MissionDetail'
import { VolunteerLive } from './routes/volunteer/VolunteerLive'
import { VolunteerPassport } from './routes/volunteer/VolunteerPassport'

import { CoordinatorHome } from './routes/coordinator/CoordinatorHome'
import { CertReview } from './routes/coordinator/CertReview'
import { HoursApproval } from './routes/coordinator/HoursApproval'

import { AdminHome } from './routes/admin/AdminHome'

const farmerMenu: MenuItem[] = [
  { to: '/farmer', label: 'Tổng quan', icon: LayoutDashboard },
  { to: '/farmer/products/new', label: 'Đăng sản phẩm', icon: Store },
  { to: '/farmer/orders', label: 'Đơn hàng', icon: Receipt },
  { to: '/farmer/support', label: 'Hỗ trợ', icon: HandHeart },
]

const volunteerMenu: MenuItem[] = [
  { to: '/volunteer', label: 'Tổng quan', icon: LayoutDashboard },
  { to: '/volunteer/live', label: 'Lịch live', icon: Radio },
  { to: '/volunteer/passport', label: 'Hồ sơ năng lực', icon: BadgeCheck },
]

const coordinatorMenu: MenuItem[] = [
  { to: '/coordinator', label: 'Tổng quan', icon: LayoutDashboard },
  { to: '/coordinator/verifications', label: 'Xác minh', icon: ShieldCheck },
  { to: '/coordinator/missions', label: 'Duyệt giờ', icon: ListChecks },
]

const adminMenu: MenuItem[] = [
  { to: '/admin', label: 'Tổng quan', icon: LayoutDashboard },
  { to: '/admin/organizations', label: 'Tài khoản & tổ chức', icon: Users },
  { to: '/admin/data', label: 'Dữ liệu & cấu hình', icon: Boxes },
  { to: '/admin/audit', label: 'Kiểm toán', icon: ClipboardList },
]

export function App() {
  return (
    <>
      <Routes>
        {/* Public + W01 */}
        <Route path="/" element={<PublicLayout><MarketHome /></PublicLayout>} />
        <Route path="/farms/:id" element={<PublicLayout><FarmProfile /></PublicLayout>} />
        <Route path="/products/:id" element={<PublicLayout><ProductDetail /></PublicLayout>} />
        <Route path="/trace/:code" element={<PublicLayout><TracePassport /></PublicLayout>} />
        <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
        <Route path="/checkout" element={<PublicLayout><Checkout /></PublicLayout>} />
        <Route path="/orders/:id" element={<PublicLayout><OrderTracking /></PublicLayout>} />
        <Route path="/account" element={<PublicLayout><Account /></PublicLayout>} />
        <Route path="/account/orders" element={<PublicLayout><Account tab="orders" /></PublicLayout>} />
        <Route path="/explore/map" element={<PublicLayout><MapExplore /></PublicLayout>} />
        <Route path="/live" element={<PublicLayout><PublicLive /></PublicLayout>} />
        <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />

        {/* W02 Nhà nông */}
        <Route path="/farmer" element={<WorkspaceLayout title="Nhà nông" workspace="W02" menu={farmerMenu}><FarmerHome /></WorkspaceLayout>} />
        <Route path="/farmer/products/new" element={<WorkspaceLayout title="Đăng sản phẩm" workspace="W02" menu={farmerMenu}><PublishWizard /></WorkspaceLayout>} />
        <Route path="/farmer/orders" element={<WorkspaceLayout title="Đơn hàng" workspace="W02" menu={farmerMenu}><FarmerOrders /></WorkspaceLayout>} />
        <Route path="/farmer/support" element={<WorkspaceLayout title="Hỗ trợ" workspace="W02" menu={farmerMenu}><FarmerSupport /></WorkspaceLayout>} />

        {/* W03 Thanh niên */}
        <Route path="/volunteer" element={<WorkspaceLayout title="Thanh niên & người học" workspace="W03" menu={volunteerMenu}><VolunteerHome /></WorkspaceLayout>} />
        <Route path="/volunteer/missions/:id" element={<WorkspaceLayout title="Nhiệm vụ" workspace="W03" menu={volunteerMenu}><MissionDetail /></WorkspaceLayout>} />
        <Route path="/volunteer/live" element={<WorkspaceLayout title="Lịch livestream" workspace="W03" menu={volunteerMenu}><VolunteerLive /></WorkspaceLayout>} />
        <Route path="/volunteer/passport" element={<WorkspaceLayout title="Hồ sơ năng lực" workspace="W03" menu={volunteerMenu}><VolunteerPassport /></WorkspaceLayout>} />

        {/* W04 Điều phối */}
        <Route path="/coordinator" element={<WorkspaceLayout title="Điều phối" workspace="W04" menu={coordinatorMenu}><CoordinatorHome /></WorkspaceLayout>} />
        <Route path="/coordinator/verifications" element={<WorkspaceLayout title="Đối chiếu hồ sơ" workspace="W04" menu={coordinatorMenu}><CertReview /></WorkspaceLayout>} />
        <Route path="/coordinator/missions" element={<WorkspaceLayout title="Duyệt minh chứng & giờ" workspace="W04" menu={coordinatorMenu}><HoursApproval /></WorkspaceLayout>} />

        {/* W06 Admin */}
        <Route path="/admin" element={<WorkspaceLayout title="Quản trị nền tảng" workspace="W06" menu={adminMenu}><AdminHome /></WorkspaceLayout>} />
        <Route path="/admin/:section" element={<WorkspaceLayout title="Quản trị nền tảng" workspace="W06" menu={adminMenu}><AdminHome /></WorkspaceLayout>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <NaiAI />
      <Toasts />
    </>
  )
}
