const fs = require('fs');

const pulled = fs.readFileSync('prisma/schema.pulled.prisma', 'utf8');

let lines = pulled.split('\n');
let out = [];

// Enums to skip because they are duplicates or unwanted
const skipEnums = ['bulk_order_status', 'order_status', 'payment_status', 'product_status', 'user_role'];
let inSkipEnum = false;
let inModel = false;
let modelName = "";

const modelNameMap = {
  'addresses': 'Address',
  'audit_logs': 'AuditLog',
  'bulk_orders': 'BulkOrder',
  'cart_items': 'CartItem',
  'carts': 'Cart',
  'colors': 'Color',
  'customizations': 'Customization',
  'fabrics': 'Fabric',
  'order_items': 'OrderItem',
  'order_status_history': 'OrderStatusHistory',
  'orders': 'Order',
  'product_images': 'ProductImage',
  'product_variants': 'ProductVariant',
  'products': 'Product',
  'saved_designs': 'SavedDesign',
  'sizes': 'Size',
  'store_settings': 'StoreSetting',
  'users': 'User',
  'wishlist_items': 'WishlistItem',
  'wishlists': 'Wishlist'
};

function toCamel(str) {
  return str.replace(/_([a-z])/g, g => g[1].toUpperCase());
}

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  
  // Skip unwanted enums
  if (line.match(/^enum\s+([a-z_]+)\s+{/)) {
    let eName = line.match(/^enum\s+([a-z_]+)\s+{/)[1];
    if (skipEnums.includes(eName)) {
      inSkipEnum = true;
      continue;
    }
  }
  if (inSkipEnum) {
    if (line.trim() === '}') inSkipEnum = false;
    continue;
  }
  
  // Model detection
  let mMatch = line.match(/^model\s+([a-z_]+)\s+{/);
  if (mMatch) {
    inModel = true;
    modelName = mMatch[1];
    let newModelName = modelNameMap[modelName] || modelName;
    out.push(`model ${newModelName} {`);
    continue;
  }
  
  if (inModel && line.trim() === '}') {
    out.push(`  @@map("${modelName}")`);
    
    // Add Phase 0 additions before closing brace
    if (modelName === 'products') {
      out.push(`  actualPrice        Decimal?       @map("actual_price") @db.Decimal(10, 2)`);
      out.push(`  gstPercent         Decimal?       @map("gst_percent") @db.Decimal(5, 2)`);
      out.push(`  costPrice          Decimal?       @map("cost_price") @db.Decimal(10, 2)`);
      out.push(`  isNewArrival       Boolean        @default(false) @map("is_new_arrival")`);
      out.push(`  fit                String?`);
      out.push(`  careInstructions   String?        @map("care_instructions") @db.Text`);
    } else if (modelName === 'product_images') {
      out.push(`  publicId           String?        @map("public_id")`);
    }
    
    out.push(line);
    inModel = false;
    continue;
  }
  
  if (inModel) {
    if (line.trim() === '') {
      out.push(line);
      continue;
    }
    
    // Block attributes
    if (line.trim().startsWith('@@')) {
      let modLine = line.replace(/\[([a-z_, ]+)\]/g, (match, grp) => {
        return '[' + grp.split(',').map(s => toCamel(s.trim())).join(', ') + ']';
      });
      out.push(modLine);
      continue;
    }
    
    // Field parsing
    let parts = line.trim().split(/\s+/);
    let originalFieldName = parts[0];
    let fieldType = parts[1];
    
    // Is it a relation array field? e.g. cart_items cart_items[]
    if (fieldType.endsWith('[]')) {
      let baseType = fieldType.slice(0, -2);
      if (modelNameMap[baseType]) {
        fieldType = modelNameMap[baseType] + '[]';
      }
    }
    // Is it a relation single field? e.g. users users?
    let isOptional = fieldType.endsWith('?');
    let baseType = isOptional ? fieldType.slice(0, -1) : fieldType;
    if (modelNameMap[baseType]) {
      fieldType = modelNameMap[baseType] + (isOptional ? '?' : '');
    }
    
    const enumMap = {
      'user_role': 'Role',
      'bulk_order_status': 'BulkOrderStatus',
      'order_status': 'OrderStatus',
      'payment_status': 'PaymentStatus',
      'product_status': 'ProductStatus',
      'coupon_type': 'CouponType'
    };
    if (enumMap[baseType]) {
      fieldType = enumMap[baseType] + (isOptional ? '?' : '');
    }
    
    let camelFieldName = toCamel(originalFieldName);
    
    // Find index of type to capture the rest of the line
    let restMatch = line.match(new RegExp(`\\s+${fieldType.replace('[', '\\[').replace(']', '\\]').replace('?', '\\?')}(\\s+.*)?$`));
    let rest = restMatch ? (restMatch[1] || '') : '';
    
    // Only map scalar fields, NOT relation fields!
    // A relation field in Prisma is one that has @relation or represents a list of models.
    let isRelation = rest.includes('@relation') || fieldType.includes('[]');
    
    if (camelFieldName !== originalFieldName && !isRelation) {
      rest = ` @map("${originalFieldName}")` + rest;
    }
    
    // Convert fields: [product_id] -> fields: [productId]
    rest = rest.replace(/fields:\s*\[([a-z_, ]+)\]/g, (match, grp) => {
      return 'fields: [' + grp.split(',').map(s => toCamel(s.trim())).join(', ') + ']';
    });
    // references: [id] stays references: [id], but just in case
    rest = rest.replace(/references:\s*\[([a-z_, ]+)\]/g, (match, grp) => {
      return 'references: [' + grp.split(',').map(s => toCamel(s.trim())).join(', ') + ']';
    });
    
    out.push(`  ${camelFieldName} ${fieldType}${rest}`);
    continue;
  }
  
  // Outside model
  out.push(line);
}

fs.writeFileSync('prisma/schema.prisma', out.join('\n'));
console.log('Fixed schema.');
