import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { startOfYear } from 'date-fns'

const generateId = () => crypto.randomUUID()

const initialEvents = [
  {
    id: 'evt-1',
    name: 'Tech Conference 2025',
    description: '<p>Join us for the biggest tech conference of the year featuring keynotes from industry leaders.</p>',
    logo: null,
    websiteUrl: 'https://techconf2025.com',
    address: {
      line1: '123 Business Avenue',
      line2: 'Suite 100',
      city: 'London',
      county: 'Greater London',
      postcode: 'SW1A 1AA',
    },
    startDate: '2025-06-15T09:00:00Z',
    endDate: '2025-06-17T17:00:00Z',
    salesOpenDate: '2025-01-01T00:00:00Z',
    salesCloseDate: '2025-06-14T23:59:59Z',
    status: 'live',
    createdAt: '2025-01-10T00:00:00Z',
    year: 2025,
  },
  {
    id: 'evt-2',
    name: 'Summer Music Festival 2024',
    description: '<p>The ultimate summer music experience with top artists performing live.</p>',
    logo: null,
    websiteUrl: 'https://summerfest2024.com',
    address: {
      line1: '456 Park Lane',
      line2: '',
      city: 'Manchester',
      county: 'Greater Manchester',
      postcode: 'M1 1AA',
    },
    startDate: '2024-07-20T12:00:00Z',
    endDate: '2024-07-21T23:59:59Z',
    salesOpenDate: '2024-01-01T00:00:00Z',
    salesCloseDate: '2024-07-19T23:59:59Z',
    status: 'cancelled',
    createdAt: '2024-01-05T00:00:00Z',
    year: 2024,
  },
  {
    id: 'evt-3',
    name: 'Business Expo 2024',
    description: '<p>Connect with industry professionals and discover the latest business solutions.</p>',
    logo: null,
    websiteUrl: 'https://businessexpo2024.com',
    address: {
      line1: '789 Commerce Street',
      line2: 'Floor 5',
      city: 'Birmingham',
      county: 'West Midlands',
      postcode: 'B1 1AA',
    },
    startDate: '2024-03-10T08:00:00Z',
    endDate: '2024-03-12T18:00:00Z',
    salesOpenDate: '2024-01-01T00:00:00Z',
    salesCloseDate: '2024-03-09T23:59:59Z',
    status: 'live',
    createdAt: '2024-01-20T00:00:00Z',
    year: 2024,
  },
]

const initialTickets = [
  {
    id: 'tkt-1',
    eventId: 'evt-1',
    name: 'Standard Pass',
    description: 'Single day entry to all sessions',
    price: 150,
    earlyPrice: 99,
    quantity: 500,
    sold: 342,
    visible: true,
    status: 'open',
    groupHeading: 'General Admission',
    sortOrder: 1,
  },
  {
    id: 'tkt-2',
    eventId: 'evt-1',
    name: 'Premium Pass',
    description: 'VIP access plus meet and greet',
    price: 300,
    earlyPrice: 249,
    quantity: 100,
    sold: 67,
    visible: true,
    status: 'open',
    groupHeading: 'VIP',
    sortOrder: 2,
  },
  {
    id: 'tkt-3',
    eventId: 'evt-1',
    name: 'Exhibitor Pass',
    description: 'Exhibitor booth and networking',
    price: 500,
    earlyPrice: null,
    quantity: 50,
    sold: 34,
    visible: true,
    status: 'open',
    groupHeading: 'Exhibitors',
    sortOrder: 3,
  },
  {
    id: 'tkt-4',
    eventId: 'evt-3',
    name: 'Single Day Pass',
    description: 'Access to all sessions for one day',
    price: 89,
    earlyPrice: 59,
    quantity: 1000,
    sold: 567,
    visible: true,
    status: 'open',
    groupHeading: null,
    sortOrder: 1,
  },
  {
    id: 'tkt-5',
    eventId: 'evt-3',
    name: '3-Day Pass',
    description: 'Access to all 3 days of the expo',
    price: 199,
    earlyPrice: 149,
    quantity: 500,
    sold: 289,
    visible: true,
    status: 'open',
    groupHeading: null,
    sortOrder: 2,
  },
  {
    id: 'tkt-6',
    eventId: 'evt-2',
    name: 'General Admission',
    description: 'Two day pass',
    price: 120,
    earlyPrice: 89,
    quantity: 2000,
    sold: 1800,
    visible: true,
    status: 'closed',
    groupHeading: null,
    sortOrder: 1,
  },
]

