"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Copy, CheckCircle2, Upload, Send, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ordersStore } from "@/stores/ordersStore";
import { flyerStore } from "@/stores/flyerStore";
import { observer } from "mobx-react-lite";

export interface OrderFromAPI {
  id: number;
  displayId: string;
  email: string | null;
  whatsapp?: string;
  name?: string;
  paymentMethod?: string;
  totalAmount?: string;
  status: 'pending' | 'processing' | 'completed';
  created_at: string;
  updated_at: string;
  web_user_id: string | null;

  // Event details
  presenting: string;
  event_title: string;
  event_date: string;
  flyer_info: string;
  address_phone: string;
  venue_logo: string | null;
  djs: (string | { name: string | { name: string }; image?: string | null })[];
  host: Record<string, any> | { name: string | { name: string }; image?: string | null };
  sponsors: (string | { name: string | { name: string }; image?: string | null })[];
  custom_notes: string;
  flyer_is: number;
  delivery_time?: string;
  total_price?: string;
  adminNotes?: string;

  // For backward compatibility
  flyers?: Array<{
    id: string;
    name?: string;
    fileName?: string;
    delivery: '1H' | '5H' | '24H';
  }>;

  // Alias for created_at
  createdAt?: string;
}

interface OrderFile {
  id: number;
  order_id: number;
  user_id: string;
  file_url: string;
  file_type: string;
  original_name: string;
  created_at: string;
}

interface OrderFilesResponse {
  success: boolean;
  count: number;
  files: OrderFile[];
}


interface OrderDetailPageProps {
  selectedOrder: OrderFromAPI;
  onBack: () => void;
}

