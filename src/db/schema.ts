import {
  pgTable,
  text,
  integer,
  boolean,
  decimal,
  timestamp,
  pgEnum,
  json,
  uuid,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const userRoleEnum = pgEnum("user_role", [
  "CUSTOMER",
  "ADMIN",
  "SUPER_ADMIN",
]);

export const productStatusEnum = pgEnum("product_status", [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "NEW",
  "CONFIRMED",
  "PROCESSING",
  "CUSTOMIZATION_REVIEW",
  "PRINTING",
  "QUALITY_CHECK",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "AUTHORIZED",
  "CAPTURED",
  "FAILED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
]);

export const bulkOrderStatusEnum = pgEnum("bulk_order_status", [
  "NEW",
  "CONTACTED",
  "QUOTATION_SENT",
  "NEGOTIATION",
  "CONFIRMED",
  "IN_PRODUCTION",
  "COMPLETED",
  "CANCELLED",
]);

export const couponTypeEnum = pgEnum("coupon_type", [
  "PERCENTAGE",
  "FIXED_AMOUNT",
]);

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    phone: text("phone"),
    role: userRoleEnum("role").notNull().default("CUSTOMER"),
    isActive: boolean("is_active").notNull().default(true),
    emailVerified: timestamp("email_verified"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)]
);

export const usersRelations = relations(users, ({ many, one }) => ({
  addresses: many(addresses),
  orders: many(orders),
  savedDesigns: many(savedDesigns),
  wishlist: one(wishlists),
  cart: one(carts),
}));

// ─── Addresses ────────────────────────────────────────────────────────────────
export const addresses = pgTable(
  "addresses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    label: text("label"),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    addressLine1: text("address_line1").notNull(),
    addressLine2: text("address_line2"),
    city: text("city").notNull(),
    state: text("state").notNull(),
    pincode: text("pincode").notNull(),
    country: text("country").notNull().default("India"),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("addresses_user_id_idx").on(t.userId)]
);

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.id],
  }),
}));

// ─── Colors ───────────────────────────────────────────────────────────────────
export const colors = pgTable("colors", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  hexCode: text("hex_code").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Sizes ────────────────────────────────────────────────────────────────────
export const sizes = pgTable("sizes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Fabrics ──────────────────────────────────────────────────────────────────
export const fabrics = pgTable("fabrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  composition: text("composition"),
  gsm: integer("gsm"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Style Categories ─────────────────────────────────────────────────────────
export const styleCategories = pgTable(
  "style_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    subtitle: text("subtitle"),
    imageUrl: text("image_url"),
    imagePublicId: text("image_public_id"),
    backgroundColor: text("background_color"),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("style_categories_slug_idx").on(t.slug)]
);

// ─── Products ─────────────────────────────────────────────────────────────────
export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description").notNull(),
    shortDescription: text("short_description").notNull(),
    category: text("category").notNull(),
    productType: text("product_type").notNull(),

    basePrice: decimal("base_price", {
      precision: 10,
      scale: 2,
    }).notNull(),

    actualPrice: decimal("actual_price", {
      precision: 10,
      scale: 2,
    }),

    customizationPrice: decimal("customization_price", {
      precision: 10,
      scale: 2,
    })
      .notNull()
      .default("0"),

    fabricId: uuid("fabric_id").references(() => fabrics.id),

    styleCategoryId: uuid("style_category_id").references(
      () => styleCategories.id
    ),

    gsm: integer("gsm"),
    isCustomizable: boolean("is_customizable").notNull().default(true),
    isFeatured: boolean("is_featured").notNull().default(false),
    showInHero: boolean("show_in_hero").notNull().default(false),
    heroOrder: integer("hero_order"),

    status: productStatusEnum("status").notNull().default("DRAFT"),

    model3dUrl: text("model_3d_url"),
    printAreaConfig: json("print_area_config"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),

    isArchived: boolean("is_archived").notNull().default(false),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("products_slug_idx").on(t.slug),
    index("products_status_idx").on(t.status),
    index("products_featured_idx").on(t.isFeatured),
  ]
);

export const productsRelations = relations(products, ({ many, one }) => ({
  variants: many(productVariants),
  images: many(productImages),

  fabric: one(fabrics, {
    fields: [products.fabricId],
    references: [fabrics.id],
  }),

  styleCategory: one(styleCategories, {
    fields: [products.styleCategoryId],
    references: [styleCategories.id],
  }),

  wishlistItems: many(wishlistItems),
}));

// ─── Style Category Relations ─────────────────────────────────────────────────
export const styleCategoriesRelations = relations(
  styleCategories,
  ({ many }) => ({
    products: many(products),
  })
);

// ─── Product Variants ─────────────────────────────────────────────────────────
export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    sku: text("sku").notNull(),
    colorId: uuid("color_id")
      .notNull()
      .references(() => colors.id),
    sizeId: uuid("size_id")
      .notNull()
      .references(() => sizes.id),
    priceAdjustment: decimal("price_adjustment", {
      precision: 10,
      scale: 2,
    })
      .notNull()
      .default("0"),
    stock: integer("stock").notNull().default(0),
    reservedStock: integer("reserved_stock").notNull().default(0),
    lowStockThreshold: integer("low_stock_threshold").notNull().default(5),
    isAvailable: boolean("is_available").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("variants_sku_idx").on(t.sku),
    index("variants_product_id_idx").on(t.productId),
  ]
);