const initialCheckouts = [
  {
    id: 'cko-1',
    eventId: 'evt-1',
    name: 'Main Checkout',
    enabled: true,
    isDefault: true,
    ticketIds: ['tkt-1', 'tkt-2', 'tkt-3'],
    url: 'tech-conference-2025',
  },
  {
    id: 'cko-2',
    eventId: 'evt-3',
    name: 'Standard Checkout',
    enabled: true,
    isDefault: true,
    ticketIds: ['tkt-4', 'tkt-5'],
    url: 'business-expo-2024',
  },
  {
    id: 'cko-3',
    eventId: 'evt-2',
    name: 'Festival Tickets',
    enabled: false,
    isDefault: true,
    ticketIds: ['tkt-6'],
    url: 'summer-music-festival-2024',
  },
]

const generateOrders = () => {
  const orders = []
  const buyers = [
    { name: 'John Smith', email: 'john.smith@example.com', postcode: 'SW1A 1AA' },
    { name: 'Sarah Johnson', email: 'sarah.j@company.com', postcode: 'M1 1AA' },
    { name: 'Michael Brown', email: 'mbrown@business.co.uk', postcode: 'B1 1AA' },
    { name: 'Emma Wilson', email: 'emma.w@email.com', postcode: 'SW1A 2AA' },
    { name: 'David Lee', email: 'd.lee@corp.com', postcode: 'M1 2AA' },
    { name: 'Lisa Anderson', email: 'lisa.anderson@firm.com', postcode: 'B1 2AA' },
    { name: 'Robert Taylor', email: 'r.taylor@org.uk', postcode: 'SW1A 3AA' },
    { name: 'Jennifer White', email: 'jen.white@service.com', postcode: 'M1 3AA' },
  ]

  // Event 1 orders (20 orders)
  for (let i = 0; i < 20; i++) {
    const buyer = buyers[i % buyers.length]
    const ticketId = ['tkt-1', 'tkt-2', 'tkt-3'][Math.floor(Math.random() * 3)]
    const qty = Math.floor(Math.random() * 3) + 1
    const ticket = initialTickets.find(t => t.id === ticketId)
    const unitPrice = i % 3 === 0 ? ticket.earlyPrice : ticket.price
    const subtotal = unitPrice * qty
    const fees = Math.round(subtotal * 0.035 * 100) / 100 + 0.75
    const total = subtotal + fees
    const discount = i % 5 === 0 ? { code: 'EARLY20', amount: Math.round(total * 0.2 * 100) / 100 } : null

    orders.push({
      id: `ord-evt1-${i + 1}`,
      eventId: 'evt-1',
      checkoutId: 'cko-1',
      buyerName: buyer.name,
      buyerEmail: buyer.email,
      buyerPostcode: buyer.postcode,
      tickets: [{ ticketId, ticketName: ticket.name, quantity: qty, unitPrice }],
      discountCode: discount?.code || null,
      discountAmount: discount?.amount || 0,
      subtotal,
      fees,
      total: total - (discount?.amount || 0),
      status: 'paid',
      createdAt: new Date(2025, 1, Math.floor(Math.random() * 10) + 1).toISOString(),
    })
  }

  // Event 3 orders (15 orders)
  for (let i = 0; i < 15; i++) {
    const buyer = buyers[(i + 3) % buyers.length]
    const ticketId = ['tkt-4', 'tkt-5'][Math.floor(Math.random() * 2)]
    const qty = Math.floor(Math.random() * 2) + 1
    const ticket = initialTickets.find(t => t.id === ticketId)
    const unitPrice = i % 2 === 0 ? ticket.earlyPrice : ticket.price
    const subtotal = unitPrice * qty
    const fees = Math.round(subtotal * 0.035 * 100) / 100 + 0.75
    const total = subtotal + fees

    orders.push({
      id: `ord-evt3-${i + 1}`,
      eventId: 'evt-3',
      checkoutId: 'cko-2',
      buyerName: buyer.name,
      buyerEmail: buyer.email,
      buyerPostcode: buyer.postcode,
      tickets: [{ ticketId, ticketName: ticket.name, quantity: qty, unitPrice }],
      discountCode: null,
      discountAmount: 0,
      subtotal,
      fees,
      total,
      status: 'paid',
      createdAt: new Date(2024, 2, Math.floor(Math.random() * 10) + 1).toISOString(),
    })
  }

  // Event 2 orders (10 orders)
  for (let i = 0; i < 10; i++) {
    const buyer = buyers[(i + 5) % buyers.length]
    const qty = Math.floor(Math.random() * 4) + 1
    const ticket = initialTickets.find(t => t.id === 'tkt-6')
    const unitPrice = 120
    const subtotal = unitPrice * qty
    const fees = Math.round(subtotal * 0.035 * 100) / 100 + 0.75
    const total = subtotal + fees

    orders.push({
      id: `ord-evt2-${i + 1}`,
      eventId: 'evt-2',
      checkoutId: 'cko-3',
      buyerName: buyer.name,
      buyerEmail: buyer.email,
      buyerPostcode: buyer.postcode,
      tickets: [{ ticketId: 'tkt-6', ticketName: ticket.name, quantity: qty, unitPrice }],
      discountCode: null,
      discountAmount: 0,
      subtotal,
      fees,
      total,
      status: i % 3 === 0 ? 'refunded' : 'paid',
      createdAt: new Date(2024, 6, Math.floor(Math.random() * 10) + 1).toISOString(),
    })
  }

  return orders
}