export const OrderDetailPage = observer(({
  selectedOrder,
  onBack,
}: OrderDetailPageProps) => {
  const [now, setNow] = useState(Date.now());
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState(selectedOrder?.custom_notes || selectedOrder?.adminNotes || "");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [orderFiles, setOrderFiles] = useState<OrderFile[]>([]);

  const fetchOrderFiles = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/order-files/order/${selectedOrder.id}`);
      if (response.ok) {
        const data: OrderFilesResponse = await response.json();
        if (data.success) {
          setOrderFiles(data.files);
        }
      }
    } catch (error) {
      console.error("Error fetching order files:", error);
    }
  };

  useEffect(() => {
    fetchOrderFiles();
  }, [selectedOrder.id]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (flyerStore.flyers.length === 0) {
      flyerStore.fetchFlyers();
    }
  }, []);

  const orderedFlyer = flyerStore.flyers.find(f => f.id === selectedOrder.flyer_is.toString());

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 1500);
  };

  // Parse delivery time from API
  const parseDeliveryTime = (deliveryStr?: string): '1H' | '5H' | '24H' => {
    if (!deliveryStr) return '24H';
    if (deliveryStr.includes('1 Hour') || deliveryStr.includes('1H')) return '1H';
    if (deliveryStr.includes('5 Hour') || deliveryStr.includes('5H')) return '5H';
    return '24H';
  };

  const flyerDelivery = parseDeliveryTime(selectedOrder.delivery_time);

  const calculateRemainingTime = () => {
    const hours = { "1H": 1, "5H": 5, "24H": 24 }[flyerDelivery] || 24;
    const deadline = new Date(selectedOrder.created_at).getTime() + hours * 60 * 60 * 1000;
    const remainingMs = deadline - now;
    if (remainingMs <= 0) return "00:00:00";
    const total = Math.floor(remainingMs / 1000);
    const hrs = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    const two = (n: number) => n.toString().padStart(2, "0");
    return `${two(hrs)}:${two(mins)}:${two(secs)}`;
  };

  const getDeliveryLabel = () => {
    const labels = { "1H": "1H - EXPRESS", "5H": "5H - FAST", "24H": "24H - NORMAL" };
    return labels[flyerDelivery];
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const [isSending, setIsSending] = useState(false);

  const handleSendFile = async () => {
    if (!uploadedFile) {
      alert("Please select a file first");
      return;
    }

    setIsSending(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/order-files/${selectedOrder.id}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      console.log("File uploaded successfully");
      alert("File sent successfully!");
      setUploadedFile(null); // Reset uploaded file
      fetchOrderFiles(); // Refresh list
    } catch (error) {
      console.error("Error sending file:", error);
      alert("Failed to send file. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const [isNotifying, setIsNotifying] = useState(false);

  const handleNotifyCustomer = async () => {
    // We need a download link. Use the latest file if available.
    const latestFile = orderFiles.length > 0 ? orderFiles[0] : null;

    if (!latestFile && !confirm("No files have been uploaded for this order yet. Send notification anyway?")) {
      return;
    }

    setIsNotifying(true);
    try {
      const response = await fetch('/api/send-ready-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.displayId,
          customerName: selectedOrder.name || (selectedOrder.email ? selectedOrder.email.split('@')[0] : "Valued Customer"),
          customerEmail: selectedOrder.email,
          downloadUrl: latestFile ? latestFile.file_url : `https://grodify.com/profile`, // Fallback
          imageUrl: latestFile ? latestFile.file_url : (orderedFlyer ? orderedFlyer.image : undefined)
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send notification");
      }

      alert("Customer notified successfully!");
    } catch (error: any) {
      console.error("Error notifying customer:", error);
      alert(error.message || "Failed to notify customer");
    } finally {
      setIsNotifying(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const forceDownload = (url: string, filename: string) => {
    const downloadUrl = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
    window.location.href = downloadUrl;
  };
  console.log("Order Details Debug:", selectedOrder);
  // alert(JSON.stringify(selectedOrder));
  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="sticky top-0 bg-background/95 border-b border-border z-50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button
            variant="outline"
            className="bg-secondary border-border text-foreground hover:bg-secondary/80 font-semibold h-9 gap-2 text-sm transition-all"
            onClick={onBack}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Button>
          <h1 className="text-lg font-bold text-foreground tracking-tight">
            Order #{selectedOrder.displayId}
          </h1>
          {/* Status Dropdown */}
          <select
            value={selectedOrder.status}
            onChange={(e) => ordersStore.updateOrderStatus(selectedOrder.id, e.target.value as any)}
            className={`
              px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer min-w-[150px]
              transition-all duration-200 outline-none border border-border
              shadow-[0_4px_12px_rgba(0,0,0,0.45)]
              bg-[#181818]
              ${selectedOrder.status === "pending"
                ? "bg-red-500/20 text-red-400"
                : selectedOrder.status === "processing"
                  ? "bg-yellow-400/20 text-yellow-300"
                  : "bg-green-500/20 text-green-400"
              }
            `}
          >
            <option
              value="pending"
              className="font-semibold"
              style={{
                backgroundColor: "#ffdddd",
                color: "#d10000"
              }}
            >
              Pending
            </option>
            <option
              value="processing"
              className="font-semibold"
              style={{
                backgroundColor: "#fff5cc",
                color: "#b68f00"
              }}
            >
              Processing
            </option>
            <option
              value="completed"
              className="font-semibold"
              style={{
                backgroundColor: "#ddffdd",
                color: "#008f2a"
              }}
            >
              Completed
            </option>
          </select>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* Customer Information - Tumhara original section */}
        <Card className="border border-border bg-card">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base font-bold text-foreground tracking-tight">
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: "Name", value: selectedOrder.name || "N/A", id: "name" },
                { label: "Email", value: selectedOrder.email || "N/A", id: "email" },
                { label: "WhatsApp", value: selectedOrder.whatsapp || "N/A", id: "whatsapp" },
                { label: "Payment Method", value: "Stripe", id: "payment" },
                { label: "Total Amount", value: selectedOrder.total_price ? `₹${selectedOrder.total_price}` : "N/A", id: "amount" },
                { label: "Order Date", value: formatDate(selectedOrder.created_at), id: "date" },
              ].map((field) => (
                <div
                  key={field.id}
                  className="p-3 bg-secondary border border-border rounded hover:border-primary/50 transition-all group cursor-copy"
                  onClick={() => copyToClipboard(field.value, field.id)}
                >
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    {field.label}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-foreground break-all font-medium">{field.value}</p>
                    {copiedField === field.id ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* NAYE API FIELDS YAHAN ADD KIYE - Tumhara original design maintain kiya */}
        <Card className="border border-border bg-card">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base font-bold text-foreground tracking-tight">
              Event & Flyer Details (API Data)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: "Presenting", value: selectedOrder.presenting || "N/A", id: "presenting" },
                { label: "Event Title", value: selectedOrder.event_title || "N/A", id: "event_title" },
                { label: "Event Date & Time", value: formatDate(selectedOrder.event_date), id: "event_date" },
                { label: "Flyer Info/Text", value: selectedOrder.flyer_info || "N/A", id: "flyer_info" },
                { label: "Address / Phone", value: selectedOrder.address_phone || "N/A", id: "address_phone" },
                { label: "Custom Notes", value: selectedOrder.custom_notes || "No notes", id: "custom_notes" },
                { label: "Flyer Type", value: selectedOrder.flyer_is === 1 ? "Static Flyer" : "Animated/Other", id: "flyer_is" },
              ].map((field) => (
                <div
                  key={field.id}
                  className="p-3 bg-secondary border border-border rounded hover:border-primary/50 transition-all group cursor-copy"
                  onClick={() => copyToClipboard(field.value, field.id)}
                >
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    {field.label}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-foreground break-all font-medium">{field.value}</p>
                    {copiedField === field.id ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />}
                  </div>
                </div>
              ))}
            </div>

            {/* DJs */}
            {selectedOrder.djs && selectedOrder.djs.length > 0 && (
              <div className="mt-8 border-t border-border pt-6">
                <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                  DJ LINEUP
                  <span className="text-xs font-normal text-muted-foreground">({selectedOrder.djs.length})</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {selectedOrder.djs.map((dj, i) => {
                    let djName = 'Unknown DJ';
                    if (typeof dj === 'string') {
                      djName = dj || 'Unknown DJ';
                    } else if (typeof dj === 'object' && dj !== null && 'name' in dj) {
                      const nameValue = dj.name;
                      if (typeof nameValue === 'string') {
                        djName = nameValue || 'Unknown DJ';
                      } else if (typeof nameValue === 'object' && nameValue !== null && 'name' in nameValue) {
                        const innerName = typeof nameValue.name === 'string' ? nameValue.name : String(nameValue.name);
                        djName = innerName || 'Unknown DJ';
                      } else if (typeof nameValue === 'object' && nameValue !== null) {
                        djName = JSON.stringify(nameValue);
                      } else {
                        djName = String(nameValue) || 'Unknown DJ';
                      }
                    }

                    const djImage = typeof dj === 'object' && dj !== null && 'image' in dj && typeof dj.image === 'string'
                      ? dj.image
                      : null;

                    return (
                      <div key={i} className="group relative bg-secondary/30 border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all">
                        {djImage ? (
                          <div className="aspect-square w-full relative bg-black/5">
                            <img src={djImage} alt={djName} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                onClick={() => window.open(djImage, '_blank')}
                                className="p-2 bg-white text-black rounded-full hover:bg-white/90 transition-colors"
                                title="View Image"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
                              </button>
                              <button
                                onClick={() => forceDownload(djImage!, `${djName.replace(/\s+/g, '_')}.jpg`)}
                                className="p-2 bg-white text-black rounded-full hover:bg-white/90 transition-colors"
                                title="Download Image"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-square w-full flex items-center justify-center bg-secondary text-muted-foreground">
                            <span className="text-2xl font-bold opacity-20">DJ</span>
                          </div>
                        )}
                        <div className="p-3">
                          <p className="font-semibold text-sm truncate" title={djName}>{djName}</p>
                          {djImage && (
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => window.open(djImage, '_blank')}
                                className="flex-1 text-xs bg-secondary hover:bg-secondary/80 text-foreground py-1.5 rounded flex items-center justify-center gap-1 font-medium transition-colors"
                              >
                                View
                              </button>
                              <button
                                onClick={() => forceDownload(djImage!, `${djName.replace(/\s+/g, '_')}.jpg`)}
                                className="flex-1 text-xs bg-primary/10 hover:bg-primary/20 text-primary py-1.5 rounded flex items-center justify-center gap-1 font-medium transition-colors"
                              >
                                Download
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sponsors */}
            {selectedOrder.sponsors && selectedOrder.sponsors.length > 0 && (
              <div className="mt-8 border-t border-border pt-6">
                <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                  SPONSORS
                  <span className="text-xs font-normal text-muted-foreground">({selectedOrder.sponsors.length})</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {selectedOrder.sponsors.map((s, i) => {
                    let sponsorName = 'Unknown Sponsor';
                    if (typeof s === 'string') {
                      sponsorName = s || 'Unknown Sponsor';
                    } else if (typeof s === 'object' && s !== null && 'name' in s) {
                      const nameValue = s.name;
                      if (typeof nameValue === 'string') {
                        sponsorName = nameValue || 'Unknown Sponsor';
                      } else if (typeof nameValue === 'object' && nameValue !== null && 'name' in nameValue) {
                        const innerName = typeof nameValue.name === 'string' ? nameValue.name : String(nameValue.name);
                        sponsorName = innerName || 'Unknown Sponsor';
                      } else if (typeof nameValue === 'object' && nameValue !== null) {
                        sponsorName = JSON.stringify(nameValue);
                      } else {
                        sponsorName = String(nameValue) || 'Unknown Sponsor';
                      }
                    }

                    const sponsorImage = typeof s === 'object' && s !== null && 'image' in s && typeof s.image === 'string'
                      ? s.image
                      : null;

                    return (
                      <div key={i} className="group relative bg-secondary/30 border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all">
                        {sponsorImage ? (
                          <div className="aspect-square w-full relative bg-white p-2 flex items-center justify-center">
                            <img src={sponsorImage} alt={sponsorName} className="max-w-full max-h-full object-contain" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                onClick={() => window.open(sponsorImage, '_blank')}
                                className="p-2 bg-white text-black rounded-full hover:bg-white/90 transition-colors"
                                title="View Image"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
                              </button>
                              <button
                                onClick={() => forceDownload(sponsorImage!, `${sponsorName.replace(/\s+/g, '_')}.jpg`)}
                                className="p-2 bg-white text-black rounded-full hover:bg-white/90 transition-colors"
                                title="Download Image"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-square w-full flex items-center justify-center bg-secondary text-muted-foreground">
                            <span className="text-lg font-bold opacity-20">SPON</span>
                          </div>
                        )}
                        <div className="p-3">
                          <p className="font-semibold text-sm truncate" title={sponsorName}>{sponsorName}</p>
                          {sponsorImage && (
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => window.open(sponsorImage, '_blank')}
                                className="flex-1 text-xs bg-secondary hover:bg-secondary/80 text-foreground py-1.5 rounded flex items-center justify-center gap-1 font-medium transition-colors"
                              >
                                View
                              </button>
                              <button
                                onClick={() => forceDownload(sponsorImage!, `${sponsorName.replace(/\s+/g, '_')}.jpg`)}
                                className="flex-1 text-xs bg-primary/10 hover:bg-primary/20 text-primary py-1.5 rounded flex items-center justify-center gap-1 font-medium transition-colors"
                              >
                                Download
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Host */}
            {selectedOrder.host && typeof selectedOrder.host === 'object' && Object.keys(selectedOrder.host).length > 0 && (
              <div className="mt-8 border-t border-border pt-6">
                <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                  HOST
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(() => {
                    let hostName = 'N/A';
                    if ('name' in selectedOrder.host) {
                      const nameValue = selectedOrder.host.name;
                      hostName = typeof nameValue === 'string' ? nameValue :
                        typeof nameValue === 'object' && nameValue !== null ? JSON.stringify(nameValue) :
                          String(nameValue);
                    } else {
                      hostName = JSON.stringify(selectedOrder.host);
                    }

                    const hostImage = 'image' in selectedOrder.host && typeof selectedOrder.host.image === 'string'
                      ? selectedOrder.host.image
                      : null;

                    return (
                      <div className="group relative bg-secondary/30 border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all">
                        {hostImage ? (
                          <div className="aspect-square w-full relative bg-black/5">
                            <img src={hostImage} alt={hostName} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                onClick={() => window.open(hostImage, '_blank')}
                                className="p-2 bg-white text-black rounded-full hover:bg-white/90 transition-colors"
                                title="View Image"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
                              </button>
                              <button
                                onClick={() => forceDownload(hostImage!, `${hostName.replace(/\s+/g, '_')}.jpg`)}
                                className="p-2 bg-white text-black rounded-full hover:bg-white/90 transition-colors"
                                title="Download Image"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-square w-full flex items-center justify-center bg-secondary text-muted-foreground">
                            <span className="text-2xl font-bold opacity-20">HOST</span>
                          </div>
                        )}
                        <div className="p-3">
                          <p className="font-semibold text-sm truncate" title={hostName}>{hostName}</p>
                          {hostImage && (
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => window.open(hostImage, '_blank')}
                                className="flex-1 text-xs bg-secondary hover:bg-secondary/80 text-foreground py-1.5 rounded flex items-center justify-center gap-1 font-medium transition-colors"
                              >
                                View
                              </button>
                              <button
                                onClick={() => forceDownload(hostImage!, `${hostName.replace(/\s+/g, '_')}.jpg`)}
                                className="flex-1 text-xs bg-primary/10 hover:bg-primary/20 text-primary py-1.5 rounded flex items-center justify-center gap-1 font-medium transition-colors"
                              >
                                Download
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Ordered Flyer Template */}
            <div className="mt-8 border-t border-border pt-6">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2 uppercase">
                Ordered Flyer Template
                {flyerStore.loading && <span className="text-xs font-normal text-muted-foreground">(Loading...)</span>}
              </h3>
              <div className="max-w-xs">
                {orderedFlyer ? (
                  <div className="group relative bg-secondary/30 border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all">
                    <div className="aspect-[3/4] w-full relative bg-black/5">
                      <img
                        src={orderedFlyer.image}
                        alt={orderedFlyer.fileNameOriginal || orderedFlyer.title}
                        title={orderedFlyer.fileNameOriginal || orderedFlyer.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => window.open(orderedFlyer.image, '_blank')}
                          className="p-2 bg-white text-black rounded-full hover:bg-white/90 transition-colors"
                          title="View Original Flyer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
                        </button>
                        <button
                          onClick={() => forceDownload(orderedFlyer.image, orderedFlyer.fileNameOriginal || `${orderedFlyer.title.replace(/\s+/g, '_')}.jpg`)}
                          className="p-2 bg-white text-black rounded-full hover:bg-white/90 transition-colors"
                          title="Download Template"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-sm truncate" title={orderedFlyer.title}>{orderedFlyer.title}</p>
                      {orderedFlyer.fileNameOriginal && (
                        <p className="text-[11px] text-muted-foreground truncate font-mono mt-0.5">
                          {orderedFlyer.fileNameOriginal}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">ID: {orderedFlyer.id}</p>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[3/4] w-full flex flex-col items-center justify-center bg-secondary border border-dashed border-border rounded-lg text-muted-foreground">
                    <span className="text-xs font-medium">{flyerStore.loading ? "Loading flyer..." : "Flyer template not found"}</span>
                    {!flyerStore.loading && <span className="text-[10px] mt-1 opacity-50">ID: {selectedOrder.flyer_is}</span>}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tumhara original Flyers section with countdown */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-foreground tracking-tight uppercase">
            Flyer Delivery Status
          </h2>
          <Card className="border bg-card">
            <CardHeader className="border-b border-border pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Flyer #1</h3>
                  <p className="text-xs text-muted-foreground mt-1">{selectedOrder.event_title}</p>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">{getDeliveryLabel()}</span>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-secondary border border-border rounded">
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Countdown</p>
                  <p className="font-mono font-bold text-lg text-foreground">{calculateRemainingTime()}</p>
                </div>
              </div>

              <div className="border-t border-border/30 pt-5 flex gap-2">
                <input
                  type="file"
                  id="flyer-upload"
                  className="hidden"
                  accept="image/*,.pdf,.zip"
                  onChange={handleFileUpload}
                />
                <Button
                  variant="outline"
                  className="flex-1 bg-secondary border-border text-foreground hover:bg-secondary/80 font-semibold h-9 gap-2 text-sm transition-all"
                  onClick={() => document.getElementById('flyer-upload')?.click()}
                >
                  <Upload className="w-3.5 h-3.5" /> {uploadedFile ? uploadedFile.name : 'Upload'}
                </Button>
                <Button
                  className="flex-1 bg-[#E50914] text-white hover:bg-[#E50914]/90 active:bg-[#E50914] font-semibold h-9 gap-2 text-sm transition-all"
                  onClick={() => ordersStore.updateOrderStatus(selectedOrder.id, 'completed')}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                </Button>
                <Button
                  className="flex-1 bg-[#E50914] text-white hover:bg-[#E50914] active:bg-[#E50914] font-semibold h-9 gap-2 text-sm transition-none"
                  onClick={handleSendFile}
                  disabled={isSending}
                >
                  <Send className="w-3.5 h-3.5" /> {isSending ? "Sending..." : "Send"}
                </Button>
                <Button
                  className="flex-1 bg-[#E50914] text-white hover:bg-red-700 active:bg-[#E50914] font-semibold h-9 gap-2 text-sm transition-all"
                  onClick={handleNotifyCustomer}
                  disabled={isNotifying}
                >
                  <Send className="w-3.5 h-3.5 rotate-[-45deg]" /> {isNotifying ? "Notifying..." : "Notify via Email"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Uploaded Files Section */}
        {orderFiles.length > 0 && (
          <Card className="border border-border bg-card">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-base font-bold text-foreground tracking-tight">
                Uploaded Files ({orderFiles.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {orderFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-secondary border border-border rounded group">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-foreground truncate max-w-[200px] md:max-w-md">
                        {file.original_name}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(file.created_at).toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={() => forceDownload(file.file_url, file.original_name)}
                      className="flex items-center gap-2 text-primary hover:underline text-sm font-semibold h-fit"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Admin Notes */}
        <Card className="border border-border bg-card">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base font-bold text-foreground tracking-tight">Custom Notes</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-3">
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add internal notes..."
              className="w-full p-3 bg-secondary border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 min-h-24 resize-none text-sm font-medium"
            />
            <Button className="font-semibold h-9 text-sm bg-[#E50914] text-white transition-none hover:bg-[#E50914] active:bg-[#E50914]">
              Save Notes
            </Button>
          </CardContent>
        </Card>

        <Button
          variant="outline"
          className="bg-secondary border-border text-foreground hover:bg-secondary/80 font-semibold h-9 gap-2 text-sm transition-all"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Button>
      </div>
    </div>
  );
});