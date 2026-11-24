import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import * as seed from './seed'
import { apiEnabled, apiGet } from './api'
import { useAuth } from './auth'

type Product = seed.Product
type Farm = seed.Farm
type Livestream = seed.Livestream
type Order = seed.Order
type OrderStatus = seed.OrderStatus
type Mission = seed.Mission
type MissionSubmission = seed.MissionSubmission
type Certificate = seed.Certificate
type Profile = seed.Profile
type AdminUnit = seed.AdminUnit
type Batch = seed.Batch
type Lesson = seed.Lesson
type SupportRequest = (typeof seed.supportRequests)[number]

export interface DataApi {
  /** Đang chạy bằng API thật hay bằng dữ liệu seed (offline). */
  apiMode: boolean
  isLoading: boolean
  isError: boolean
  products: Product[]
  farms: Farm[]
  livestreams: Livestream[]
  orders: Order[]
  missions: Mission[]
  certificates: Certificate[]
  supportRequests: SupportRequest[]
  submissions: MissionSubmission[]
  profiles: Profile[]
  units: AdminUnit[]
  batches: Batch[]
  lessons: Lesson[]
  productById: (id: string) => Product | undefined
  farmById: (id: string) => Farm | undefined
  productsByFarm: (farmId: string) => Product[]
  batchByCode: (code: string) => Batch | undefined
  orderById: (id: string) => Order | undefined
  ordersByFarm: (farmId: string) => Order[]
  orderTotal: (o: Order) => number
  missionById: (id: string) => Mission | undefined
  profileById: (id: string) => Profile | undefined
  unitName: (code: string | null) => string
}

