import { db } from '@/db';
import { products, productImages, productVariants, colors, sizes, orderItems } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function InventoryPage() {
  let productsData: any[] = [];
  let errorMessage = '';

  try {
    const allProducts = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.basePrice,
        category: products.category,
      })
      .from(products)
      .orderBy(desc(products.createdAt));

    for (const product of allProducts) {
      try {
        // Get primary image
        let imageUrl = null;
        try {
          const images = await db
            .select({ url: productImages.url, isPrimary: productImages.isPrimary })
            .from(productImages)
            .where(eq(productImages.productId, product.id));
          
          const primaryImg = images.find(img => img.isPrimary === true);
          imageUrl = primaryImg ? primaryImg.url : (images[0] ? images[0].url : null);
        } catch {
          imageUrl = null;
        }

        // Get variants - FIXED: using reservedStock instead of reserved
        let variantsArray: any[] = [];
        let totalStock = 0;
        let availableStock = 0;

        try {
          const variants = await db
            .select({
              id: productVariants.id,
              stock: productVariants.stock,
              reservedStock: productVariants.reservedStock,  // ✓ Fixed
              isAvailable: productVariants.isAvailable,
              colorName: colors.name,
              colorHex: colors.hexCode,
              sizeName: sizes.name,
            })
            .from(productVariants)
            .leftJoin(colors, eq(productVariants.colorId, colors.id))
            .leftJoin(sizes, eq(productVariants.sizeId, sizes.id))
            .where(eq(productVariants.productId, product.id));

          if (variants && variants.length > 0) {
            for (const v of variants) {
              const stock = Number(v.stock) || 0;
              const reserved = Number(v.reservedStock) || 0;  // ✓ Fixed
              const isAvailable = v.isAvailable === true;

              totalStock = totalStock + stock;
              if (isAvailable) {
                const available = stock - reserved;
                availableStock = availableStock + (available > 0 ? available : 0);
              }

              variantsArray.push({
                id: String(v.id),
                colorName: String(v.colorName || 'Unknown'),
                colorHex: String(v.colorHex || '#000000'),
                sizeName: String(v.sizeName || 'Unknown'),
                stock: stock,
                reserved: reserved,
                isAvailable: isAvailable,
              });
            }
          }
        } catch {
          variantsArray = [];
        }

        // Get sales
        let revenue = 0;
        let unitsSold = 0;
        let orders = 0;

        try {
          const sales = await db
            .select()
            .from(orderItems)
            .where(eq(orderItems.productId, product.id));

          if (sales && sales.length > 0) {
            const orderIds: string[] = [];
            for (const sale of sales) {
              revenue = revenue + (Number(sale.totalPrice) || 0);
              unitsSold = unitsSold + (Number(sale.quantity) || 0);
              const orderId = String(sale.orderId);
              if (orderId && orderIds.indexOf(orderId) === -1) {
                orderIds.push(orderId);
              }
            }
            orders = orderIds.length;
          }
        } catch {
          revenue = 0;
          unitsSold = 0;
          orders = 0;
        }

        productsData.push({
          id: String(product.id),
          name: String(product.name),
          slug: String(product.slug),
          price: String(product.price),
          category: String(product.category),
          image: imageUrl,
          variants: variantsArray,
          totalStock: totalStock,
          availableStock: availableStock,
          revenue: revenue,
          unitsSold: unitsSold,
          orders: orders,
        });
      } catch {
        continue;
      }
    }
  } catch {
    errorMessage = 'Database connection error';
  }

  // Calculate stats
  let totalRevenue = 0;
  let totalOrders = 0;
  let outOfStock = 0;
  let lowStock = 0;

  for (const p of productsData) {
    totalRevenue = totalRevenue + p.revenue;
    totalOrders = totalOrders + p.orders;
    if (p.totalStock === 0) {
      outOfStock = outOfStock + 1;
    } else if (p.totalStock <= 10) {
      lowStock = lowStock + 1;
    }
  }

  const stats = {
    totalProducts: productsData.length,
    totalRevenue: totalRevenue,
    totalOrders: totalOrders,
    outOfStock: outOfStock,
    lowStock: lowStock,
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Inventory Management
          </h1>
          <p className="text-gray-600">
            Monitor stock levels, sales performance, and product availability
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-800">
            {errorMessage}
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="text-sm font-medium text-gray-600 mb-1">
              Total Products
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.totalProducts}
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="text-sm font-medium text-gray-600 mb-1">
              Total Revenue
            </div>
            <div className="text-3xl font-bold text-gray-900">
              ${stats.totalRevenue.toFixed(2)}
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="text-sm font-medium text-gray-600 mb-1">
              Total Orders
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.totalOrders}
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="text-sm font-medium text-gray-600 mb-1">
              Low Stock
            </div>
            <div className="text-3xl font-bold text-amber-600">
              {stats.lowStock}
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="text-sm font-medium text-gray-600 mb-1">
              Out of Stock
            </div>
            <div className="text-3xl font-bold text-red-600">
              {stats.outOfStock}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {productsData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {productsData.map((product) => {
              const stockStatus =
                product.totalStock === 0
                  ? 'out'
                  : product.totalStock <= 10
                  ? 'low'
                  : 'ok';

              return (
                <div
                  key={product.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200"
                >
                  {/* Product Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-start gap-4">
                      {/* Product Image */}
                      <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg
                              className="w-10 h-10"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {product.name}
                            </h3>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm text-gray-600">
                                {product.category}
                              </span>
                              <span className="text-gray-400">&#8226;</span>
                              <span className="text-sm font-medium text-gray-900">
                                ${product.price}
                              </span>
                            </div>
                          </div>
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex-shrink-0"
                          >
                            Edit
                          </Link>
                        </div>

                        {/* Stock Status Badge */}
                        {stockStatus === 'out' && (
                          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Out of Stock
                          </div>
                        )}
                        {stockStatus === 'low' && (
                          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            Low Stock
                          </div>
                        )}
                        {stockStatus === 'ok' && (
                          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            In Stock
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 divide-x divide-gray-200 bg-gray-50">
                    <div className="px-4 py-3 text-center">
                      <div className="text-xs font-medium text-gray-600 mb-1">
                        Total Stock
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {product.totalStock}
                      </div>
                    </div>
                    <div className="px-4 py-3 text-center">
                      <div className="text-xs font-medium text-gray-600 mb-1">
                        Available
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {product.availableStock}
                      </div>
                    </div>
                    <div className="px-4 py-3 text-center">
                      <div className="text-xs font-medium text-gray-600 mb-1">
                        Revenue
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        ${product.revenue.toFixed(0)}
                      </div>
                    </div>
                    <div className="px-4 py-3 text-center">
                      <div className="text-xs font-medium text-gray-600 mb-1">
                        Orders
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {product.orders}
                      </div>
                    </div>
                  </div>

                  {/* Variants Table */}
                  <div className="p-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      Variant Stock Levels
                    </h4>
                    {product.variants.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                Color
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                Size
                              </th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                                Stock
                              </th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                                Reserved
                              </th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {product.variants.map((variant: any) => {
                              const variantStatus =
                                variant.stock === 0
                                  ? 'out'
                                  : variant.stock <= 5
                                  ? 'low'
                                  : 'ok';

                              return (
                                <tr key={variant.id} className="hover:bg-gray-50">
                                  <td className="px-3 py-3 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="w-4 h-4 rounded-full border border-gray-300"
                                        style={{
                                          backgroundColor: variant.colorHex,
                                        }}
                                      />
                                      <span className="text-sm text-gray-900">
                                        {variant.colorName}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-3 py-3 whitespace-nowrap">
                                    <span className="text-sm font-medium text-gray-900">
                                      {variant.sizeName}
                                    </span>
                                  </td>
                                  <td className="px-3 py-3 whitespace-nowrap text-center">
                                    <span className="text-sm font-semibold text-gray-900">
                                      {variant.stock}
                                    </span>
                                  </td>
                                  <td className="px-3 py-3 whitespace-nowrap text-center">
                                    <span className="text-sm text-gray-600">
                                      {variant.reserved}
                                    </span>
                                  </td>
                                  <td className="px-3 py-3 whitespace-nowrap text-center">
                                    {variantStatus === 'out' && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                        Out
                                      </span>
                                    )}
                                    {variantStatus === 'low' && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                        Low
                                      </span>
                                    )}
                                    {variantStatus === 'ok' && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                        OK
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No variants available
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {productsData.length === 0 && !errorMessage && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first product.
            </p>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 transition-colors"
            >
              Create Product
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}