export const productVariantsRelations = relations(
  productVariants,
  ({ one }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
    color: one(colors, {
      fields: [productVariants.colorId],
      references: [colors.id],
    }),
    size: one(sizes, {
      fields: [productVariants.sizeId],
      references: [sizes.id],
    }),
  })
);

// ─── Product Images ───────────────────────────────────────────────────────────
export const productImages = pgTable(
  "product_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    alt: text("alt").notNull(),
    colorId: uuid("color_id").references(() => colors.id),
    sortOrder: integer("sort_order").notNull().default(0),
    isPrimary: boolean("is_primary").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("images_product_id_idx").on(t.productId),
    index("images_color_id_idx").on(t.colorId),
  ]
);

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
  color: one(colors, {
    fields: [productImages.colorId],
    references: [colors.id],
  }),
}));

// ─── Customizations ───────────────────────────────────────────────────────────
export const customizations = pgTable("customizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  variantId: uuid("variant_id").references(() => productVariants.id),
  color: text("color").notNull(),
  size: text("size").notNull(),
  fabric: text("fabric"),
  frontElements: json("front_elements"),
  frontPreviewUrl: text("front_preview_url"),
  backElements: json("back_elements"),
  backPreviewUrl: text("back_preview_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Saved Designs ────────────────────────────────────────────────────────────
export const savedDesigns = pgTable(
  "saved_designs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull().default("Untitled Design"),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    customizationData: json("customization_data").notNull(),
    frontPreviewUrl: text("front_preview_url"),
    backPreviewUrl: text("back_preview_url"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("saved_designs_user_id_idx").on(t.userId)]
);

export const savedDesignsRelations = relations(savedDesigns, ({ one }) => ({
  user: one(users, {
    fields: [savedDesigns.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [savedDesigns.productId],
    references: [products.id],
  }),
}));

// ─── Carts ───────────────────────────────────────────────────────────────────
export const carts = pgTable(
  "carts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    sessionId: text("session_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("carts_user_id_idx").on(t.userId),
    index("carts_session_id_idx").on(t.sessionId),
  ]
);

export const cartsRelations = relations(carts, ({ many, one }) => ({
  items: many(cartItems),
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
}));

// ─── Cart Items ───────────────────────────────────────────────────────────────
export const cartItems = pgTable(
  "cart_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cartId: uuid("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id),
    quantity: integer("quantity").notNull().default(1),
    customizationId: uuid("customization_id").references(
      () => customizations.id
    ),
    priceSnapshot: decimal("price_snapshot", {
      precision: 10,
      scale: 2,
    }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("cart_items_cart_id_idx").on(t.cartId)]
);

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [cartItems.variantId],
    references: [productVariants.id],
  }),
  customization: one(customizations, {
    fields: [cartItems.customizationId],
    references: [customizations.id],
  }),
}));

