"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Package, Truck, MapPin, CreditCard, Loader2, ExternalLink } from "lucide-react";

interface OrderItem {
  id: string;
  quantity: number;
  price: string;
  subtotal: string;
  customizationText: string | null;
  customizationFont: string | null;
  customizationColor: string | null;
  productName: string;
  productSlug: string | null;
  colorName: string | null;
  colorCode: string | null;
  sizeName: string | null;
  imageUrl: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: string;
  discount: string | null;
  shippingCost: string;
  tax: string;
  total: string;
  shippingName: string;
  shippingEmail: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  shippingCountry: string;
  trackingUrl: string | null;
  trackingNumber: string | null;
  courierName: string | null;
  createdAt: string;
}

interface OrderDetailClientProps {
  orderId: string;
}

export default function OrderDetailClient({ orderId }: OrderDetailClientProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/my-orders");
    } else if (status === "authenticated" && session?.user?.email) {
      fetchOrderDetails();
    }
  }, [orderId, session, status, router]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/my-orders/${orderId}?email=${encodeURIComponent(session!.user!.email!)}`);

      if (response.status === 404) {
        router.push("/my-orders");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch order details");
      }

      const data = await response.json();
      setOrder(data.order);
      setItems(data.items);
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      NEW: "bg-amber-50 text-amber-700 border-amber-200",
      CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
      PROCESSING: "bg-indigo-50 text-indigo-700 border-indigo-200",
      CUSTOMIZATION_REVIEW: "bg-purple-50 text-purple-700 border-purple-200",
      PRINTING: "bg-violet-50 text-violet-700 border-violet-200",
      QUALITY_CHECK: "bg-cyan-50 text-cyan-700 border-cyan-200",
      PACKED: "bg-teal-50 text-teal-700 border-teal-200",
      SHIPPED: "bg-purple-50 text-purple-700 border-purple-200",
      DELIVERED: "bg-green-50 text-green-700 border-green-200",
      CANCELLED: "bg-red-50 text-red-700 border-red-200",
      REFUNDED: "bg-orange-50 text-orange-700 border-orange-200",
    };
    return colors[status] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-amber-50 text-amber-700 border-amber-200",
      AUTHORIZED: "bg-blue-50 text-blue-700 border-blue-200",
      CAPTURED: "bg-green-50 text-green-700 border-green-200",
      FAILED: "bg-red-50 text-red-700 border-red-200",
      REFUNDED: "bg-orange-50 text-orange-700 border-orange-200",
      PARTIALLY_REFUNDED: "bg-yellow-50 text-yellow-700 border-yellow-200",
    };
    return colors[status] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (amount: string | number | null) => {
    if (!amount) return "₹0.00";
    return `₹${Number(amount).toFixed(2)}`;
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Order not found"}</p>
          <Link
            href="/my-orders"
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/my-orders"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Order #{order.orderNumber}
              </h1>
              <p className="text-gray-600 mt-1">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status}
              </span>
              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
                >
                  <Truck className="w-4 h-4" />
                  Track Shipment
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Items ({items.length})
                </h2>
              </div>

              <div className="divide-y divide-gray-100">
                {items.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No items found in this order
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.productName}
                              width={80}
                              height={80}
                              className="rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Package className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {item.productName}
                          </h3>

                          <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-2">
                            {item.colorName && (
                              <div className="flex items-center gap-1.5">
                                <div
                                  className="w-4 h-4 rounded-full border border-gray-300"
                                  style={{ backgroundColor: item.colorCode || "#ccc" }}
                                />
                                {item.colorName}
                              </div>
                            )}
                            {item.sizeName && (
                              <span className="px-2 py-0.5 bg-gray-100 rounded">
                                Size: {item.sizeName}
                              </span>
                            )}
                            <span>Qty: {item.quantity}</span>
                          </div>

                          {item.customizationText && (
                            <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                              <p className="text-sm font-medium text-blue-900 mb-1">
                                Customization
                              </p>
                              <p className="text-sm text-blue-700">
                                Text: {item.customizationText}
                              </p>
                              {item.customizationFont && (
                                <p className="text-sm text-blue-700">
                                  Font: {item.customizationFont}
                                </p>
                              )}
                              {item.customizationColor && (
                                <p className="text-sm text-blue-700">
                                  Color: {item.customizationColor}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatPrice(item.subtotal)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatPrice(item.price)} each
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Tracking Information */}
            {(order.trackingNumber || order.courierName || order.trackingUrl) && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Tracking Information
                </h2>

                <div className="space-y-3">
                  {order.courierName && (
                    <div>
                      <p className="text-sm text-gray-600">Courier</p>
                      <p className="font-medium text-gray-900">{order.courierName}</p>
                    </div>
                  )}
                  {order.trackingNumber && (
                    <div>
                      <p className="text-sm text-gray-600">Tracking Number</p>
                      <p className="font-medium text-gray-900 font-mono">
                        {order.trackingNumber}
                      </p>
                    </div>
                  )}
                  {order.trackingUrl && (
                    <div>
                      <a
                        href={order.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View Tracking Details
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-4 pb-4 border-b border-gray-100">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount && parseFloat(order.discount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{formatPrice(order.shippingCost)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>{formatPrice(order.tax)}</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>

            {/* Payment Status */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment
              </h2>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span
                    className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium border ${getPaymentStatusColor(
                      order.paymentStatus
                    )}`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Method</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {order.paymentMethod}
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Shipping Address
              </h2>

              <div className="text-gray-700 space-y-1">
                <p className="font-medium">{order.shippingName}</p>
                <p>{order.shippingAddress}</p>
                <p>
                  {order.shippingCity}, {order.shippingState} {order.shippingPincode}
                </p>
                <p>{order.shippingCountry}</p>
                <p className="mt-2 text-gray-600">{order.shippingPhone}</p>
                <p className="text-gray-600">{order.shippingEmail}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}