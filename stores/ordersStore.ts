// stores/ordersStore.ts
import { makeAutoObservable, runInAction } from "mobx"

type DeliveryType = "1H" | "5H" | "24H"
type OrderStatus = "pending" | "processing" | "completed"

export interface Order {
  id: number
  email: string | null
  whatsapp?: string
  name?: string
  paymentMethod?: string
  totalAmount?: string
  status: OrderStatus
  created_at: string
  updated_at: string
  web_user_id: string | null

  // Fields from OrderFromAPI
  presenting: string
  event_title: string
  event_date: string
  flyer_info: string
  address_phone: string
  venue_logo: string | null
  djs: (string | { name: string | { name: string }; image?: string | null })[]
  host: Record<string, any> | { name: string | { name: string }; image?: string | null }
  sponsors: (string | { name: string | { name: string }; image?: string | null })[]
  custom_notes: string
  flyer_is: number
  delivery_time?: string
  total_price?: string
  adminNotes?: string

  // For backward compatibility
  flyers?: Array<{
    id: string
    name?: string
    fileName?: string
    delivery: DeliveryType
  }>

  // Alias for created_at to maintain backward compatibility
  createdAt?: string
}

const DELIVERY_PRIORITY_MAP: Record<DeliveryType, number> = {
  "1H": 1,
  "5H": 2,
  "24H": 3,
}