// ─── Coupons ──────────────────────────────────────────────────────────────────
export const coupons = pgTable(
  "coupons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull(),
    type: couponTypeEnum("type").notNull(),
    value: decimal("value", {
      precision: 10,
      scale: 2,
    }).notNull(),
    minOrderValue: decimal("min_order_value", {
      precision: 10,
      scale: 2,
    }),
    maxDiscount: decimal("max_discount", {
      precision: 10,
      scale: 2,
    }),
    usageLimit: integer("usage_limit"),
    usedCount: integer("used_count").notNull().default(0),
    validFrom: timestamp("valid_from").notNull(),
    validUntil: timestamp("valid_until").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("coupons_code_idx").on(t.code)]
);

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderNumber: text("order_number").notNull(),
    userId: uuid("user_id").references(() => users.id),
    status: orderStatusEnum("status").notNull().default("NEW"),
    paymentStatus: paymentStatusEnum("payment_status")
      .notNull()
      .default("PENDING"),

    // Shipping
    shippingName: text("shipping_name").notNull(),
    shippingEmail: text("shipping_email").notNull(),
    shippingPhone: text("shipping_phone").notNull(),
    shippingAddress: text("shipping_address").notNull(),
    shippingCity: text("shipping_city").notNull(),
    shippingState: text("shipping_state").notNull(),
    shippingPincode: text("shipping_pincode").notNull(),
    shippingCountry: text("shipping_country").notNull().default("India"),

    // Optional
    gstNumber: text("gst_number"),
    companyName: text("company_name"),
    notes: text("notes"),

    // Pricing
    subtotal: decimal("subtotal", {
      precision: 10,
      scale: 2,
    }).notNull(),
    discount: decimal("discount", {
      precision: 10,
      scale: 2,
    })
      .notNull()
      .default("0"),
    shippingCost: decimal("shipping_cost", {
      precision: 10,
      scale: 2,
    })
      .notNull()
      .default("0"),
    tax: decimal("tax", {
      precision: 10,
      scale: 2,
    })
      .notNull()
      .default("0"),
    total: decimal("total", {
      precision: 10,
      scale: 2,
    }).notNull(),
    couponId: uuid("coupon_id").references(() => coupons.id),

    // Payment
    paymentGateway: text("payment_gateway").default("razorpay"),
    paymentOrderId: text("payment_order_id"),
    paymentId: text("payment_id"),
    paymentSignature: text("payment_signature"),

    // Tracking - UPDATED FIELDS
    trackingNumber: text("tracking_number"),
    trackingUrl: text("tracking_url"),
    courierName: text("courier_name"),
    shippedAt: timestamp("shipped_at"),
    deliveredAt: timestamp("delivered_at"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("orders_number_idx").on(t.orderNumber),
    index("orders_user_id_idx").on(t.userId),
    index("orders_status_idx").on(t.status),
    index("orders_created_at_idx").on(t.createdAt),
  ]
);

export const ordersRelations = relations(orders, ({ many, one }) => ({
  items: many(orderItems),
  statusHistory: many(orderStatusHistory),
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  coupon: one(coupons, {
    fields: [orders.couponId],
    references: [coupons.id],
  }),
}));

// ─── Order Items ──────────────────────────────────────────────────────────────
export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id),
    variantId: uuid("variant_id").references(() => productVariants.id),

    // Snapshots
    productName: text("product_name").notNull(),
    productSlug: text("product_slug").notNull(),
    sku: text("sku").notNull(),
    colorName: text("color_name").notNull(),
    colorHex: text("color_hex").notNull(),
    sizeName: text("size_name").notNull(),
    fabricName: text("fabric_name"),

    quantity: integer("quantity").notNull(),
    unitPrice: decimal("unit_price", {
      precision: 10,
      scale: 2,
    }).notNull(),
    totalPrice: decimal("total_price", {
      precision: 10,
      scale: 2,
    }).notNull(),

    // Customization snapshot
    isCustomized: boolean("is_customized").notNull().default(false),
    customizationData: json("customization_data"),
    frontPreviewUrl: text("front_preview_url"),
    backPreviewUrl: text("back_preview_url"),
    frontPrintFileUrl: text("front_print_file_url"),
    backPrintFileUrl: text("back_print_file_url"),
  },
  (t) => [index("order_items_order_id_idx").on(t.orderId)]
);

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
}));

// ─── Order Status History ─────────────────────────────────────────────────────
export const orderStatusHistory = pgTable(
  "order_status_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    status: orderStatusEnum("status").notNull(),
    note: text("note"),
    updatedBy: uuid("updated_by").references(() => users.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("order_status_history_order_id_idx").on(t.orderId)]
);

export const orderStatusHistoryRelations = relations(
  orderStatusHistory,
  ({ one }) => ({
    order: one(orders, {
      fields: [orderStatusHistory.orderId],
      references: [orders.id],
    }),
  })
);

