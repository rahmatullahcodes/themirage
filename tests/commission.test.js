/**
 * The Mirage - Automated Verification Test Suite
 * Tests financial calculation, 85/15 split, and edge cases
 */

const assert = require('assert');

function calculateCommission(grossAmount, customCreatorPercent = 85, customFeeAmount = 0.0) {
  const creatorPercent = customCreatorPercent;
  const platformPercent = 100 - creatorPercent;
  const taxableBase = Math.max(0, grossAmount - customFeeAmount);

  const creatorShare = parseFloat(((taxableBase * creatorPercent) / 100).toFixed(2));
  const platformShare = parseFloat((taxableBase - creatorShare).toFixed(2));

  return {
    grossAmount: parseFloat(grossAmount.toFixed(2)),
    creatorShare,
    platformShare,
    feeAmount: parseFloat(customFeeAmount.toFixed(2)),
    netPayout: creatorShare,
    creatorPercent,
    platformPercent,
  };
}

console.log('--- Running Test Suite: The Mirage 85/15 Commission Engine ---');

// Test 1: $10.00 standard subscription split
const t1 = calculateCommission(10.00, 85);
assert.strictEqual(t1.creatorShare, 8.50, 'Creator must receive $8.50 from $10.00 (85%)');
assert.strictEqual(t1.platformShare, 1.50, 'Platform must receive $1.50 from $10.00 (15%)');
console.log('✓ Test 1 Passed: $10.00 -> $8.50 Creator (85%) / $1.50 Platform (15%)');

// Test 2: $9.99 standard monthly price rounding check
const t2 = calculateCommission(9.99, 85);
assert.strictEqual(t2.creatorShare, 8.49, 'Creator must receive $8.49 from $9.99');
assert.strictEqual(t2.platformShare, 1.50, 'Platform must receive $1.50 from $9.99');
assert.strictEqual(parseFloat((t2.creatorShare + t2.platformShare).toFixed(2)), 9.99, 'Total shares must sum to gross amount');
console.log('✓ Test 2 Passed: $9.99 -> $8.49 Creator / $1.50 Platform (Sum = $9.99)');

// Test 3: $50.00 custom content request
const t3 = calculateCommission(50.00, 85);
assert.strictEqual(t3.creatorShare, 42.50, 'Creator must receive $42.50 from $50.00');
assert.strictEqual(t3.platformShare, 7.50, 'Platform must receive $7.50 from $50.00');
console.log('✓ Test 3 Passed: $50.00 Custom Request -> $42.50 Creator / $7.50 Platform');

// Test 4: Dynamic Admin commission adjustment (e.g. 90/10 promo)
const t4 = calculateCommission(100.00, 90);
assert.strictEqual(t4.creatorShare, 90.00, 'Creator must receive $90.00 under 90% rule');
assert.strictEqual(t4.platformShare, 10.00, 'Platform must receive $10.00 under 10% rule');
console.log('✓ Test 4 Passed: Configurable 90/10 Split Verified');

console.log('\nAll 4 Financial Logic Tests Passed Successfully! ✓');

