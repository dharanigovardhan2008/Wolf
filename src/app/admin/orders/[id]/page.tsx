import { notFound } from "next/navigation";
import { db } from "@/db";
import { orders, orderItems, orderStatusHistory, productImages } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { TrackingForm } from "@/components/admin/TrackingForm";

export const metadata: Metadata = { title: "Order Detail — Wolf Theory Admin" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;

  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order) notFound();

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
  
  const allImages = await db.select().from(productImages);
  
  // ✅ Simplified: just get primary or first image for product
  const getItemImage = (productId: string | null): string | undefined => {
    if (!productId) return undefined;
    
    const primaryImage = allImages.find(
      (img) => img.productId === productId && img.isPrimary
    );
    if (primaryImage) return primaryImage.url;
    
    const anyImage = allImages.find((img) => img.productId === productId);
    return anyImage?.url;
  };

  const history = await db
    .select()
    .from(orderStatusHistory)
    .where(eq(orderStatusHistory.orderId, id))
    .orderBy(desc(orderStatusHistory.createdAt));

  const statusStyles: Record<string, string> = {
    NEW: "bg-amber-50 text-amber-700 border-amber-200",
    CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
    PROCESSING: "bg-indigo-50 text-indigo-700 border-indigo-200",
    CUSTOMIZATION_REVIEW: "bg-purple-50 text-purple-700 border-purple-200",
    PRINTING: "bg-violet-50 text-violet-700 border-violet-200",
    QUALITY_CHECK: "bg-cyan-50 text-cyan-700 border-cyan-200",
    PACKED: "bg-teal-50 text-teal-700 border-teal-200",
    SHIPPED: "bg-blue-50 text-blue-700 border-blue-200",
    DELIVERED: "bg-green-50 text-green-700 border-green-200",
    CANCELLED: "bg-red-50 text-red-700 border-red-200",
    REFUNDED: "bg-orange-50 text-orange-700 border-orange-200",
  };

  const statusDotColors: Record<string, string> = {
    NEW: "bg-amber-500",
    CONFIRMED: "bg-blue-500",
    PROCESSING: "bg-indigo-500",
    CUSTOMIZATION_REVIEW: "bg-purple-500",
    PRINTING: "bg-violet-500",
    QUALITY_CHECK: "bg-cyan-500",
    PACKED: "bg-teal-500",
    SHIPPED: "bg-blue-600",
    DELIVERED: "bg-green-500",
    CANCELLED: "bg-red-500",
    REFUNDED: "bg-orange-500",
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/admin/orders" 
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Orders
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2 font-mono">{order.orderNumber}</h1>
              <p className="text-sm text-gray-500">
                Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </p>
            </div>
            <span 
              className={`inline-flex items-center rounded-full border px-4 py-2 text-xs font-semibold ${
                statusStyles[order.status] ?? "bg-gray-100 text-gray-600 border-gray-200"
              }`}
            >
              {order.status}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <h2 className="text-lg font-bold text-black mb-4">Order Items</h2>
              <div className="space-y-3">
                {items.map((item) => {
                  const imageUrl = getItemImage(item.productId);
                  
                  return (
                    <div 
                      key={item.id} 
                      className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-black/5 hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-16 h-16 rounded-xl shrink-0 border border-black/10 bg-gray-100 overflow-hidden relative">
                        {imageUrl ? (
                          <Image 
                            src={imageUrl} 
                            alt={item.productName}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <div 
                            className="w-full h-full" 
                            style={{ backgroundColor: item.colorHex }}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-black mb-1">{item.productName}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: item.colorHex }} />
                            {item.colorName}
                          </span>
                          <span>•</span>
                          <span>Size {item.sizeName}</span>
                          {item.isCustomized && (
                            <>
                              <span>•</span>
                              <span className="text-indigo-600 font-semibold">Customized</span>
                            </>
                          )}
                        </div>
                        {item.fabricName && (
                          <p className="text-xs text-gray-500 mt-1">{item.fabricName}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-black">{formatPrice(parseFloat(item.totalPrice))}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        <p className="text-xs text-gray-400">{formatPrice(parseFloat(item.unitPrice))} each</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Totals */}
              <div className="mt-6 pt-6 border-t border-black/5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-black">{formatPrice(parseFloat(order.subtotal))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-black">{formatPrice(parseFloat(order.shippingCost))}</span>
                </div>
                {parseFloat(order.discount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium text-green-600">-{formatPrice(parseFloat(order.discount))}</span>
                  </div>
                )}
                {parseFloat(order.tax) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium text-black">{formatPrice(parseFloat(order.tax))}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold pt-3 border-t border-black/5">
                  <span className="text-black">Total</span>
                  <span className="text-black">{formatPrice(parseFloat(order.total))}</span>
                </div>
              </div>
            </div>

            {/* Tracking Information */}
            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <h2 className="text-lg font-bold text-black mb-4">Shipping Tracking</h2>
              <TrackingForm 
                orderId={order.id}
                initialTrackingUrl={order.trackingUrl ?? undefined}
                initialTrackingNumber={order.trackingNumber ?? undefined}
                initialCourierName={order.courierName ?? undefined}
              />
            </div>

            {/* Status History */}
            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <h2 className="text-lg font-bold text-black mb-4">Status History</h2>
              {history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((h, index) => (
                    <div key={h.id} className="flex gap-4 relative">
                      {index !== history.length - 1 && (
                        <div className="absolute left-2 top-8 bottom-0 w-px bg-black/5" />
                      )}
                      <div className={`w-4 h-4 rounded-full mt-1 shrink-0 z-10 ${
                        statusDotColors[h.status] ?? "bg-gray-400"
                      }`} />
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-3 mb-1">
                          <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                            statusStyles[h.status] ?? "bg-gray-100 text-gray-600 border-gray-200"
                          }`}>
                            {h.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(h.createdAt).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>
                        {h.note && (
                          <p className="text-sm text-gray-600 mt-2">{h.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No status updates yet</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <h2 className="text-sm font-bold text-black mb-4">Customer</h2>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-black">{order.shippingName}</p>
                <p className="text-sm text-gray-600">{order.shippingEmail}</p>
                <p className="text-sm text-gray-600">{order.shippingPhone}</p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <h2 className="text-sm font-bold text-black mb-4">Shipping Address</h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-1">
                <p>{order.shippingAddress}</p>
                <p>{order.shippingCity}, {order.shippingState} {order.shippingPincode}</p>
                <p className="font-medium">{order.shippingCountry}</p>
              </div>
            </div>

            {/* Company Details (if provided) */}
            {(order.companyName || order.gstNumber) && (
              <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                <h2 className="text-sm font-bold text-black mb-4">Business Details</h2>
                <div className="space-y-2">
                  {order.companyName && (
                    <div>
                      <p className="text-xs text-gray-500">Company</p>
                      <p className="text-sm text-gray-900">{order.companyName}</p>
                    </div>
                  )}
                  {order.gstNumber && (
                    <div>
                      <p className="text-xs text-gray-500">GST Number</p>
                      <p className="text-sm font-mono text-gray-900">{order.gstNumber}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Details */}
            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <h2 className="text-sm font-bold text-black mb-4">Payment</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Payment Status</p>
                  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                    order.paymentStatus === "CAPTURED" 
                      ? "bg-green-50 text-green-700 border-green-200"
                      : order.paymentStatus === "PENDING"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : order.paymentStatus === "AUTHORIZED"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}>
                    {order.paymentStatus}
                  </span>
                </div>
                {order.paymentGateway && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Payment Gateway</p>
                    <p className="text-sm text-gray-900 capitalize">{order.paymentGateway}</p>
                  </div>
                )}
                {order.paymentId && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Transaction ID</p>
                    <p className="text-xs font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded border border-black/5 break-all">
                      {order.paymentId}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Notes */}
            {order.notes && (
              <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                <h2 className="text-sm font-bold text-black mb-4">Order Notes</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{order.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}