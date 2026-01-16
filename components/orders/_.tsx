// "use client"

// import { useState, useEffect } from "react"
// import { ArrowLeft, Copy } from 'lucide-react'
// import { Button } from "@/components/ui/button"


// interface FlyerDetails {
//   id: string
//   fileName: string
//   title: string
//   price: number
//   delivery: "1H" | "5H" | "24H"
//   formFields?: Record<string, string>
//   logos?: string[]
//   images?: string[]
//   completedAt?: string
// }

// interface Order {
//   id: string
//   email: string
//   whatsapp?: string
//   name?: string
//   paymentMethod?: string
//   totalAmount?: string
//   date?: string
//   flyers?: FlyerDetails[]
//   adminNotes?: string
//   status: string
//   createdAt?: string
//   details?: {
//     presenting?: string
//     eventTitle?: string
//     eventDate?: string
//     flyerInfo?: string
//     addressPhone?: string
//     djs?: string[]
//     hostName?: string
//     sponsors?: string[]
//     extras?: string[]
//     deliveryTime?: string
//     notes?: string
//   }
// }

// interface OrderDetailPageProps {
//   selectedOrder : Order
//   onBack: () => void
// }

// export function OrderDetailPage({ selectedOrder, onBack }: OrderDetailPageProps) {
//   if (!selectedOrder) {
//     return (
//       <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
//         <button onClick={onBack} className="text-primary hover:underline">
//           Back to Orders
//         </button>
//       </div>
//     )
//   }

//   const [now, setNow] = useState(Date.now())
//   const [copiedField, setCopiedField] = useState<string | null>(null)
//   const [adminNotes, setAdminNotes] = useState(selectedOrder.adminNotes || "")

//   useEffect(() => {
//     const id = setInterval(() => setNow(Date.now()), 1000)
//     return () => clearInterval(id)
//   }, [])

//   const copyToClipboard = (text: string, fieldId: string) => {
//     navigator.clipboard.writeText(text)
//     setCopiedField(fieldId)
//     setTimeout(() => setCopiedField(null), 2000)
//   }

//   const calculateRemainingTime = (flyerDelivery: string, createdAt: string) => {
//     const deliveryMap = { "1H": 1, "5H": 5, "24H": 24 }
//     const hours = deliveryMap[flyerDelivery as keyof typeof deliveryMap] || 24
//     const deadline = new Date(createdAt).getTime() + hours * 60 * 60 * 1000
//     const remainingMs = deadline - now
    
//     if (remainingMs <= 0) return "00:00:00"
//     const total = Math.floor(remainingMs / 1000)
//     const hrs = Math.floor(total / 3600)
//     const mins = Math.floor((total % 3600) / 60)
//     const secs = total % 60
//     const two = (n: number) => n.toString().padStart(2, "0")
//     return `${two(hrs)}:${two(mins)}:${two(secs)}`
//   }

//   const getDeliveryColor = (delivery: string) => {
//     switch (delivery) {
//       case "1H":
//         return "bg-[#FF4D4F] text-white"
//       case "5H":
//         return "bg-[#FF8C3A] text-white"
//       case "24H":
//         return "bg-[#3B82F6] text-white"
//       default:
//         return "bg-gray-500 text-white"
//     }
//   }

//   // Mock flyers with all details
//   const mockFlyers: FlyerDetails[] = selectedOrder.flyers || [
//     {
//       id: "F1",
//       fileName: "grodify237586.jpg",
//       title: "Event Flyer",
//       price: 15,
//       delivery: "1H",
//       formFields: {
//         eventName: "Music Night 2025",
//         venue: "Downtown Venue",
//         date: "June 15, 2025",
//         time: "9:00 PM"
//       }
//     }
//   ]

//   return (
//     <div className="min-h-screen bg-background text-foreground">
//       <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
//         {/* Header */}
//         <div className="flex items-center gap-4">
//           <button
//             onClick={onBack}
//             className="flex items-center gap-2 text-red-500 hover:text-red-400 font-medium transition-colors"
//           >
//             <ArrowLeft className="w-4 h-4" />
//             Back to Orders
//           </button>
//         </div>

//         <div className="space-y-2">
//           <h1 className="text-4xl font-bold text-foreground">Order Details - {selectedOrder.id}</h1>
//           <p className="text-muted-foreground">All order information and flyer details</p>
//         </div>