const initialDiscountCodes = [
  {
    id: 'disc-1',
    eventId: 'evt-1',
    code: 'EARLY20',
    description: 'Early bird discount',
    type: 'percentage',
    value: 20,
    maxUses: 100,
    usedCount: 4,
    enabled: true,
  },
  {
    id: 'disc-2',
    eventId: 'evt-1',
    code: 'VIPX10',
    description: 'VIP discount',
    type: 'percentage',
    value: 10,
    maxUses: 50,
    usedCount: 12,
    enabled: true,
  },
  {
    id: 'disc-3',
    eventId: 'evt-3',
    code: 'SAVE50',
    description: 'Save £50',
    type: 'percentage',
    value: 15,
    maxUses: null,
    usedCount: 0,
    enabled: true,
  },
]

const initialBuyerQuestions = [
  {
    id: 'bq-1',
    eventId: 'evt-1',
    question: 'Dietary requirements?',
    type: 'dropdown',
    options: ['None', 'Vegetarian', 'Vegan', 'Halal', 'Kosher'],
    required: false,
    enabled: true,
    sortOrder: 1,
    perTransaction: true,
  },
  {
    id: 'bq-2',
    eventId: 'evt-1',
    question: 'Company name',
    type: 'text',
    options: [],
    required: false,
    enabled: true,
    sortOrder: 2,
    perTransaction: false,
  },
  {
    id: 'bq-3',
    eventId: 'evt-3',
    question: 'How did you hear about us?',
    type: 'dropdown',
    options: ['Email', 'Social Media', 'Website', 'Friend', 'Other'],
    required: true,
    enabled: true,
    sortOrder: 1,
    perTransaction: false,
  },
]

const initialSettings = [
  {
    eventId: 'evt-1',
    feeFixed: 0.75,
    feePercent: 3.5,
    feesPassedOn: false,
    vatRegistered: true,
    supportEmail: 'support@techconf2025.com',
    termsAndConditions: '<p>By purchasing tickets, you agree to our terms and conditions.</p>',
    preCheckoutMessage: 'Complete your purchase below',
    postCheckoutMessage: 'Thank you for your order! Check your email for confirmation.',
    facebookPixel: '',
  },
  {
    eventId: 'evt-3',
    feeFixed: 0.75,
    feePercent: 3.5,
    feesPassedOn: false,
    vatRegistered: true,
    supportEmail: 'support@businessexpo2024.com',
    termsAndConditions: '<p>By purchasing tickets, you agree to our terms and conditions.</p>',
    preCheckoutMessage: 'Nearly done! Complete your order',
    postCheckoutMessage: 'Ticket confirmation sent to your email',
    facebookPixel: '',
  },
  {
    eventId: 'evt-2',
    feeFixed: 0.75,
    feePercent: 3.5,
    feesPassedOn: false,
    vatRegistered: true,
    supportEmail: 'support@summerfest2024.com',
    termsAndConditions: '<p>By purchasing tickets, you agree to our terms and conditions.</p>',
    preCheckoutMessage: '',
    postCheckoutMessage: 'See you at the festival!',
    facebookPixel: '',
  },
]

const initialUserRoles = [
  {
    id: 'usr-1',
    name: 'Admin User',
    email: 'admin@dn3events.com',
    role: 'administrator',
  },
  {
    id: 'usr-2',
    name: 'Event Manager',
    email: 'manager@dn3events.com',
    role: 'organiser',
  },
  {
    id: 'usr-3',
    name: 'Support Agent',
    email: 'support@dn3events.com',
    role: 'support',
  },
]