const DataContext = createContext<DataApi | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const { session, profile } = useAuth()
  const role = profile?.role
  const authed = Boolean(session?.access_token)

  const home = useQuery({
    queryKey: ['home'],
    enabled: apiEnabled,
    queryFn: () => apiGet<{ products: Product[]; farms: Farm[]; upcomingLives: Livestream[] }>('/v1/market/home'),
  })
  const batchesQ = useQuery({
    queryKey: ['batches'],
    enabled: apiEnabled,
    queryFn: () => apiGet<{ batches: Batch[] }>('/v1/batches'),
  })
  const certsQ = useQuery({
    queryKey: ['certificates'],
    enabled: apiEnabled,
    queryFn: () => apiGet<{ certificates: Certificate[] }>('/v1/certificates'),
  })
  const unitsQ = useQuery({
    queryKey: ['units'],
    enabled: apiEnabled,
    queryFn: () => apiGet<{ units: AdminUnit[] }>('/v1/units'),
  })
  const lessonsQ = useQuery({
    queryKey: ['lessons'],
    enabled: apiEnabled,
    queryFn: () => apiGet<{ lessons: Lesson[] }>('/v1/lessons'),
  })
  const livesQ = useQuery({
    queryKey: ['livestreams'],
    enabled: apiEnabled,
    queryFn: () => apiGet<{ livestreams: Livestream[] }>('/v1/livestreams'),
  })

  // Dữ liệu theo vai trò
  const ordersQ = useQuery({
    queryKey: ['orders', session?.access_token],
    enabled: apiEnabled && authed && role === 'customer',
    queryFn: () => apiGet<{ orders: Order[] }>('/v1/orders'),
  })
  const farmerQ = useQuery({
    queryKey: ['farmer-dashboard', session?.access_token],
    enabled: apiEnabled && authed && role === 'farm_owner',
    queryFn: () => apiGet<{ products: Product[]; missions: Mission[] }>('/v1/farmer/dashboard'),
  })
  const farmerOrdersQ = useQuery({
    queryKey: ['farmer-orders', session?.access_token],
    enabled: apiEnabled && authed && role === 'farm_owner',
    queryFn: () => apiGet<{ orders: Order[] }>('/v1/farmer/orders'),
  })
  const supportQ = useQuery({
    queryKey: ['farmer-support', session?.access_token],
    enabled: apiEnabled && authed && role === 'farm_owner',
    queryFn: () => apiGet<{ supportRequests: SupportRequest[] }>('/v1/farmer/support-requests'),
  })
  const volMissionsQ = useQuery({
    queryKey: ['volunteer-missions', session?.access_token],
    enabled: apiEnabled && authed && role === 'volunteer',
    queryFn: () => apiGet<{ missions: Mission[] }>('/v1/volunteer/missions'),
  })
  const volLivesQ = useQuery({
    queryKey: ['volunteer-livestreams', session?.access_token],
    enabled: apiEnabled && authed && role === 'volunteer',
    queryFn: () => apiGet<{ mine: Livestream[]; all: Livestream[] }>('/v1/volunteer/livestreams'),
  })
  const coordVerQ = useQuery({
    queryKey: ['coord-verifications', session?.access_token],
    enabled: apiEnabled && authed && role === 'local_coordinator',
    queryFn: () => apiGet<{ certificates: Certificate[] }>('/v1/coordinator/verifications'),
  })
  const coordMisQ = useQuery({
    queryKey: ['coord-submissions', session?.access_token],
    enabled: apiEnabled && authed && role === 'local_coordinator',
    queryFn: () => apiGet<{ submissions: (MissionSubmission & { mission: Mission | null })[] }>('/v1/coordinator/missions'),
  })
  const adminOrgQ = useQuery({
    queryKey: ['admin-orgs', session?.access_token],
    enabled: apiEnabled && authed && role === 'platform_admin',
    queryFn: () => apiGet<{ profiles: Profile[]; farms: Farm[] }>('/v1/admin/organizations'),
  })

  const value = useMemo<DataApi>(() => {
    const pickArr = <T,>(api: T[] | undefined, fallback: T[]): T[] =>
      apiEnabled ? (api ?? []) : fallback

    const products = pickArr(home.data?.products, seed.products)
    const farms = pickArr(home.data?.farms, seed.farms)
    const publicLives = pickArr(livesQ.data?.livestreams, seed.livestreams)
    const livestreams = apiEnabled && volLivesQ.data?.all?.length ? volLivesQ.data.all : publicLives
    const batches = pickArr(batchesQ.data?.batches, seed.batches)
    const certificates = pickArr(
      coordVerQ.data?.certificates?.length ? coordVerQ.data.certificates : certsQ.data?.certificates,
      seed.certificates,
    )
    const orders = pickArr(ordersQ.data?.orders ?? farmerOrdersQ.data?.orders, seed.orders)
    const missions = pickArr(volMissionsQ.data?.missions ?? farmerQ.data?.missions, seed.missions)
    const supportRequests = pickArr(supportQ.data?.supportRequests, seed.supportRequests)
    const submissions = pickArr(
      coordMisQ.data?.submissions as MissionSubmission[] | undefined,
      seed.missionSubmissions,
    )
    const profiles = apiEnabled && adminOrgQ.data?.profiles?.length ? adminOrgQ.data.profiles : seed.profiles
    const units = apiEnabled && unitsQ.data?.units?.length ? unitsQ.data.units : seed.adminUnits
    const lessons = pickArr(lessonsQ.data?.lessons, seed.lessons)

    const productById = (id: string) => products.find((p) => p.id === id)
    const farmById = (id: string) => farms.find((f) => f.id === id)
    const productsByFarm = (farmId: string) => products.filter((p) => p.farmId === farmId)
    const batchByCode = (code: string) => batches.find((b) => b.publicCode === code)
    const orderById = (id: string) => orders.find((o) => o.id === id)
    const ordersByFarm = (farmId: string) => orders.filter((o) => o.farmId === farmId)
    const missionById = (id: string) => missions.find((m) => m.id === id)
    const profileById = (id: string) => profiles.find((p) => p.id === id)
    const unitName = (code: string | null) =>
      units.find((u) => u.code === code)?.name ?? 'Chưa gán địa bàn'

    const loading =
      apiEnabled &&
      (home.isLoading || batchesQ.isLoading || certsQ.isLoading || unitsQ.isLoading || lessonsQ.isLoading)
    const isError = apiEnabled && (home.isError || batchesQ.isError)

    return {
      apiMode: apiEnabled,
      isLoading: loading,
      isError,
      products,
      farms,
      livestreams,
      orders,
      missions,
      certificates,
      supportRequests,
      submissions,
      profiles,
      units,
      batches,
      lessons,
      productById,
      farmById,
      productsByFarm,
      batchByCode,
      orderById,
      ordersByFarm,
      orderTotal: seed.orderTotal,
      missionById,
      profileById,
      unitName,
    }
  }, [
    home.data, home.isLoading, home.isError,
    batchesQ.data, batchesQ.isLoading, batchesQ.isError,
    certsQ.data, certsQ.isLoading,
    unitsQ.data, unitsQ.isLoading,
    lessonsQ.data, lessonsQ.isLoading,
    livesQ.data,
    ordersQ.data, farmerQ.data, farmerOrdersQ.data, supportQ.data,
    volMissionsQ.data, volLivesQ.data, coordVerQ.data, coordMisQ.data, adminOrgQ.data,
  ])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData(): DataApi {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData phải dùng trong DataProvider')
  return ctx
}

export type { Order, OrderStatus, Product, Farm, Mission, Livestream, Certificate, Batch, Profile }