//         {/* CUSTOMER INFORMATION SECTION */}
//         <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
//           <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
//             <div className="w-2 h-2 bg-red-500 rounded-full"></div>
//             Customer Information
//           </h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="p-3 bg-secondary rounded-lg border border-border">
//               <p className="text-xs text-muted-foreground mb-1">Name</p>
//               <div className="flex items-center justify-between">
//                 <p className="text-foreground font-semibold">{selectedOrder.name || "N/A"}</p>
//                 <button
//                   onClick={() => copyToClipboard(selectedOrder.name || "N/A", "name")}
//                   className="text-muted-foreground hover:text-foreground transition-colors"
//                   title="Copy"
//                 >
//                   <Copy className="w-4 h-4" />
//                 </button>
//               </div>
//             </div>
//             <div className="p-3 bg-secondary rounded-lg border border-border">
//               <p className="text-xs text-muted-foreground mb-1">Email</p>
//               <div className="flex items-center justify-between">
//                 <p className="text-foreground font-semibold text-sm">{selectedOrder.email}</p>
//                 <button
//                   onClick={() => copyToClipboard(selectedOrder.email, "email")}
//                   className="text-muted-foreground hover:text-foreground transition-colors"
//                   title="Copy"
//                 >
//                   <Copy className="w-4 h-4" />
//                 </button>
//               </div>
//             </div>
//             <div className="p-3 bg-secondary rounded-lg border border-border">
//               <p className="text-xs text-muted-foreground mb-1">WhatsApp</p>
//               <div className="flex items-center justify-between">
//                 <p className="text-foreground font-semibold">{selectedOrder.whatsapp || "N/A"}</p>
//                 <button
//                   onClick={() => copyToClipboard(selectedOrder.whatsapp || "N/A", "whatsapp")}
//                   className="text-muted-foreground hover:text-foreground transition-colors"
//                   title="Copy"
//                 >
//                   <Copy className="w-4 h-4" />
//                 </button>
//               </div>
//             </div>
//             <div className="p-3 bg-secondary rounded-lg border border-border">
//               <p className="text-xs text-muted-foreground mb-1">Payment Method</p>
//               <p className="text-foreground font-semibold">{selectedOrder.paymentMethod || "N/A"}</p>
//             </div>
//             <div className="p-3 bg-secondary rounded-lg border border-border">
//               <p className="text-xs text-muted-foreground mb-1">Total Amount Paid</p>
//               <p className="text-foreground font-semibold">{selectedOrder.totalAmount || "N/A"}</p>
//             </div>
//             <div className="p-3 bg-secondary rounded-lg border border-border">
//               <p className="text-xs text-muted-foreground mb-1">Order Date & Time</p>
//               <p className="text-foreground font-semibold text-sm">{new Date(selectedOrder.createdAt ||  "").toLocaleString()}</p>
//             </div>
//           </div>
//         </div>

//         {/* FLYER LIST SECTION */}
//         <div className="space-y-4">
//           <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
//             <div className="w-2 h-2 bg-red-500 rounded-full"></div>
//             Flyers ({mockFlyers.length})
//           </h2>

//           {mockFlyers.map((flyer, index) => {
//             const remainingTime = calculateRemainingTime(flyer.delivery, selectedOrder.createdAt ||  "")
//             const isExpired = remainingTime === "00:00:00"

//             return (
//               <div
//                 key={flyer.id}
//                 className={`bg-card border border-border rounded-2xl p-6 space-y-4 ${isExpired && flyer.delivery !== "24H" ? "border-red-500 bg-red-50/10" : ""}`}
//               >
//                 <div className="flex items-start justify-between mb-4">
//                   <div>
//                     <h3 className="text-lg font-bold text-foreground">Flyer #{index + 1}</h3>
//                     <p className="text-sm text-muted-foreground">{flyer.title ?? "No title"}</p>
//                   </div>
//                   <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getDeliveryColor(flyer.delivery)}`}>
//                     {flyer.delivery} Delivery
//                   </span>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="bg-secondary border border-border rounded-lg p-4 flex items-center justify-center min-h-48">
//                     <div className="text-center">
//                       <p className="text-muted-foreground text-sm mb-2">Thumbnail Preview</p>
//                       <p className="text-foreground font-semibold">{flyer.fileName}</p>
//                     </div>
//                   </div>

