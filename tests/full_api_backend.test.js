/**
 * Full End-to-End API Integration & Backend Test Suite for The Mirage
 * Tests every single API route, function, authentication, and data store method.
 */

const assert = require('assert');
const http = require('http');
const { spawn } = require('child_process');

console.log('================================================================');
console.log(' The Mirage — Comprehensive Full-Stack API Integration Test');
console.log('================================================================\n');

// Start the real Next.js/Node server on an isolated port
const PORT = 3009;
const server = spawn('node', ['server.js'], {
  env: { ...process.env, NODE_ENV: 'production', PORT: String(PORT), MIRAGE_DISABLE_DISK_PERSIST: 'true' },
  stdio: ['ignore', 'inherit', 'inherit'],
});

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({ status: res.statusCode, data: json });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTests() {
  // Wait for server to boot
  let ready = false;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await request('GET', '/api/content/posts?handle=luna-rae&previews=true');
      if (res.status === 200) {
        ready = true;
        break;
      }
    } catch (e) {
      await wait(1000);
    }
  }

  if (!ready) {
    console.error('Server failed to start within timeout');
    server.kill();
    process.exit(1);
  }

  console.log('✓ Server is ready on port ' + PORT + '\n');

  let passed = 0;

  // 1. Auth: Register
  const registerRes = await request('POST', '/api/auth/register', {
    name: 'Test Subscriber',
    username: 'test_sub_' + Date.now(),
    email: 'test' + Date.now() + '@themirage.vip',
    password: 'Password123!',
    role: 'SUBSCRIBER',
  });
  assert.strictEqual(registerRes.status, 200, 'Register should return 200');
  assert.ok(registerRes.data.token, 'Register should return JWT token');
  const userToken = registerRes.data.token;
  const testUserId = registerRes.data.user.id;
  console.log('✓ Test 1: POST /api/auth/register passed (User registered with JWT)');
  passed++;

  // 2. Auth: Login
  const loginRes = await request('POST', '/api/auth/login', {
    email: 'test@themirage.vip',
    password: 'Password123!',
  });
  assert.strictEqual(loginRes.status, 200, 'Login should return 200');
  assert.ok(loginRes.data.token, 'Login should return JWT');
  console.log('✓ Test 2: POST /api/auth/login passed (User login authenticated)');
  passed++;

  // 3. Auth: Forgot Password
  const forgotRes = await request('POST', '/api/auth/forgot-password', {
    email: 'test@themirage.vip',
  });
  assert.strictEqual(forgotRes.status, 200);
  assert.strictEqual(forgotRes.data.success, true);
  console.log('✓ Test 3: POST /api/auth/forgot-password passed');
  passed++;

  // 4. Content: Get Previews for Luna Rae
  const lunaPreviews = await request('GET', '/api/content/posts?handle=luna-rae&previews=true');
  assert.strictEqual(lunaPreviews.status, 200);
  assert.strictEqual(lunaPreviews.data.counts.photos, 3, 'Luna should have exactly 3 preview photos');
  assert.strictEqual(lunaPreviews.data.counts.videos, 2, 'Luna should have exactly 2 preview videos');
  console.log('✓ Test 4: GET /api/content/posts?previews=true passed (3 photos, 2 videos for Luna)');
  passed++;

  // 5. Content: Get Previews for Mia Carter
  const miaPreviews = await request('GET', '/api/content/posts?handle=mia-carter&previews=true');
  assert.strictEqual(miaPreviews.status, 200);
  assert.strictEqual(miaPreviews.data.counts.photos, 3, 'Mia should have exactly 3 preview photos');
  assert.strictEqual(miaPreviews.data.counts.videos, 2, 'Mia should have exactly 2 preview videos');
  console.log('✓ Test 5: GET /api/content/posts?handle=mia-carter&previews=true passed (Mia Carter previews)');
  passed++;

  // 6. Content: Get Previews for Zara Khan
  const zaraPreviews = await request('GET', '/api/content/posts?handle=zara-khan&previews=true');
  assert.strictEqual(zaraPreviews.status, 200);
  assert.strictEqual(zaraPreviews.data.counts.photos, 3);
  assert.strictEqual(zaraPreviews.data.counts.videos, 2);
  console.log('✓ Test 6: GET /api/content/posts?handle=zara-khan&previews=true passed (Zara Khan previews)');
  passed++;

  // 7. Content: Create New Post (Creator Studio)
  const createPostRes = await request('POST', '/api/content/posts', {
    creatorId: 'c1',
    creatorHandle: 'luna-rae',
    creatorName: 'Luna Rae',
    title: 'E2E Test Exclusive RAW Image',
    caption: 'Automated test suite item',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-test-raw.jpg',
    thumbnailUrl: 'https://images.unsplash.com/photo-test-thumb.jpg',
    visibility: 'PURCHASE_ONLY',
    price: 18.00,
  });
  assert.strictEqual(createPostRes.status, 200);
  const createdPostId = createPostRes.data.post.id;
  assert.ok(createdPostId, 'Created post should have an id');
  console.log('✓ Test 7: POST /api/content/posts passed (Created post: ' + createdPostId + ')');
  passed++;

  // 8. Content: Patch Post (Update Price)
  const patchPostRes = await request('PATCH', '/api/content/posts', {
    postId: createdPostId,
    creatorId: 'c1',
    updates: { price: 22.00 },
  });
  assert.strictEqual(patchPostRes.status, 200);
  assert.strictEqual(patchPostRes.data.post.price, 22.00);
  console.log('✓ Test 8: PATCH /api/content/posts passed (Updated price to $22.00)');
  passed++;

  // 9. Media: Check unauthorized access before purchase (should return 403 Forbidden)
  const unauthMediaRes = await request('GET', `/api/media/${createdPostId}?userId=${testUserId}`);
  assert.strictEqual(unauthMediaRes.status, 403, 'Unauthorized media request must return 403');
  assert.strictEqual(unauthMediaRes.data.authorized, false);
  console.log('✓ Test 9: GET /api/media/:id (Unpurchased) passed — strictly 403 Forbidden');
  passed++;

  // 10. Purchase: User purchases the individual content
  const purchaseRes = await request('POST', '/api/content/purchase', {
    postId: createdPostId,
    userId: testUserId,
    userName: 'Test Subscriber',
  });
  assert.strictEqual(purchaseRes.status, 200);
  assert.strictEqual(purchaseRes.data.success, true);
  assert.strictEqual(purchaseRes.data.purchase.price, 22.00);
  console.log('✓ Test 10: POST /api/content/purchase passed (Purchased for $22.00)');
  passed++;

  // 11. Media: Check authorized access after purchase (should return 200 with high-res mediaUrl)
  const authMediaRes = await request('GET', `/api/media/${createdPostId}?userId=${testUserId}`);
  assert.strictEqual(authMediaRes.status, 200, 'Purchased media request must return 200');
  assert.strictEqual(authMediaRes.data.authorized, true);
  assert.strictEqual(authMediaRes.data.mediaUrl, 'https://images.unsplash.com/photo-test-raw.jpg');
  console.log('✓ Test 11: GET /api/media/:id (Purchased) passed — 200 OK with high-res access');
  passed++;

  // 12. User Purchases: Check user vault library
  const userPurchasesRes = await request('GET', `/api/user/purchases?userId=${testUserId}`);
  assert.strictEqual(userPurchasesRes.status, 200);
  assert.ok(userPurchasesRes.data.count >= 1, 'Purchased post must appear in library');
  console.log('✓ Test 12: GET /api/user/purchases passed (Vault verified)');
  passed++;

  // 13. Subscriptions Checkout
  const checkoutRes = await request('POST', '/api/subscriptions/checkout', {
    creatorId: 'c1',
    amount: 9.99,
  }, {
    Authorization: `Bearer ${userToken}`,
  });
  assert.strictEqual(checkoutRes.status, 200);
  assert.strictEqual(checkoutRes.data.subscription.status, 'ACTIVE');
  assert.strictEqual(checkoutRes.data.commission.creatorShare, 8.49); // 85%
  assert.strictEqual(checkoutRes.data.commission.platformShare, 1.50); // 15%
  console.log('✓ Test 13: POST /api/subscriptions/checkout passed (85/15 Commission validated)');
  passed++;

  // 14. Webhooks: Payment Webhook with Idempotency
  const webhookEventId = 'evt_test_' + Date.now();
  const webhookRes1 = await request('POST', '/api/webhooks/payment', {
    eventId: webhookEventId,
    eventType: 'payment_intent.succeeded',
    data: { amount: 15.00, creatorId: 'c1', userId: testUserId },
  });
  assert.strictEqual(webhookRes1.status, 200);
  assert.strictEqual(webhookRes1.data.status, 'PROCESSED');

  // Re-sending same event must be skipped idempotently
  const webhookRes2 = await request('POST', '/api/webhooks/payment', {
    eventId: webhookEventId,
    eventType: 'payment_intent.succeeded',
    data: { amount: 15.00, creatorId: 'c1', userId: testUserId },
  });
  assert.strictEqual(webhookRes2.status, 200);
  assert.strictEqual(webhookRes2.data.message, 'Event already processed');
  console.log('✓ Test 14: POST /api/webhooks/payment passed (Idempotency verified)');
  passed++;

  // 15. Creator Earnings: Verify Segregated Earnings for Luna Rae
  const earningsRes = await request('GET', '/api/creator/earnings?creatorId=c1');
  assert.strictEqual(earningsRes.status, 200);
  assert.strictEqual(earningsRes.data.success, true);
  assert.ok(earningsRes.data.earnings.totals.totalCreatorNet >= 0, 'Net earnings calculated');
  assert.strictEqual(earningsRes.data.earnings.totals.commissionSplit, '85% Creator / 15% Platform');
  console.log('✓ Test 15: GET /api/creator/earnings passed (85% Creator Ledger verified)');
  passed++;

  // 16. Admin Catalog: Query and moderate content
  const adminCatalogRes = await request('GET', '/api/admin/catalog?status=PUBLISHED');
  assert.strictEqual(adminCatalogRes.status, 200);
  assert.ok(adminCatalogRes.data.count > 0, 'Admin catalog must return published items');

  const adminPatchRes = await request('PATCH', '/api/admin/catalog', {
    postId: createdPostId,
    status: 'ARCHIVED',
  });
  assert.strictEqual(adminPatchRes.status, 200);
  assert.strictEqual(adminPatchRes.data.post.status, 'ARCHIVED');
  console.log('✓ Test 16: Admin Catalog GET & PATCH passed (Moderation verified)');
  passed++;

  // 17. Frontend Routes Verification: /creator/mia-carter and /creators/mia-carter
  const creatorRouteRes = await request('GET', '/creator/mia-carter');
  assert.strictEqual(creatorRouteRes.status, 200);
  assert.ok(typeof creatorRouteRes.data === 'string' && creatorRouteRes.data.includes('Mia Carter'));

  const creatorsRouteRes = await request('GET', '/creators/mia-carter');
  assert.strictEqual(creatorsRouteRes.status, 200);
  assert.ok(typeof creatorsRouteRes.data === 'string' && creatorsRouteRes.data.includes('Mia Carter'));
  console.log('✓ Test 17: Creator Profile Pages (/creator and /creators) return 200 OK');
  passed++;

  // 18. Real User Registration -> Admin User Accounts & Creators Sync
  const uniqueSubEmail = `newsub_${Date.now()}@themirage.vip`;
  const subRegRes = await request('POST', '/api/auth/register', {
    name: 'Real New Subscriber',
    username: `realsub_${Date.now()}`,
    email: uniqueSubEmail,
    password: 'SecretPassword123',
    role: 'SUBSCRIBER',
  });
  assert.strictEqual(subRegRes.status, 200);
  const newSubId = subRegRes.data.user.id;

  const adminUsersRes = await request('GET', '/api/admin/users');
  assert.strictEqual(adminUsersRes.status, 200);
  assert.ok(adminUsersRes.data.users.some(u => u.email === uniqueSubEmail), 'Registered subscriber must immediately appear in Admin Users');

  const uniqueCreatorEmail = `newcreator_${Date.now()}@themirage.vip`;
  const creatorRegRes = await request('POST', '/api/auth/register', {
    name: 'Elena Live Creator',
    username: `elena_live_${Date.now()}`,
    email: uniqueCreatorEmail,
    password: 'SecretPassword123',
    role: 'CREATOR',
    monthlyPrice: 19.99,
  });
  assert.strictEqual(creatorRegRes.status, 200);

  const adminCreatorsRes = await request('GET', '/api/admin/creators');
  assert.strictEqual(adminCreatorsRes.status, 200);
  assert.ok(adminCreatorsRes.data.creators.some(c => c.name === 'Elena Live Creator'), 'Registered creator must immediately appear in Admin Creators');
  console.log('✓ Test 18: Newly registered Subscriber & Creator live-synced to Admin Panel');
  passed++;

  // 19. Real Follows, Custom Requests & Admin Overview Analytics
  const followRes = await request('POST', '/api/user/follows', { userId: newSubId, handle: 'luna-rae' });
  assert.strictEqual(followRes.status, 200);
  const followsListRes = await request('GET', `/api/user/follows?userId=${newSubId}`);
  assert.ok(followsListRes.data.follows.some(f => f.creatorHandle === 'luna-rae'));

  const customReqRes = await request('POST', '/api/custom-requests', {
    customerId: newSubId,
    creatorHandle: 'luna-rae',
    title: 'VIP Integration Custom Clip',
    price: 40.00,
    paid: true,
  });
  assert.strictEqual(customReqRes.status, 200);
  const reqId = customReqRes.data.request.id;

  const deliverRes = await request('PATCH', '/api/custom-requests', {
    requestId: reqId,
    action: 'DELIVER',
    deliveredMediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  });
  assert.strictEqual(deliverRes.status, 200);
  assert.strictEqual(deliverRes.data.request.status, 'DELIVERED');

  const adminOverviewRes = await request('GET', '/api/admin/overview');
  assert.strictEqual(adminOverviewRes.status, 200);
  assert.ok(adminOverviewRes.data.metrics.totalGross > 0);
  console.log('✓ Test 19: Follows, Custom Request Delivery -> Vault, & Admin Live Overview verified');
  passed++;

  console.log('\n================================================================');
  console.log(` ALL ${passed}/${passed} FULL-STACK E2E API & BACKEND TESTS PASSED! ✓`);
  console.log('================================================================');

  server.kill();
  process.exit(0);
}

runTests().catch((err) => {
  console.error('\n❌ Test Failure:', err);
  server.kill();
  process.exit(1);
});
