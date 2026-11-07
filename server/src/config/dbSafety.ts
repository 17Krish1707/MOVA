import mongoose from 'mongoose';

export interface DuplicateDocumentRef {
  id: string;
  rawCode: string;
}

export interface DuplicateTrackingCodeGroup {
  normalizedCode: string;
  count: number;
  docs: DuplicateDocumentRef[];
}

export interface NonCanonicalDocumentRef {
  id: string;
  rawCode: string;
  canonicalForm: string;
}

export interface SafetyAuditResult {
  safe: boolean;
  duplicates: DuplicateTrackingCodeGroup[];
  nonCanonical: NonCanonicalDocumentRef[];
  totalChecked: number;
}

/**
 * Inspects existing MongoDB delivery records for:
 * A. Duplicate normalized tracking codes (trimmed & uppercase).
 * B. Non-canonical stored tracking codes (where stored !== trimmed uppercase).
 *
 * CRITICAL SAFETY RULES:
 * 1. Strictly read-only.
 * 2. Never deletes, modifies, normalizes, or overwrites any existing database records.
 */
export const auditDuplicateTrackingCodes = async (): Promise<SafetyAuditResult> => {
  if (mongoose.connection.readyState !== 1) {
    return { safe: true, duplicates: [], nonCanonical: [], totalChecked: 0 };
  }

  const db = mongoose.connection.db;
  if (!db) {
    return { safe: true, duplicates: [], nonCanonical: [], totalChecked: 0 };
  }

  const collections = await db.listCollections({ name: 'deliveries' }).toArray();
  if (collections.length === 0) {
    return { safe: true, duplicates: [], nonCanonical: [], totalChecked: 0 };
  }

  const collection = db.collection('deliveries');
  const totalChecked = await collection.countDocuments();

  if (totalChecked === 0) {
    return { safe: true, duplicates: [], nonCanonical: [], totalChecked: 0 };
  }

  // A. Detect duplicate normalized tracking codes
  const duplicatePipeline = [
    {
      $project: {
        _id: 1,
        rawCode: { $ifNull: ['$trackingCode', ''] },
        normalizedCode: {
          $toUpper: {
            $trim: { input: { $ifNull: ['$trackingCode', ''] } },
          },
        },
      },
    },
    {
      $group: {
        _id: '$normalizedCode',
        count: { $sum: 1 },
        docs: {
          $push: {
            id: { $toString: '$_id' },
            rawCode: '$rawCode',
          },
        },
      },
    },
    {
      $match: {
        count: { $gt: 1 },
        _id: { $ne: '' },
      },
    },
  ];

  interface AggDuplicateResult {
    _id: string;
    count: number;
    docs: DuplicateDocumentRef[];
  }

  const rawDuplicates = await collection.aggregate<AggDuplicateResult>(duplicatePipeline).toArray();

  const duplicates: DuplicateTrackingCodeGroup[] = rawDuplicates.map((item) => ({
    normalizedCode: item._id,
    count: item.count,
    docs: item.docs,
  }));

  // B. Detect non-canonical stored tracking codes
  const nonCanonicalPipeline = [
    {
      $project: {
        _id: 1,
        rawCode: { $ifNull: ['$trackingCode', ''] },
        canonicalForm: {
          $toUpper: {
            $trim: { input: { $ifNull: ['$trackingCode', ''] } },
          },
        },
      },
    },
    {
      $match: {
        $expr: { $ne: ['$rawCode', '$canonicalForm'] },
      },
    },
  ];

  interface AggNonCanonicalResult {
    _id: unknown;
    rawCode: string;
    canonicalForm: string;
  }

  const rawNonCanonical = await collection.aggregate<AggNonCanonicalResult>(nonCanonicalPipeline).toArray();

  const nonCanonical: NonCanonicalDocumentRef[] = rawNonCanonical.map((item) => ({
    id: String(item._id),
    rawCode: item.rawCode,
    canonicalForm: item.canonicalForm,
  }));

  const isSafe = duplicates.length === 0 && nonCanonical.length === 0;

  return {
    safe: isSafe,
    duplicates,
    nonCanonical,
    totalChecked,
  };
};

/**
 * Validates database safety before accepting MongoDB as ready and creating the unique index.
 *
 * SAFETY INVARIANTS:
 * 1. The read-only duplicate and non-canonical audit ALWAYS runs first, even if the index already exists.
 * 2. If the audit fails (duplicates or non-canonical records found), index creation/acceptance is halted.
 * 3. When an index named 'trackingCode_unique' exists, verifies its exact key pattern and options.
 * 4. If an existing index has an unexpected definition or conflicting name, fails safely with manual remediation guidance.
 * 5. Never silently drops or modifies existing indexes or database records.
 */
