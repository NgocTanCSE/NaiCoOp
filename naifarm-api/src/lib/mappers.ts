/* eslint-disable @typescript-eslint/no-explicit-any */
// Chuyển bản ghi Postgres (snake_case) → kiểu miền của front-end (camelCase).
import type {
  AdminUnit,
  Batch,
  Certificate,
  DiaryEvent,
  Farm,
  Lesson,
  Livestream,
  Mission,
  MissionSubmission,
  Order,
  Profile,
  Product,
  SupportRequest,
  VolunteerLog,
} from '../types'

type Row = Record<string, any>

export const num = (v: unknown, fallback = 0): number =>
  typeof v === 'number' ? v : v == null ? fallback : Number(v)

export function mapProfile(r: Row): Profile {
  return {
    id: r.legacy_id ?? r.id,
    displayName: r.display_name,
    age: r.age ?? undefined,
    role: r.role,
    workspace: r.workspace,
    unitCode: r.unit_code ?? null,
    home: r.home ?? undefined,
  }
}

export function mapAdminUnit(r: Row): AdminUnit {
  return { code: r.code, name: r.name, type: r.type }
}

export function mapFarm(r: Row): Farm {
  return {
    id: r.id,
    ownerId: r.owner_id,
    name: r.name,
    owner: r.owner,
    story: r.story,
    unitCode: r.unit_code,
    address: r.address,
    areaHa: num(r.area_ha),
    crops: r.crops ?? [],
    isDemo: r.is_demo ?? true,
    location: { lat: num(r.lat), lng: num(r.lng) },
    certStatus: r.cert_status,
  }
}

export function mapProduct(r: Row): Product {
  return {
    id: r.id,
    farmId: r.farm_id,
    name: r.name,
    category: r.category,
    pricePerKg: num(r.price_per_kg),
    unit: r.unit,
    stockKg: num(r.stock_kg),
    season: r.season,
    description: r.description ?? '',
    batchCode: r.batch_code ?? undefined,
  }
}

export function mapDiaryEvent(r: Row): DiaryEvent {
  return {
    id: r.id,
    at: r.at,
    phase: r.phase,
    note: r.note,
    actor: r.actor,
    evidence: r.evidence ?? undefined,
  }
}

export function mapBatch(r: Row, diary: DiaryEvent[] = []): Batch {
  return {
    id: r.id,
    productId: r.product_id,
    farmId: r.farm_id,
    publicCode: r.public_code,
    harvestDate: r.harvest_date,
    quantityKg: num(r.quantity_kg),
    sourceStatus: r.source_status,
    diary,
  }
}

export function mapOrder(r: Row, items: Row[] = [], history: Row[] = []): Order {
  return {
    id: r.id,
    code: r.code,
    customerId: r.customer_id,
    farmId: r.farm_id,
    status: r.status,
    fulfillment: r.fulfillment,
    shippingFee: num(r.shipping_fee),
    paymentStatus: r.payment_status,
    items: items.map((it) => ({
      productId: it.product_id,
      batchId: it.batch_id,
      qtyKg: num(it.qty_kg),
      unitPrice: num(it.unit_price),
    })),
    createdAt: r.created_at,
    history: history
      .map((h) => ({ at: h.at, status: h.status, note: h.note }))
      .sort((a, b) => String(a.at).localeCompare(String(b.at))),
  }
}

export function mapMission(r: Row): Mission {
  return {
    id: r.id,
    requestId: r.request_id,
    farmId: r.farm_id,
    title: r.title,
    goal: r.goal,
    output: r.output,
    skill: r.skill,
    mode: r.mode,
    expectedHours: num(r.expected_hours),
    dueDate: r.due_date,
    assigneeId: r.assignee_id ?? null,
    slots: num(r.slots, 1),
    unitCode: r.unit_code,
    status: r.status,
  }
}

export function mapSubmission(r: Row, evidence: string[] = []): MissionSubmission {
  return {
    id: r.id,
    missionId: r.mission_id,
    submitterId: r.submitter_id,
    version: num(r.version, 1),
    evidence,
    outputNote: r.output_note ?? '',
    actualHours: num(r.actual_hours),
    beneficiaryStatus: r.beneficiary_status,
    reviewStatus: r.review_status,
  }
}

export function mapVolunteerLog(r: Row): VolunteerLog {
  return {
    id: r.id,
    missionId: r.mission_id,
    volunteerId: r.volunteer_id,
    submissionId: r.submission_id,
    approvedMinutes: num(r.approved_minutes),
    reviewerId: r.reviewer_id,
    beneficiaryConfirmationId: r.beneficiary_confirmation_id,
    at: r.at,
    adjustmentOf: r.adjustment_of ?? null,
  }
}

export function mapLivestream(r: Row, products: string[] = []): Livestream {
  return {
    id: r.id,
    farmId: r.farm_id,
    hostId: r.host_id,
    title: r.title,
    scheduledAt: r.scheduled_at,
    durationMin: num(r.duration_min),
    status: r.status,
    products,
  }
}

export function mapCertificate(r: Row): Certificate {
  return {
    id: r.id,
    farmId: r.farm_id,
    productId: r.product_id ?? null,
    issuer: r.issuer,
    type: r.type,
    validity: r.validity ?? null,
    verificationStatus: r.verification_status,
    reviewedBy: r.reviewed_by ?? null,
    reviewedAt: r.reviewed_at ?? null,
    reviewNote: r.review_note ?? null,
  }
}

export function mapLesson(r: Row): Lesson {
  return {
    id: r.id,
    title: r.title,
    audience: r.audience,
    subject: r.subject,
    minutes: num(r.minutes),
    objectives: r.objectives ?? [],
  }
}

export function mapSupportRequest(r: Row): SupportRequest {
  return {
    id: r.id,
    farmId: r.farm_id,
    title: r.title,
    need: r.need,
    desiredOutput: r.desired_output,
    status: r.status,
  }
}
