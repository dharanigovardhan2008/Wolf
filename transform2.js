const { execSync } = require('child_process');
const fs = require('fs');

const pulledSchemaStr = execSync('npx prisma db pull --print', { encoding: 'utf8' });

function toCamelCase(str) {
  return str.replace(/_([a-z0-9])/g, function (g) { return g[1].toUpperCase(); });
}

function processSchema(schemaStr) {
  let lines = schemaStr.split('\n');
  let result = [];
  
  let inModel = false;
  let modelName = '';
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (line.trim().startsWith('//')) {
      result.push(line);
      continue;
    }
    
    const modelMatch = line.match(/^model\s+([a-zA-Z0-9_]+)\s+{/);
    if (modelMatch) {
      inModel = true;
      modelName = modelMatch[1];
      const camelModel = toCamelCase(modelName);
      const capModel = camelModel.charAt(0).toUpperCase() + camelModel.slice(1);
      result.push(`model ${capModel} {`);
      continue;
    }
    
    if (inModel && line.trim() === '}') {
      if (!result[result.length - 1].includes('@@map')) {
        result.push(`  @@map("${modelName}")`);
      }
      result.push(line);
      inModel = false;
      continue;
    }
    
    if (inModel) {
      if (line.trim() === '') {
        result.push(line);
        continue;
      }
      
      if (line.trim().startsWith('@@')) {
        let updatedLine = line;
        // Also map fields inside @@index and @@unique
        updatedLine = updatedLine.replace(/\[([^\]]+)\]/, (match, group) => {
          const fields = group.split(',').map(s => s.trim());
          const camelFields = fields.map(toCamelCase);
          return `[${camelFields.join(', ')}]`;
        });
        result.push(updatedLine);
        continue;
      }
      
      const parts = line.trim().split(/\s+/);
      const fieldName = parts[0];
      const camelField = toCamelCase(fieldName);
      let fieldType = parts[1];
      
      if (!fieldType) {
        result.push(line);
        continue;
      }
      
      const typeIsModelOrEnum = /^[a-zA-Z0-9_]+(\[\])?\??$/.test(fieldType) && !['String', 'Int', 'Float', 'Decimal', 'Boolean', 'DateTime', 'Json'].includes(fieldType.replace('[]', '').replace('?', ''));
      
      if (typeIsModelOrEnum) {
        let cleanType = fieldType.replace('[]', '').replace('?', '');
        let camelClean = toCamelCase(cleanType);
        let capClean = camelClean.charAt(0).toUpperCase() + camelClean.slice(1);
        fieldType = fieldType.replace(cleanType, capClean);
      }
      
      let rest = line.substring(line.indexOf(parts[1]) + parts[1].length);
      
      if (camelField !== fieldName) {
        rest = ` @map("${fieldName}")` + rest;
      }
      
      rest = rest.replace(/fields:\s*\[([^\]]+)\]/, (match, group) => {
        const fields = group.split(',').map(s => toCamelCase(s.trim()));
        return `fields: [${fields.join(', ')}]`;
      });
      rest = rest.replace(/references:\s*\[([^\]]+)\]/, (match, group) => {
        const fields = group.split(',').map(s => toCamelCase(s.trim()));
        return `references: [${fields.join(', ')}]`;
      });
      
      result.push(`  ${camelField} ${fieldType}${rest}`);
      continue;
    }
    
    const enumMatch = line.match(/^enum\s+([a-zA-Z0-9_]+)\s+{/);
    if (enumMatch) {
      const enumName = enumMatch[1];
      const camelEnum = toCamelCase(enumName);
      const capEnum = camelEnum.charAt(0).toUpperCase() + camelEnum.slice(1);
      result.push(`enum ${capEnum} {`);
      inModel = true;
      modelName = enumName;
      continue;
    }
    
    if (!inModel) {
      result.push(line);
    }
  }
  
  return result.join('\n');
}

const finalStr = processSchema(pulledSchemaStr);

// Now apply Phase 0 additions
const productIdx = finalStr.indexOf('model Products {');
let modifiedStr = finalStr;

// Wait, the model might be called Products (from products). Let's just do a regex replace to insert fields.
modifiedStr = modifiedStr.replace(
  /model Products \{\s+([\s\S]*?)@@map\("products"\)\s+\}/,
  function(match, inner) {
    const additions = `
  actualPrice        Decimal?       @map("actual_price") @db.Decimal(10, 2)
  gstPercent         Decimal?       @map("gst_percent") @db.Decimal(5, 2)
  costPrice          Decimal?       @map("cost_price") @db.Decimal(10, 2)
  isNewArrival       Boolean        @default(false) @map("is_new_arrival")
  fit                String?
  careInstructions   String?        @map("care_instructions") @db.Text
`;
    return `model Products {
${inner}${additions}
  @@map("products")
}`;
  }
);

modifiedStr = modifiedStr.replace(
  /model ProductImages \{\s+([\s\S]*?)@@map\("product_images"\)\s+\}/,
  function(match, inner) {
    const additions = `
  publicId           String?        @map("public_id")
`;
    return `model ProductImages {
${inner}${additions}
  @@map("product_images")
}`;
  }
);

// Prisma pull creates Products, ProductImages instead of Product, ProductImage.
// We should manually convert Products -> Product, Users -> User, etc to keep the app working.
const renames = {
  'model Users {': 'model User {',
  'model Addresses {': 'model Address {',
  'model AuditLogs {': 'model AuditLog {',
  'model BulkOrders {': 'model BulkOrder {',
  'model CartItems {': 'model CartItem {',
  'model Carts {': 'model Cart {',
  'model Colors {': 'model Color {',
  'model Customizations {': 'model Customization {',
  'model Fabrics {': 'model Fabric {',
  'model OrderItems {': 'model OrderItem {',
  'model OrderStatusHistory {': 'model OrderStatusHistory {',
  'model Orders {': 'model Order {',
  'model ProductImages {': 'model ProductImage {',
  'model ProductVariants {': 'model ProductVariant {',
  'model Products {': 'model Product {',
  'model SavedDesigns {': 'model SavedDesign {',
  'model Sizes {': 'model Size {',
  'model StoreSettings {': 'model StoreSetting {',
  'model WishlistItems {': 'model WishlistItem {',
  'model Wishlists {': 'model Wishlist {'
};

// Also rename field types (e.g. users users -> user User)
for (const [oldName, newName] of Object.entries(renames)) {
  modifiedStr = modifiedStr.replace(new RegExp(oldName, 'g'), newName);
  
  const oldType = oldName.replace('model ', '').replace(' {', '');
  const newType = newName.replace('model ', '').replace(' {', '');
  
  // Replace array types: products[] -> Product[]
  modifiedStr = modifiedStr.replace(new RegExp(` ${oldType}\\[\\]`, 'g'), ` ${newType}[]`);
  // Replace single types: products -> Product
  modifiedStr = modifiedStr.replace(new RegExp(` ${oldType}(\\?| )`, 'g'), ` ${newType}$1`);
}

fs.writeFileSync('prisma/schema.prisma', modifiedStr);
console.log("Schema rewritten successfully.");
