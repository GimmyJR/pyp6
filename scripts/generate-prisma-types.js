// generateTypes.js
const fs = require('fs');
const path = require('path');

// Define the Prisma schema path (adjust as needed)
const prismaSchemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');

// Define the output file where all types will be written in one single file
const outputFile = path.join(__dirname, '..', 'src', 'types', 'prisma.ts');

// Read the Prisma schema file
const schemaContent = fs.readFileSync(prismaSchemaPath, 'utf8');

// === ENUM PARSING ===
// Regex to match enum blocks
const enumRegex = /enum\s+(\w+)\s+{([\s\S]*?)}/g;
let enumOutput = `// Auto-generated enum types\n\n`;
let enumMatch;

while ((enumMatch = enumRegex.exec(schemaContent)) !== null) {
  const enumName = enumMatch[1];
  const enumBody = enumMatch[2].trim();

  // Split the enum body into lines, ignore empty lines or comment lines.
  const enumValues = enumBody
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('//'));

  // Convert each value to a union type string literal
  const union = enumValues
    .map((valueLine) => {
      // Take the first token as the enum value
      const token = valueLine.split(/\s+/)[0];
      return `'${token}'`;
    })
    .join(' | ');

  enumOutput += `export type ${enumName} = ${union};\n\n`;
}

// === MODEL PARSING ===
// Regex to match model blocks
const modelRegex = /model\s+(\w+)\s+{([\s\S]*?)}/g;
let modelsOutput = `// Auto-generated model types (DateTime fields are strings)\n\n`;
let modelMatch;

while ((modelMatch = modelRegex.exec(schemaContent)) !== null) {
  const modelName = modelMatch[1];
  const modelBody = modelMatch[2];

  modelsOutput += `export interface ${modelName} {\n`;

  // Process each line within the model block.
  const lines = modelBody.split('\n');
  for (let line of lines) {
    line = line.trim();
    // Skip empty lines, comment lines, and lines that start with '@@' (model-level attributes)
    if (!line || line.startsWith('//') || line.startsWith('@@')) {
      continue;
    }

    // Regex to capture:
    //   1. The field name
    //   2. The field type (which might include array notation, e.g. Account[])
    //   3. An optional '?' marker (indicating an optional field)
    //
    // Examples:
    //   id                String  @id @default(cuid())
    //   refresh_token     String? @db.Text
    //   accounts          Account[]
    const fieldRegex = /^(\w+)\s+([\w\[\]]+)(\??)/;
    const fieldMatch = fieldRegex.exec(line);
    if (!fieldMatch) continue;

    const fieldName = fieldMatch[1];
    const rawFieldType = fieldMatch[2];
    const optionalMarker = fieldMatch[3] === '?' ? '?' : '';

    // Check for array types (ends with "[]")
    let tsType;
    if (rawFieldType.endsWith('[]')) {
      const baseType = rawFieldType.slice(0, -2);
      tsType = convertType(baseType) + '[]';
    } else {
      tsType = convertType(rawFieldType);
    }

    modelsOutput += `  ${fieldName}${optionalMarker}: ${tsType};\n`;
  }
  modelsOutput += '}\n\n';
}

/**
 * Converts a Prisma type to a TypeScript type.
 * - Maps DateTime to string.
 * - Maps basic types.
 * - Leaves models/enums or custom types as-is.
 */
function convertType(prismaType) {
  switch (prismaType) {
    case 'String':
      return 'string';
    case 'Int':
    case 'Float':
      return 'number';
    case 'Boolean':
      return 'boolean';
    case 'DateTime':
      return 'string'; // Convert DateTime to string
    case 'BigInt':
      return 'bigint';
    case 'Json':
      return 'unknown';
    default:
      // For enums, relations, or custom types, leave them as-is.
      return prismaType;
  }
}

// Combine enum and model outputs into a single string
const output = enumOutput + modelsOutput;

// Write the combined output to the specified file
fs.writeFileSync(outputFile, output, 'utf8');
console.log(`Generated types saved to ${outputFile}`);