// ─── Bulk Orders ──────────────────────────────────────────────────────────────
export const bulkOrders = pgTable(
  "bulk_orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderNumber: text("order_number").notNull(),
    status: bulkOrderStatusEnum("status").notNull().default("NEW"),

    // Contact
    name: text("name").notNull(),
    organization: text("organization").notNull(),
    college: text("college"),
    eventName: text("event_name"),
    email: text("email").notNull(),
    phone: text("phone").notNull(),

    // Order details
    quantity: integer("quantity").notNull(),
    tshirtType: text("tshirt_type").notNull(),
    fabricPreference: text("fabric_preference"),
    colors: text("colors").notNull(),
    sizeDistribution: json("size_distribution"),

    // Design
    frontDesignUrl: text("front_design_url"),
    backDesignUrl: text("back_design_url"),
    designDescription: text("design_description"),

    // Logistics
    deliveryDate: timestamp("delivery_date"),
    deliveryAddress: text("delivery_address"),

    // Business
    budgetRange: text("budget_range"),
    additionalRequirements: text("additional_requirements"),
    quotationAmount: decimal("quotation_amount", {
      precision: 10,
      scale: 2,
    }),
    adminNotes: text("admin_notes"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("bulk_orders_number_idx").on(t.orderNumber),
    index("bulk_orders_status_idx").on(t.status),
  ]
);

// ─── Wishlist ─────────────────────────────────────────────────────────────────
export const wishlists = pgTable(
  "wishlists",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("wishlists_user_id_idx").on(t.userId)]
);

export const wishlistsRelations = relations(
  wishlists,
  ({ many, one }) => ({
    items: many(wishlistItems),
    user: one(users, {
      fields: [wishlists.userId],
      references: [users.id],
    }),
  })
);

export const wishlistItems = pgTable(
  "wishlist_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    wishlistId: uuid("wishlist_id")
      .notNull()
      .references(() => wishlists.id, {
        onDelete: "cascade",
      }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, {
        onDelete: "cascade",
      }),
    addedAt: timestamp("added_at").notNull().defaultNow(),
  },
  (t) => [index("wishlist_items_wishlist_id_idx").on(t.wishlistId)]
);

export const wishlistItemsRelations = relations(
  wishlistItems,
  ({ one }) => ({
    wishlist: one(wishlists, {
      fields: [wishlistItems.wishlistId],
      references: [wishlists.id],
    }),
    product: one(products, {
      fields: [wishlistItems.productId],
      references: [products.id],
    }),
  })
);

// ─── Store Settings ───────────────────────────────────────────────────────────
export const storeSettings = pgTable("store_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  brandName: text("brand_name").notNull().default("Wolf Theory"),
  logoUrl: text("logo_url"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  businessAddress: text("business_address"),
  currency: text("currency").notNull().default("INR"),
  currencySymbol: text("currency_symbol").notNull().default("₹"),

  // Pricing
  frontPrintFee: decimal("front_print_fee", {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default("0"),
  backPrintFee: decimal("back_print_fee", {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default("0"),
  defaultCustomizationFee: decimal("default_customization_fee", {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default("0"),

  // Shipping
  flatShippingRate: decimal("flat_shipping_rate", {
    precision: 10,
    scale: 2,
  }),
  freeShippingThreshold: decimal("free_shipping_threshold", {
    precision: 10,
    scale: 2,
  }),

  // Tax
  gstRate: decimal("gst_rate", {
    precision: 5,
    scale: 2,
  }),

  // Social
  instagramUrl: text("instagram_url"),
  youtubeUrl: text("youtube_url"),
  twitterUrl: text("twitter_url"),

  // Policies
  returnPolicy: text("return_policy"),
  shippingPolicy: text("shipping_policy"),
  privacyPolicy: text("privacy_policy"),
  termsConditions: text("terms_conditions"),
  aboutContent: text("about_content"),

  // Print configuration
  printDpi: integer("print_dpi").default(300),
  printTechnology: text("print_technology"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Audit Log ────────────────────────────────────────────────────────────────
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    oldValue: json("old_value"),
    newValue: json("new_value"),
    ipAddress: text("ip_address"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("audit_logs_user_id_idx").on(t.userId),
    index("audit_logs_entity_type_idx").on(t.entityType),
    index("audit_logs_created_at_idx").on(t.createdAt),
  ]
);