export const ensureSafeUniqueTrackingCodeIndex = async (): Promise<{
  indexCreated: boolean;
  alreadyExisted?: boolean;
  audit: SafetyAuditResult;
}> => {
  // Step 1: The duplicate and non-canonical audit ALWAYS runs first
  const audit = await auditDuplicateTrackingCodes();

  if (!audit.safe) {
    console.error('================================================================================');
    console.error('[MOVA Database Safety Check] ❌ AUDIT FAILED: UNINDEXABLE DATA IN MONGODB!');
    console.error(`Total records checked: ${audit.totalChecked}`);
    if (audit.duplicates.length > 0) {
      console.error(`- Duplicate normalized code group(s): ${audit.duplicates.length}`);
      audit.duplicates.forEach((group, idx) => {
        console.error(`  ${idx + 1}. Normalized: "${group.normalizedCode}" (${group.count} occurrences)`);
        group.docs.forEach((doc) => {
          console.error(`     - Document ID: ${doc.id} | Raw Value: "${doc.rawCode}"`);
        });
      });
    }
    if (audit.nonCanonical.length > 0) {
      console.error(`- Non-canonical stored tracking code(s): ${audit.nonCanonical.length}`);
      audit.nonCanonical.forEach((item, idx) => {
        console.error(`  ${idx + 1}. Document ID: ${item.id} | Raw Value: "${item.rawCode}" -> Expected: "${item.canonicalForm}"`);
      });
    }
    console.error('--------------------------------------------------------------------------------');
    console.error('SAFETY ENFORCED: Database acceptance HALTED. Existing records must be deduplicated and canonicalized first.');
    console.error('================================================================================');
    return { indexCreated: false, audit };
  }

  // Step 2: Safe to verify or create unique index
  try {
    const db = mongoose.connection.db;
    if (!db) {
      return { indexCreated: false, audit };
    }

    const collection = db.collection('deliveries');
    const existingIndexes = await collection.indexes();

    // Check for an index with the expected canonical name 'trackingCode_unique'
    const existingNamed = existingIndexes.find(
      (idx) => idx.name === 'trackingCode_unique'
    );

    if (existingNamed) {
      // Verify exact key pattern and options
      const keyKeys = Object.keys(existingNamed.key || {});
      const hasExactKey = keyKeys.length === 1 && existingNamed.key.trackingCode === 1;
      const isUnique = existingNamed.unique === true;
      const hasNoCustomCollation = !existingNamed.collation;
      const isNotSparse = !existingNamed.sparse;
      const hasNoPartialFilter = !existingNamed.partialFilterExpression;

      if (hasExactKey && isUnique && hasNoCustomCollation && isNotSparse && hasNoPartialFilter) {
        console.log("[MOVA Database Safety Check] ✅ Verified canonical unique index 'trackingCode_unique' ({ trackingCode: 1 }, unique: true).");
        return { indexCreated: true, alreadyExisted: true, audit };
      }

      // Existing index has unexpected definition - fail safely
      console.error('================================================================================');
      console.error("[MOVA Database Safety Check] ❌ Index 'trackingCode_unique' exists with an UNEXPECTED DEFINITION!");
      console.error('Expected definition: { key: { trackingCode: 1 }, unique: true, standard binary collation, non-sparse }');
      console.error(`Actual definition found: ${JSON.stringify(existingNamed)}`);
      console.error('--------------------------------------------------------------------------------');
      console.error('ACTION REQUIRED: Drop the malformed index manually via MongoDB shell before starting:');
      console.error("  db.deliveries.dropIndex('trackingCode_unique')");
      console.error('The server will recreate the canonical index on next startup.');
      console.error('================================================================================');
      return { indexCreated: false, audit };
    }

    // Check if another index on trackingCode exists with a conflicting name
    const conflictingIndex = existingIndexes.find(
      (idx) => idx.key && 'trackingCode' in idx.key && idx.name !== 'trackingCode_unique'
    );

    if (conflictingIndex) {
      console.error('================================================================================');
      console.error(`[MOVA Database Safety Check] ❌ Conflicting index '${conflictingIndex.name}' found on 'trackingCode'!`);
      console.error(`Index details: ${JSON.stringify(conflictingIndex)}`);
      console.error("Expected canonical index name: 'trackingCode_unique'");
      console.error('--------------------------------------------------------------------------------');
      console.error('ACTION REQUIRED: Drop the conflicting index manually via MongoDB shell before starting:');
      console.error(`  db.deliveries.dropIndex('${conflictingIndex.name}')`);
      console.error('Then restart the server to create the canonical index.');
      console.error('================================================================================');
      return { indexCreated: false, audit };
    }

    // No existing index on trackingCode - create the canonical binary unique index
    await collection.createIndex(
      { trackingCode: 1 },
      {
        unique: true,
        name: 'trackingCode_unique',
        background: true,
      }
    );
    console.log("[MOVA Database Safety Check] ✅ Canonical unique index 'trackingCode_unique' created successfully on MongoDB.");
    return { indexCreated: true, alreadyExisted: false, audit };
  } catch (err) {
    console.error('[MOVA Database Safety Check] Error verifying or creating unique index:', err);
    return { indexCreated: false, audit };
  }
};
