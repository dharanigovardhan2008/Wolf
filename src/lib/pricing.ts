import { db } from "@/db";
import { storeSettings } from "@/db/schema";

interface CartItemInput {
  basePrice: number;
  priceAdjustment: number;
  customizationPrice: number;
  hasCustomization: boolean;
  hasFrontPrint: boolean;
  hasBackPrint: boolean;
  quantity: number;
}

interface PriceBreakdown {
  items: Array<{
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
}

export async function calculateOrderPrice(
  items: CartItemInput[],
  couponDiscount = 0
): Promise<PriceBreakdown> {
  const settings = await getStoreSettings();

  const calculatedItems = items.map((item) => {
    const frontFee = item.hasFrontPrint ? parseFloat(String(settings.frontPrintFee ?? "0")) : 0;
    const backFee = item.hasBackPrint ? parseFloat(String(settings.backPrintFee ?? "0")) : 0;
    const customFee = item.hasCustomization
      ? parseFloat(String(item.customizationPrice))
      : 0;

    const unitPrice =
      item.basePrice + item.priceAdjustment + customFee + frontFee + backFee;
    const totalPrice = unitPrice * item.quantity;

    return { unitPrice, totalPrice };
  });

  const subtotal = calculatedItems.reduce((sum, i) => sum + i.totalPrice, 0);
  const discount = Math.min(couponDiscount, subtotal);

  const freeThreshold = parseFloat(String(settings.freeShippingThreshold ?? "0"));
  const flatRate = parseFloat(String(settings.flatShippingRate ?? "99"));
  const shipping = freeThreshold > 0 && subtotal - discount >= freeThreshold ? 0 : flatRate;

  const gstRate = parseFloat(String(settings.gstRate ?? "0"));
  const tax = gstRate > 0 ? ((subtotal - discount + shipping) * gstRate) / 100 : 0;

  const total = subtotal - discount + shipping + tax;

  return {
    items: calculatedItems,
    subtotal,
    discount,
    shipping,
    tax,
    total,
  };
}

async function getStoreSettings() {
  const [settings] = await db.select().from(storeSettings).limit(1);
  return (
    settings ?? {
      frontPrintFee: "0",
      backPrintFee: "0",
      flatShippingRate: "99",
      freeShippingThreshold: "999",
      gstRate: "0",
    }
  );
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
