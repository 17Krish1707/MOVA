import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { auditDuplicateTrackingCodes } from '../config/dbSafety';
import { sanitizeDbError } from '../config/db';

dotenv.config();

const runAudit = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.log('[MOVA Audit] MONGODB_URI is not set. In-memory mode is currently active.');
    process.exit(0);
  }

  let exitCode = 0;

  try {
    console.log('[MOVA Audit] Connecting to MongoDB...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('[MOVA Audit] Connected successfully. Scanning for duplicate and non-canonical tracking codes...');

    const result = await auditDuplicateTrackingCodes();

    console.log(`[MOVA Audit] Checked ${result.totalChecked} records.`);

    if (result.safe) {
      console.log('[MOVA Audit] ✅ PASSED: Zero duplicates and all tracking codes are in canonical format.');
      console.log("[MOVA Audit] Unique index 'trackingCode_unique' can be safely verified/applied.");
    } else {
      exitCode = 1;
      console.error('================================================================================');
      console.error('[MOVA Audit] ❌ AUDIT FAILED: UNINDEXABLE DATA FOUND IN MONGODB!');
      console.error('--------------------------------------------------------------------------------');

      if (result.duplicates.length > 0) {
        console.error(`A. Duplicate Normalized Tracking Codes (${result.duplicates.length} group(s)):`);
        result.duplicates.forEach((group, idx) => {
          console.error(`   ${idx + 1}. Normalized: "${group.normalizedCode}" (Occurrences: ${group.count})`);
          group.docs.forEach((doc) => {
            console.error(`      - Document ID: ${doc.id} | Stored Value: "${doc.rawCode}"`);
          });
        });
      }

      if (result.nonCanonical.length > 0) {
        console.error(`B. Non-Canonical Stored Tracking Codes (${result.nonCanonical.length} record(s)):`);
        result.nonCanonical.forEach((item, idx) => {
          console.error(`   ${idx + 1}. Document ID: ${item.id} | Stored Value: "${item.rawCode}" -> Expected: "${item.canonicalForm}"`);
        });
      }

      console.error('--------------------------------------------------------------------------------');
      console.error('ACTION REQUIRED: Records must be manually remediated before creating the unique index.');
      console.error('Unique index creation will be rejected until data is canonical and unique.');
      console.error('================================================================================');
    }
  } catch (error) {
    console.error('[MOVA Audit] Error connecting or scanning MongoDB:', sanitizeDbError(error));
    exitCode = 1;
  } finally {
    await mongoose.disconnect();
    process.exit(exitCode);
  }
};

runAudit();
