const fs = require('fs');

const pulledSchemaStr = fs.readFileSync('prisma/schema.pulled.prisma', 'utf8');

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
    
    // Ignore generator and datasource blocks if they appear again (we'll add them manually at the top)
    
    const modelMatch = line.match(/^model\s+([a-z_]+)\s+{/);
    if (modelMatch) {
      inModel = true;
      modelName = modelMatch[1];
      const camelModel = toCamelCase(modelName);
      // Capitalize first letter for Prisma model name
      const capModel = camelModel.charAt(0).toUpperCase() + camelModel.slice(1);
      result.push(`model ${capModel} {`);
      continue;
    }
    
    if (inModel && line.trim() === '}') {
      // End of model, append @@map if it doesn't already exist
      if (!result[result.length - 1].includes('@@map')) {
        result.push(`  @@map("${modelName}")`);
      }
      result.push(line);
      inModel = false;
      continue;
    }
    
    if (inModel) {
      // Ignore empty lines
      if (line.trim() === '') {
        result.push(line);
        continue;
      }
      
      // Handle block level attributes (@@index, @@unique)
      if (line.trim().startsWith('@@')) {
        // We need to replace snake_case field references with camelCase inside the attribute
        const updatedLine = line.replace(/\[([a-z_, ]+)\]/, (match, group) => {
          const fields = group.split(',').map(s => s.trim());
          const camelFields = fields.map(toCamelCase);
          return `[${camelFields.join(', ')}]`;
        });
        result.push(updatedLine);
        continue;
      }
      
      // It's a field
      // Extract field name, type, and modifiers
      const parts = line.trim().split(/\s+/);
      const fieldName = parts[0];
      const camelField = toCamelCase(fieldName);
      let fieldType = parts[1];
      
      // If fieldType is a snake_case model name, convert it to CapitalizedCamelCase
      const typeIsModelOrEnum = /^[a-z_]+(\[\])?\??$/.test(fieldType) && !['String', 'Int', 'Float', 'Decimal', 'Boolean', 'DateTime', 'Json'].includes(fieldType.replace('[]', '').replace('?', ''));
      
      if (typeIsModelOrEnum) {
        let cleanType = fieldType.replace('[]', '').replace('?', '');
        let camelClean = toCamelCase(cleanType);
        let capClean = camelClean.charAt(0).toUpperCase() + camelClean.slice(1);
        fieldType = fieldType.replace(cleanType, capClean);
      }
      
      // Reconstruct line
      let rest = line.substring(line.indexOf(parts[1]) + parts[1].length);
      
      // If field name changed, add @map
      if (camelField !== fieldName) {
        rest = ` @map("${fieldName}")` + rest;
      }
      
      // In relations, fields and references might be snake case
      rest = rest.replace(/fields:\s*\[([a-z_, ]+)\]/, (match, group) => {
        const fields = group.split(',').map(s => toCamelCase(s.trim()));
        return `fields: [${fields.join(', ')}]`;
      });
      rest = rest.replace(/references:\s*\[([a-z_, ]+)\]/, (match, group) => {
        const fields = group.split(',').map(s => toCamelCase(s.trim()));
        return `references: [${fields.join(', ')}]`;
      });
      
      result.push(`  ${camelField} ${fieldType}${rest}`);
      continue;
    }
    
    // For enum, similar process
    const enumMatch = line.match(/^enum\s+([a-z_]+)\s+{/);
    if (enumMatch) {
      // Actually we have snake case enums like user_role and Capitalized enums like Role
      // The pull creates multiple. We should just keep the Enums that pull gives us and map them if needed.
      // The prompt says: "keep all enums, enum @map values... exactly as in the database"
      const enumName = enumMatch[1];
      const camelEnum = toCamelCase(enumName);
      const capEnum = camelEnum.charAt(0).toUpperCase() + camelEnum.slice(1);
      result.push(`enum ${capEnum} {`);
      inModel = true; // reusing inModel flag
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
fs.writeFileSync('prisma/schema.mapped.prisma', finalStr);