export const useStore = create(
  persist(
    (set) => ({
      events: initialEvents,
      tickets: initialTickets,
      checkouts: initialCheckouts,
      orders: generateOrders(),
      discountCodes: initialDiscountCodes,
      buyerQuestions: initialBuyerQuestions,
      eventSettings: initialSettings,
      userRoles: initialUserRoles,
      toast: null,

      // Events
      addEvent: (event) =>
        set((state) => ({
          events: [...state.events, { ...event, id: generateId(), createdAt: new Date().toISOString(), year: new Date(event.startDate).getFullYear() }],
        })),

      updateEvent: (eventId, updates) =>
        set((state) => ({
          events: state.events.map((e) => (e.id === eventId ? { ...e, ...updates } : e)),
        })),

      deleteEvent: (eventId) =>
        set((state) => ({
          events: state.events.filter((e) => e.id !== eventId),
          tickets: state.tickets.filter((t) => t.eventId !== eventId),
          checkouts: state.checkouts.filter((c) => c.eventId !== eventId),
          orders: state.orders.filter((o) => o.eventId !== eventId),
        })),

      // Tickets
      addTicket: (ticket) =>
        set((state) => ({
          tickets: [...state.tickets, { ...ticket, id: generateId() }],
        })),

      updateTicket: (ticketId, updates) =>
        set((state) => ({
          tickets: state.tickets.map((t) => (t.id === ticketId ? { ...t, ...updates } : t)),
        })),

      deleteTicket: (ticketId) =>
        set((state) => ({
          tickets: state.tickets.filter((t) => t.id !== ticketId),
        })),

      // Checkouts
      addCheckout: (checkout) =>
        set((state) => ({
          checkouts: [...state.checkouts, { ...checkout, id: generateId() }],
        })),

      updateCheckout: (checkoutId, updates) =>
        set((state) => ({
          checkouts: state.checkouts.map((c) => (c.id === checkoutId ? { ...c, ...updates } : c)),
        })),

      deleteCheckout: (checkoutId) =>
        set((state) => ({
          checkouts: state.checkouts.filter((c) => c.id !== checkoutId),
        })),

      // Orders
      addOrder: (order) =>
        set((state) => ({
          orders: [...state.orders, { ...order, id: generateId(), createdAt: new Date().toISOString() }],
        })),

      updateOrder: (orderId, updates) =>
        set((state) => ({
          orders: state.orders.map((o) => (o.id === orderId ? { ...o, ...updates } : o)),
        })),

      deleteOrder: (orderId) =>
        set((state) => ({
          orders: state.orders.filter((o) => o.id !== orderId),
        })),

      // Discount Codes
      addDiscountCode: (code) =>
        set((state) => ({
          discountCodes: [...state.discountCodes, { ...code, id: generateId() }],
        })),

      updateDiscountCode: (codeId, updates) =>
        set((state) => ({
          discountCodes: state.discountCodes.map((c) => (c.id === codeId ? { ...c, ...updates } : c)),
        })),

      deleteDiscountCode: (codeId) =>
        set((state) => ({
          discountCodes: state.discountCodes.filter((c) => c.id !== codeId),
        })),

      // Buyer Questions
      addBuyerQuestion: (question) =>
        set((state) => ({
          buyerQuestions: [...state.buyerQuestions, { ...question, id: generateId() }],
        })),

      updateBuyerQuestion: (questionId, updates) =>
        set((state) => ({
          buyerQuestions: state.buyerQuestions.map((q) => (q.id === questionId ? { ...q, ...updates } : q)),
        })),

      deleteBuyerQuestion: (questionId) =>
        set((state) => ({
          buyerQuestions: state.buyerQuestions.filter((q) => q.id !== questionId),
        })),

      // Event Settings
      updateEventSettings: (eventId, updates) =>
        set((state) => ({
          eventSettings: state.eventSettings.map((s) =>
            s.eventId === eventId ? { ...s, ...updates } : s
          ),
        })),

      getEventSettings: (eventId) => {
        // This is a computed value
        return (state) => state.eventSettings.find((s) => s.eventId === eventId) || { eventId }
      },

      // User Roles
      addUserRole: (user) =>
        set((state) => ({
          userRoles: [...state.userRoles, { ...user, id: generateId() }],
        })),

      updateUserRole: (userId, updates) =>
        set((state) => ({
          userRoles: state.userRoles.map((u) => (u.id === userId ? { ...u, ...updates } : u)),
        })),

      deleteUserRole: (userId) =>
        set((state) => ({
          userRoles: state.userRoles.filter((u) => u.id !== userId),
        })),

      // Toast (keep for backwards compatibility)
      showToast: (message, type = 'success') =>
        set({ toast: { message, type, id: generateId() } }),

      clearToast: () => set({ toast: null }),

      // Removed: all data is now loaded from API
      // Keep only toast functionality for UI notifications
    }),
    {
      name: 'dn3-events-storage',
    }
  )
)