class OrdersStore {
  orders: Order[] = []
  loading = true
  error: string | null = null
  searchTerm = ""
  statusFilter: "All" | "1H" | "5H" | "24H" | "Completed" = "All"
  selectedOrder: Order | null = null
  now = Date.now()

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })

    // Real-time clock
    setInterval(() => {
      this.now = Date.now()
    }, 1000)
  }

  setSearchTerm(term: string) {
    this.searchTerm = term
  }

  setStatusFilter(filter: "All" | "1H" | "5H" | "24H" | "Completed") {
    this.statusFilter = filter
  }

  setSelectedOrder(order: Order | null) {
    this.selectedOrder = order
  }

  async fetchOrders() {
    try {
      this.loading = true
      this.error = null

      const response = await fetch('http://193.203.161.174:3007/api/orders')
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data = await response.json()
      const apiOrders = data.orders || []

      const transformed = apiOrders.map(transformApiOrder)

      runInAction(() => {
        this.orders = transformed
        this.loading = false
        console.log("Fetched and transformed orders:", transformed);
      })
    } catch (err: any) {
      runInAction(() => {
        this.error = err.message || "Failed to fetch orders"
        this.loading = false
      })
    }
  }

  async updateOrderStatus(orderId: number, newStatus: OrderStatus) {
    const order = this.orders.find(o => o.id === orderId)
    if (!order) return

    // Store old status for rollback
    const oldStatus = order.status

    // Optimistic update
    order.status = newStatus

    try {
      const response = await fetch(`http://193.203.161.174:3007/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus.toLowerCase() })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log('Status updated successfully:', data)
    } catch (err) {
      console.error("Failed to update status", err)
      // Rollback on failure
      order.status = oldStatus
      alert('Failed to update order status. Please try again.')
    }
  }

  get visibleOrders() {
    const filtered = this.orders.filter(order => {
      // Filter by delivery time or status
      if (this.statusFilter !== "All") {
        if (this.statusFilter === "Completed") {
          if (order.status !== "completed") return false
        } else if (this.statusFilter === "1H" || this.statusFilter === "5H" || this.statusFilter === "24H") {
          // Filter by delivery time
          const orderDeliveryTime = this.parseDeliveryTime(order.delivery_time)
          if (orderDeliveryTime !== this.statusFilter) return false
        }
      }

      const q = this.searchTerm.trim().toLowerCase()
      if (!q) return true

      const matchesOrder =
        String(order.id).toLowerCase().includes(q) ||
        (order.email || '').toLowerCase().includes(q) ||
        (order.whatsapp || "").toLowerCase().includes(q)

      const matchesFlyer = order.flyers?.some(f =>
        (f.name || "").toLowerCase().includes(q) ||
        (f.fileName || "").toLowerCase().includes(q)
      ) || false

      return matchesOrder || matchesFlyer
    })

    const active: Order[] = []
    const completed: Order[] = []

    filtered.forEach(order => {
      if (order.status === "completed") completed.push(order)
      else active.push(order)
    })

    active.sort((a, b) => {
      const aInfo = this.getOrderPriority(a)
      const bInfo = this.getOrderPriority(b)

      if (aInfo.remainingMs <= 0 && bInfo.remainingMs > 0) return -1
      if (aInfo.remainingMs > 0 && bInfo.remainingMs <= 0) return 1

      const priDiff = DELIVERY_PRIORITY_MAP[aInfo.fastest as DeliveryType] - DELIVERY_PRIORITY_MAP[bInfo.fastest as DeliveryType]
      if (priDiff !== 0) return priDiff

      return new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime()
    })

    completed.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())

    return { active, completed }
  }

  getOrderPriority(order: Order) {
    if (order.status === "completed") return { fastest: "Completed" as const, remainingMs: 0 }

    const fastest = (order.flyers ?? []).reduce((acc, f) =>
      DELIVERY_PRIORITY_MAP[f.delivery] < DELIVERY_PRIORITY_MAP[acc] ? f.delivery : acc
      , order.flyers?.[0]?.delivery || "24H")

    const hours = fastest === "1H" ? 1 : fastest === "5H" ? 5 : 24
    const deadline = new Date(order.createdAt ?? 0).getTime() + hours * 3600000
    const remainingMs = deadline - this.now

    return { fastest, remainingMs }
  }

  parseDeliveryTime(deliveryStr?: string | null): DeliveryType {
    if (!deliveryStr) return "24H"
    if (deliveryStr.includes("1 Hour") || deliveryStr.includes("1H")) return "1H"
    if (deliveryStr.includes("5 Hours") || deliveryStr.includes("5H")) return "5H"
    return "24H"
  }
}

// Transform function to convert API response to Order type
function transformApiOrder(apiOrder: any): Order {
  const delivery = parseDeliveryTime(apiOrder.delivery_time)

  const flyers = [
    {
      id: `F-${apiOrder.id}`,
      name: apiOrder.event_title || "Event Flyer",
      fileName: apiOrder.flyer_info ? `${apiOrder.flyer_info}.jpg` : "default_flyer.jpg",
      delivery,
    },
    ...(apiOrder.story_size_version === 1 ? [{
      id: `F-S-${apiOrder.id}`,
      name: "Story Size",
      fileName: "story_version.jpg",
      delivery,
    }] : []),
  ]

  return {
    id: Number(apiOrder.id), // Ensure id is a number
    email: apiOrder.email || null,
    whatsapp: apiOrder.whatsapp || undefined,
    name: apiOrder.name || undefined,
    paymentMethod: apiOrder.payment_method || undefined,
    totalAmount: apiOrder.total_amount ? String(apiOrder.total_amount) : undefined,
    status: capitalizeStatus(apiOrder.status),
    created_at: apiOrder.created_at || new Date().toISOString(),
    updated_at: apiOrder.updated_at || new Date().toISOString(),
    web_user_id: apiOrder.web_user_id || null,
    presenting: apiOrder.presenting || '',
    event_title: apiOrder.event_title || '',
    event_date: apiOrder.event_date || '',
    flyer_info: apiOrder.flyer_info || '',
    address_phone: apiOrder.address_phone || '',
    venue_logo: normalizeImageUrl(apiOrder.venue_logo),
    djs: Array.isArray(apiOrder.djs) ? apiOrder.djs.map(fixEntityImage) : [],
    host: fixEntityImage(apiOrder.host) || {},
    sponsors: Array.isArray(apiOrder.sponsors) ? apiOrder.sponsors.map(fixEntityImage) : [],
    custom_notes: apiOrder.custom_notes || '',
    flyer_is: typeof apiOrder.flyer_is === 'number' ? apiOrder.flyer_is : 0,
    delivery_time: apiOrder.delivery_time || undefined,
    total_price: apiOrder.total_price ? String(apiOrder.total_price) : undefined,
    adminNotes: apiOrder.admin_notes || undefined,
    flyers,
    createdAt: apiOrder.created_at || new Date().toISOString(),
  }
}

function parseDeliveryTime(deliveryStr: string | null): DeliveryType {
  if (!deliveryStr) return "24H"
  if (deliveryStr.includes("1 Hour") || deliveryStr.includes("1H")) return "1H"
  if (deliveryStr.includes("5 Hours") || deliveryStr.includes("5H")) return "5H"
  return "24H"
}

function capitalizeStatus(status: string): OrderStatus {
  return status.toLowerCase() as OrderStatus
}

export const ordersStore = new OrdersStore()

// Auto-fetch on start
ordersStore.fetchOrders()
setInterval(() => ordersStore.fetchOrders(), 30000)

// Helper functions for image URL normalization
const BASE_IMG_URL = "http://193.203.161.174:3007";

function normalizeImageUrl(url: any): string | null {
  if (!url || typeof url !== 'string') return null;
  
  let newUrl = url;
  // Fix port 3006 -> 3007
  if (newUrl.includes(":3006")) {
    newUrl = newUrl.replace(":3006", ":3007");
  }
  // Handle relative paths
  if (newUrl.startsWith("/")) {
    newUrl = `${BASE_IMG_URL}${newUrl}`;
  }
  return newUrl;
}

function fixEntityImage(entity: any): any {
  if (!entity) return entity;
  if (typeof entity === 'string') return entity;
  
  if (typeof entity === 'object') {
    // If it has an image property, normalize it
    if ('image' in entity && entity.image) {
      return {
        ...entity,
        image: normalizeImageUrl(entity.image)
      };
    }
  }
  return entity;
}