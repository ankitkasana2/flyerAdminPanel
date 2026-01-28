"use client";
import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Search, ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ordersStore } from "@/stores/ordersStore";
import { flyerStore } from "@/stores/flyerStore";
import { OrderDetailPage, type OrderFromAPI } from "./order-detail-page";

const msToHMS = (ms: number) => {
  if (ms <= 0) return "00:00:00";
  const total = Math.floor(ms / 1000);
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const two = (n: number) => n.toString().padStart(2, "0");
  return `${two(hrs)}:${two(mins)}:${two(secs)}`;
};

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleString();
  } catch (e) {
    return 'Invalid date';
  }
};

interface OrdersManagementProps {
  userRole: "designer" | "super-admin" | "admin";
}

export const OrdersManagement = observer(({ userRole }: OrdersManagementProps) => {
  useEffect(() => {
    ordersStore.fetchOrders();
    if (flyerStore.flyers.length === 0) {
      flyerStore.fetchFlyers();
    }
    console.log("Orders Management - Initial Orders Load:", ordersStore.orders);
    const interval = setInterval(() => {
      ordersStore.fetchOrders();
      console.log("Orders Management - Periodic Orders Update:", ordersStore.orders);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (ordersStore.selectedOrder) {
    // Convert the Order type to OrderFromAPI type for the OrderDetailPage
    const selectedOrder: OrderFromAPI = {
      ...ordersStore.selectedOrder,
      // Ensure all required fields are present
      presenting: ordersStore.selectedOrder.presenting || '',
      event_title: ordersStore.selectedOrder.event_title || '',
      event_date: ordersStore.selectedOrder.event_date || new Date().toISOString(),
      flyer_info: ordersStore.selectedOrder.flyer_info || '',
      address_phone: ordersStore.selectedOrder.address_phone || '',
      venue_logo: ordersStore.selectedOrder.venue_logo || null,
      djs: ordersStore.selectedOrder.djs || [],
      host: ordersStore.selectedOrder.host || {},
      sponsors: ordersStore.selectedOrder.sponsors || [],
      custom_notes: ordersStore.selectedOrder.custom_notes || '',
      flyer_is: ordersStore.selectedOrder.flyer_is || 0,
      displayId: ordersStore.selectedOrder.displayId,
      createdAt: ordersStore.selectedOrder.created_at,
    };
    console.log("Selected Order in Management:", selectedOrder);

    return (
      <OrderDetailPage
        selectedOrder={selectedOrder}
        onBack={() => ordersStore.setSelectedOrder(null)}
      />
    );
  }

  if (ordersStore.loading && ordersStore.orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-border rounded-full animate-spin mx-auto border-t-primary"></div>
          <p className="text-sm font-medium text-muted-foreground">
            Loading orders...
          </p>
        </div>
      </div>
    );
  }

  if (ordersStore.error) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center space-y-4 max-w-md p-8">
          <h2 className="text-lg font-bold text-foreground">
            Unable to Load Orders
          </h2>
          <p className="text-sm text-muted-foreground">{ordersStore.error}</p>
          <button
            onClick={() => ordersStore.fetchOrders()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded font-medium hover:bg-primary/90 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  console.log("Orders Management - Rendering with orders:", {
    total: ordersStore.orders.length,
    active: ordersStore.visibleOrders.active.length,
    completed: ordersStore.visibleOrders.completed.length
  });

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Orders
        </h1>
        <p className="text-sm text-muted-foreground font-light">
          Manage and track all orders in real-time
        </p>
      </div>

      <Card className="border border-border bg-card">
        <CardHeader className="border-b border-border pb-4">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold text-foreground tracking-tight">
              Active Orders
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {ordersStore.visibleOrders.active.length} active ·{" "}
              {ordersStore.visibleOrders.completed.length} completed
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Search & Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by email, phone, order ID, flyer or file name..."
                value={ordersStore.searchTerm}
                onChange={(e) => ordersStore.setSearchTerm(e.target.value)}
                className="pl-10 h-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/50 text-sm"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {["All", "1H", "5H", "24H", "Completed"].map((s) => (
                <button
                  key={s}
                  onClick={() => ordersStore.setStatusFilter(s as any)}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${ordersStore.statusFilter === s
                    ? "bg-[#E50914] text-white"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Active Orders Table */}
          <div className="border border-border rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/30 border-b border-border">
                <tr>
                  <th className="text-left py-4 px-4 font-semibold text-foreground text-xs uppercase tracking-wide">
                    Order ID
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-foreground text-xs uppercase tracking-wide">
                    Flyer
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-foreground text-xs uppercase tracking-wide">
                    Customer
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-foreground text-xs uppercase tracking-wide">
                    Priority
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-foreground text-xs uppercase tracking-wide">
                    Countdown
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-foreground text-xs uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-foreground text-xs uppercase tracking-wide">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {ordersStore.visibleOrders.active.map((order) => {
                  const { fastest, remainingMs } = ordersStore.getOrderPriority(order);
                  const isExpired = remainingMs <= 0 && fastest !== "Completed";

                  const priorityColor =
                    fastest === "1H"
                      ? "text-primary font-bold"
                      : fastest === "5H"
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground";

                  return (
                    <tr
                      key={order.id}
                      onClick={() => ordersStore.setSelectedOrder(order)}
                      className={`group relative cursor-pointer transition-all duration-300 ease-out hover:bg-[#E50914]/10 hover:border-l-4 hover:border-l-[#E50914] ${isExpired ? "gentle-pulse bg-primary/5" : ""
                        }`}
                    >
                      <td className="py-4 px-4 text-foreground font-medium text-sm">
                        #{order.displayId}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {(() => {
                            const flyer = flyerStore.flyers.find(f => f.id === order.flyer_is.toString());
                            return flyer ? (
                              <div className="w-20 h-28 bg-secondary rounded overflow-hidden flex-shrink-0 border border-border">
                                <img src={flyer.image} alt="" className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-20 h-28 bg-secondary rounded flex-shrink-0 border border-dashed border-border flex items-center justify-center text-[10px] text-muted-foreground">
                                {order.flyer_is}
                              </div>
                            );
                          })()}
                          <span className="text-foreground text-sm font-medium">
                            {order.event_title || `Order #${order.displayId}`}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-foreground text-sm font-medium">
                            {order.email}
                          </span>
                          {order.whatsapp && (
                            <span className="text-xs text-muted-foreground">
                              {order.whatsapp}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-xs ${priorityColor}`}>{fastest}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`font-mono text-xs font-bold ${isExpired ? "text-primary" : "text-foreground"
                            }`}
                        >
                          {msToHMS(remainingMs)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <select
                          value={order.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();
                            ordersStore.updateOrderStatus(order.id, e.target.value as any);
                          }}
                          className={`
    px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer min-w-[150px]
    transition-all duration-200 outline-none border border-[#2a2a2a]
    shadow-[0_4px_12px_rgba(0,0,0,0.45)]
    bg-[#181818]

    ${order.status === "pending"
                              ? "bg-red-500/20 text-red-400"
                              : order.status === "processing"
                                ? "bg-yellow-400/20 text-yellow-300"
                                : "bg-green-500/20 text-green-400"
                            }
  `}
                        >

                          <option
                            value="pending"
                            className="font-semibold"
                            style={{
                              backgroundColor: "#ffdddd",   // light red
                              color: "#d10000"              // red
                            }}
                          >
                            Pending
                          </option>

                          <option
                            value="processing"
                            className="font-semibold"
                            style={{
                              backgroundColor: "#fff5cc",   // light yellow
                              color: "#b68f00"              // yellow
                            }}
                          >
                            Processing
                          </option>

                          <option
                            value="completed"
                            className="font-semibold"
                            style={{
                              backgroundColor: "#ddffdd",   // light green
                              color: "#008f2a"              // green
                            }}
                          >
                            Completed
                          </option>
                        </select>

                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            ordersStore.setSelectedOrder(order);
                          }}
                          className="text-primary hover:text-white hover:bg-[#E50914] p-2 rounded transition-all duration-200 group"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Completed Orders Table */}
          {ordersStore.visibleOrders.completed.length > 0 && (
            <div className="mt-8 pt-8 border-t border-border/50 space-y-4">
              <h3 className="text-lg font-bold text-foreground tracking-tight">
                Completed Orders ({ordersStore.visibleOrders.completed.length})
              </h3>
              <div className="border border-border rounded overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/20 border-b border-border">
                    <tr>
                      <th className="text-left py-4 px-4 font-semibold text-foreground text-xs uppercase tracking-wide">
                        Order ID
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-foreground text-xs uppercase tracking-wide">
                        Flyer
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-foreground text-xs uppercase tracking-wide">
                        Customer
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-foreground text-xs uppercase tracking-wide">
                        Date
                      </th>
                      <th className="text-center py-4 px-4 font-semibold text-foreground text-xs uppercase tracking-wide">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {ordersStore.visibleOrders.completed.map((order) => (
                      <tr
                        key={order.id}
                        onClick={() => ordersStore.setSelectedOrder(order)}
                        className="group relative cursor-pointer transition-all duration-300 ease-out hover:bg-[#E50914]/10 hover:border-l-4 hover:border-l-[#E50914]"
                      >
                        <td className="py-4 px-4 text-foreground font-medium text-sm">
                          #{order.displayId}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            {(() => {
                              const flyer = flyerStore.flyers.find(f => f.id === order.flyer_is.toString());
                              return flyer ? (
                                <div className="w-20 h-28 bg-secondary rounded overflow-hidden flex-shrink-0 border border-border">
                                  <img src={flyer.image} alt="" className="w-full h-full object-cover" />
                                </div>
                              ) : (
                                <div className="w-20 h-28 bg-secondary rounded flex-shrink-0 border border-dashed border-border flex items-center justify-center text-[10px] text-muted-foreground">
                                  {order.flyer_is}
                                </div>
                              );
                            })()}
                            <span className="text-foreground text-sm font-medium truncate max-w-[200px]">
                              {order.event_title || `Order #${order.displayId}`}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-muted-foreground text-sm">{order.email}</td>
                        <td className="py-4 px-4 text-muted-foreground text-sm">{formatDate(order.createdAt ?? "")}</td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              ordersStore.setSelectedOrder(order);
                            }}
                            className="text-primary hover:text-white hover:bg-[#E50914] p-2 rounded transition-all duration-200"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});