//                   <div className="space-y-3">
//                     <div className="p-3 bg-secondary rounded-lg border border-border">
//                       <p className="text-xs text-muted-foreground mb-1">Real Original File Name</p>
//                       <div className="flex items-center justify-between">
//                         <p className="text-foreground font-mono font-bold text-sm">{flyer.fileName}</p>
//                         <button
//                           onClick={() => copyToClipboard(flyer.fileName, `fileName-${flyer.id}`)}
//                           className={`transition-colors ${copiedField === `fileName-${flyer.id}` ? "text-green-500" : "text-muted-foreground hover:text-foreground"}`}
//                           title="Copy"
//                         >
//                           <Copy className="w-4 h-4" />
//                         </button>
//                       </div>
//                     </div>

//                     <div className="p-3 bg-secondary rounded-lg border border-border">
//                       <p className="text-xs text-muted-foreground mb-1">Flyer Title</p>
//                       <p className="text-foreground font-semibold">{flyer.title ?? "No title"}</p>
//                     </div>

//                     <div className="p-3 bg-secondary rounded-lg border border-border">
//                       <p className="text-xs text-muted-foreground mb-1">Price</p>
//                       <p className="text-foreground font-semibold">${flyer.price != null ? `$${flyer.price}` : "—"}</p>
//                     </div>

//                     <div className="p-3 bg-secondary rounded-lg border border-border">
//                       <p className="text-xs text-muted-foreground mb-1">Delivery Time & Priority</p>
//                       <div className="flex items-center justify-between">
//                         <p className={`text-foreground font-semibold ${getDeliveryColor(flyer.delivery).split(" ")[0].replace("bg-", "text-")}`}>
//                           {flyer.delivery} Priority
//                         </p>
//                       </div>
//                     </div>

//                     <div className={`p-3 rounded-lg border ${isExpired && flyer.delivery !== "24H" ? "bg-red-100/20 border-red-500" : "bg-secondary border-border"}`}>
//                       <p className="text-xs text-muted-foreground mb-1">Live Countdown Timer</p>
//                       <p className={`font-mono font-bold ${isExpired && flyer.delivery !== "24H" ? "text-red-600 text-lg" : "text-foreground"}`}>
//                         {remainingTime}
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 {flyer.formFields && Object.keys(flyer.formFields).length > 0 && (
//                   <div className="mt-6 space-y-3">
//                     <h4 className="font-semibold text-foreground text-sm">Form Fields</h4>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                       {Object.entries(flyer.formFields).map(([key, value]) => (
//                         <div key={key} className="p-3 bg-secondary rounded-lg border border-border">
//                           <p className="text-xs text-muted-foreground mb-2 capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
//                           <div className="flex items-center justify-between">
//                             <p className="text-foreground font-semibold text-sm">{value}</p>
//                             <button
//                               onClick={() => copyToClipboard(value, `field-${key}`)}
//                               className={`transition-colors ${copiedField === `field-${key}` ? "text-green-500" : "text-muted-foreground hover:text-foreground"}`}
//                               title="Copy field"
//                             >
//                               <Copy className="w-4 h-4" />
//                             </button>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                     <button className="w-full mt-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
//                       Copy All Fields
//                     </button>
//                   </div>
//                 )}

//                 <div className="mt-6 pt-6 border-t border-border space-y-3">
//                   <h4 className="font-semibold text-foreground text-sm">Process Flyer</h4>
//                   <div className="space-y-2">
//                     <button className="w-full px-4 py-2 bg-secondary border border-border text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors">
//                       Upload Completed Flyer (JPG/PNG)
//                     </button>
//                     <button className="w-full px-4 py-2 bg-green-600/20 border border-green-600 text-green-600 rounded-lg font-medium hover:bg-green-600/30 transition-colors">
//                       ✓ Mark This Flyer as Completed
//                     </button>
//                     <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
//                       Send to Customer (Email & WhatsApp)
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )
//           })}
//         </div>

//         <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
//           <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
//             <div className="w-2 h-2 bg-red-500 rounded-full"></div>
//             Internal Admin Notes
//           </h2>
//           <textarea
//             value={adminNotes}
//             onChange={(e) => setAdminNotes(e.target.value)}
//             placeholder="Add internal notes about this order..."
//             className="w-full p-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-24"
//           />
//           <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
//             Save Notes
//           </button>
//         </div>

//         {/* Footer action buttons */}
//         <div className="flex gap-4">
//           <Button
//             variant="outline"
//             className="border-border text-foreground hover:bg-secondary font-semibold bg-transparent"
//             onClick={onBack}
//           >
//             Back to Orders
//           </Button>
//         </div>
//       </div>
//     </div>
//   )
// }
