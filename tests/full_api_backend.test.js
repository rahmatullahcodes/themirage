/**
 * Full End-to-End API Integration & Backend Test Suite for The Mirage
 * Tests every single API route, function, authentication, and data store method.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
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
        resolve({ status: res.statusCode, data: json, headers: res.headers });
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
  const regEmail = 'test' + Date.now() + '@themirage.vip';
  const registerRes = await request('POST', '/api/auth/register', {
    name: 'Test Subscriber',
    username: 'test_sub_' + Date.now(),
    email: regEmail,
    password: 'Password123!',
    role: 'SUBSCRIBER',
  });
  assert.strictEqual(registerRes.status, 200, 'Register should return 200');
  assert.ok(registerRes.data.token, 'Register should return JWT token');
  const regSetCookie = [].concat(registerRes.headers['set-cookie'] || []).join(';');
  assert.ok(regSetCookie.includes('mirage_token='), 'Register must attach HttpOnly session cookie');
  const userToken = registerRes.data.token;
  const userAuth = { Authorization: `Bearer ${userToken}` };
  const testUserId = registerRes.data.user.id;
  console.log('✓ Test 1: POST /api/auth/register passed (User registered with JWT + Session Cookie)');
  passed++;

  // 2. Auth: Login + Password Enforcement + Role Session Logins
  const loginRes = await request('POST', '/api/auth/login', {
    email: regEmail,
    password: 'Password123!',
  });
  assert.strictEqual(loginRes.status, 200, 'Login should return 200');
  assert.ok(loginRes.data.token, 'Login should return JWT');
  const loginSetCookie = [].concat(loginRes.headers['set-cookie'] || []).join(';');
  assert.ok(loginSetCookie.includes('mirage_token='), 'Login must attach HttpOnly session cookie');

  const badEmailLogin = await request('POST', '/api/auth/login', {
    email: `nonexistent_${Date.now()}@themirage.vip`,
    password: 'Password123!',
  });
  assert.strictEqual(badEmailLogin.status, 401, 'Unknown email login must be rejected with 401');

  const wrongPassLogin = await request('POST', '/api/auth/login', {
    email: regEmail,
    password: 'WrongPassword999!',
  });
  assert.strictEqual(wrongPassLogin.status, 401, 'Wrong password must be rejected with 401');

  const adminLogin = await request('POST', '/api/auth/login', {
    email: 'admin@themirage.vip',
    password: 'password123',
  });
  assert.strictEqual(adminLogin.status, 200, 'Seeded admin login must succeed');
  const adminToken = adminLogin.data.token;
  const adminAuth = { Authorization: `Bearer ${adminToken}` };

  const lunaLogin = await request('POST', '/api/auth/login', {
    email: 'creator@themirage.vip',
    password: 'password123',
  });
  assert.strictEqual(lunaLogin.status, 200, 'Seeded Luna Rae creator login must succeed');
  const lunaToken = lunaLogin.data.token;
  const lunaAuth = { Authorization: `Bearer ${lunaToken}` };

  const ellieLogin = await request('POST', '/api/auth/login', {
    email: 'ellie@themirage.vip',
    password: 'password123',
  });
  assert.strictEqual(ellieLogin.status, 200, 'Seeded Ellie creator login must succeed');
  const ellieToken = ellieLogin.data.token;
  const ellieAuth = { Authorization: `Bearer ${ellieToken}` };

  const alexLogin = await request('POST', '/api/auth/login', {
    email: 'subscriber@themirage.vip',
    password: 'password123',
  });
  assert.strictEqual(alexLogin.status, 200, 'Seeded Alex Mercer subscriber login must succeed');
  const alexAuth = { Authorization: `Bearer ${alexLogin.data.token}` };

  console.log('✓ Test 2: POST /api/auth/login passed (Credentials & role tokens verified)');
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
  }, lunaAuth);
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
  }, lunaAuth);
  assert.strictEqual(patchPostRes.status, 200);
  assert.strictEqual(patchPostRes.data.post.price, 22.00);
  console.log('✓ Test 8: PATCH /api/content/posts passed (Updated price to $22.00)');
  passed++;

  // 9. Media: Check unauthorized access before purchase (should return 403 Forbidden)
  const spoofMediaRes = await request('GET', `/api/media/${createdPostId}?userId=usr-1`);
  assert.strictEqual(spoofMediaRes.status, 403, 'Spoofed userId without session must be denied');

  const unauthMediaRes = await request('GET', `/api/media/${createdPostId}`, null, userAuth);
  assert.strictEqual(unauthMediaRes.status, 403, 'Unauthorized media request must return 403');
  assert.strictEqual(unauthMediaRes.data.authorized, false);
  console.log('✓ Test 9: GET /api/media/:id (Unpurchased) passed — strictly 403 Forbidden');
  passed++;

  // 10. Purchase: User purchases the individual content
  const purchaseRes = await request('POST', '/api/content/purchase', {
    postId: createdPostId,
  }, userAuth);
  assert.strictEqual(purchaseRes.status, 200);
  assert.strictEqual(purchaseRes.data.success, true);
  assert.strictEqual(purchaseRes.data.purchase.price, 22.00);
  console.log('✓ Test 10: POST /api/content/purchase passed (Purchased for $22.00)');
  passed++;

  // 11. Media: Check authorized access after purchase (should return 200 with high-res mediaUrl)
  const authMediaRes = await request('GET', `/api/media/${createdPostId}`, null, userAuth);
  assert.strictEqual(authMediaRes.status, 200, 'Purchased media request must return 200');
  assert.strictEqual(authMediaRes.data.authorized, true);
  assert.strictEqual(authMediaRes.data.mediaUrl, 'https://images.unsplash.com/photo-test-raw.jpg');
  console.log('✓ Test 11: GET /api/media/:id (Purchased) passed — 200 OK with high-res access');
  passed++;

  // 12. User Purchases: Check user vault library
  const userPurchasesRes = await request('GET', '/api/user/purchases', null, userAuth);
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
  const earningsRes = await request('GET', '/api/creator/earnings?creatorId=c1', null, lunaAuth);
  assert.strictEqual(earningsRes.status, 200);
  assert.strictEqual(earningsRes.data.success, true);
  assert.ok(earningsRes.data.earnings.totals.totalCreatorNet >= 0, 'Net earnings calculated');
  assert.strictEqual(earningsRes.data.earnings.totals.commissionSplit, '85% Creator / 15% Platform');
  console.log('✓ Test 15: GET /api/creator/earnings passed (85% Creator Ledger verified)');
  passed++;

  // 16. Admin Catalog: Query and moderate content
  const adminCatalogRes = await request('GET', '/api/admin/catalog?status=PUBLISHED', null, adminAuth);
  assert.strictEqual(adminCatalogRes.status, 200);
  assert.ok(adminCatalogRes.data.count > 0, 'Admin catalog must return published items');

  const adminPatchRes = await request('PATCH', '/api/admin/catalog', {
    postId: createdPostId,
    status: 'ARCHIVED',
  }, adminAuth);
  assert.strictEqual(adminPatchRes.status, 200);
  assert.strictEqual(adminPatchRes.data.post.status, 'ARCHIVED');
  console.log('✓ Test 16: Admin Catalog GET & PATCH passed (Moderation verified)');
  passed++;

  // 17. Frontend Routes Verification across all public & panel pages
  const routesToVerify = [
    '/',
    '/explore',
    '/creators',
    '/pricing',
    '/about',
    '/login',
    '/register',
    '/forgot-password',
    '/dashboard',
    '/creator-studio',
    '/admin',
    '/chat',
    '/creator/luna-rae',
    '/creator/ellie',
    '/creator/mia-carter',
    '/creators/mia-carter',
    '/terms',
    '/privacy',
    '/content-policy',
  ];

  for (const route of routesToVerify) {
    const pageRes = await request('GET', route);
    assert.strictEqual(pageRes.status, 200, `Route ${route} must return 200 OK`);
    assert.ok(
      typeof pageRes.data === 'string' && !pageRes.data.includes('Application error'),
      `Route ${route} must render without Next.js application errors`
    );
  }

  const creatorRouteRes = await request('GET', '/creator/mia-carter');
  assert.ok(typeof creatorRouteRes.data === 'string' && creatorRouteRes.data.includes('Mia Carter'));
  const ellieRouteRes = await request('GET', '/creator/ellie');
  assert.ok(typeof ellieRouteRes.data === 'string' && ellieRouteRes.data.includes('Ellie'));
  console.log(`✓ Test 17: All ${routesToVerify.length} Frontend Routes returned 200 OK without errors`);
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
  const newSubAuth = { Authorization: `Bearer ${subRegRes.data.token}` };

  const adminUsersRes = await request('GET', '/api/admin/users', null, adminAuth);
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

  const adminCreatorsRes = await request('GET', '/api/admin/creators', null, adminAuth);
  assert.strictEqual(adminCreatorsRes.status, 200);
  assert.ok(adminCreatorsRes.data.creators.some(c => c.name === 'Elena Live Creator'), 'Registered creator must immediately appear in Admin Creators');
  console.log('✓ Test 18: Newly registered Subscriber & Creator live-synced to Admin Panel');
  passed++;

  // 19. Real Follows, Custom Requests & Admin Overview Analytics
  const followRes = await request('POST', '/api/user/follows', { handle: 'luna-rae' }, newSubAuth);
  assert.strictEqual(followRes.status, 200);
  const followsListRes = await request('GET', '/api/user/follows', null, newSubAuth);
  assert.ok(followsListRes.data.follows.some(f => f.creatorHandle === 'luna-rae'));

  const customReqRes = await request('POST', '/api/custom-requests', {
    creatorHandle: 'luna-rae',
    title: 'VIP Integration Custom Clip',
    price: 40.00,
    paid: true,
  }, newSubAuth);
  assert.strictEqual(customReqRes.status, 200);
  const reqId = customReqRes.data.request.id;

  const deliverRes = await request('PATCH', '/api/custom-requests', {
    requestId: reqId,
    action: 'DELIVER',
    deliveredMediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  }, lunaAuth);
  assert.strictEqual(deliverRes.status, 200);
  assert.strictEqual(deliverRes.data.request.status, 'DELIVERED');

  const adminOverviewRes = await request('GET', '/api/admin/overview', null, adminAuth);
  assert.strictEqual(adminOverviewRes.status, 200);
  assert.ok(adminOverviewRes.data.metrics.totalGross > 0);
  console.log('✓ Test 19: Follows, Custom Request Delivery -> Vault, & Admin Live Overview verified');
  passed++;

  // 20. Ellie Creator Profile, Fetish Category Replacement, & Direct File Upload (/api/upload -> /api/uploads/[filename])
  const allCreatorsRes = await request('GET', '/api/creators');
  assert.strictEqual(allCreatorsRes.status, 200);
  assert.ok(
    !allCreatorsRes.data.creators.some((c) => c.category === 'Travel'),
    'No creator should remain in Travel category'
  );
  assert.ok(
    allCreatorsRes.data.creators.some((c) => c.category === 'Fetish'),
    'Fetish category must be present'
  );

  const ellieCreatorRes = await request('GET', '/api/creators?handle=ellie');
  assert.strictEqual(ellieCreatorRes.status, 200);
  assert.strictEqual(ellieCreatorRes.data.creators[0].handle, 'ellie');
  assert.strictEqual(ellieCreatorRes.data.creators[0].category, 'Fetish');

  const elliePreviewsRes = await request('GET', '/api/content/posts?handle=ellie&previews=true');
  assert.strictEqual(elliePreviewsRes.status, 200);
  assert.strictEqual(elliePreviewsRes.data.counts.photos, 3, 'Ellie must have 3 preview photos');
  assert.strictEqual(elliePreviewsRes.data.counts.videos, 2, 'Ellie must have 2 preview videos');

  const uploadRes = await new Promise((resolve, reject) => {
    const boundary = `----MirageBoundary${Date.now()}`;
    const tinyPng = Buffer.from(
      '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c63000100000500010d0a2db40000000049454e44ae426082',
      'hex'
    );
    const headerPart = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="ellie-test.png"\r\nContent-Type: image/png\r\n\r\n`
    );
    const footerPart = Buffer.from(`\r\n--${boundary}--\r\n`);
    const multipartBody = Buffer.concat([headerPart, tinyPng, footerPart]);

    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/upload',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ellieToken}`,
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': multipartBody.length,
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(raw) }));
      }
    );
    req.on('error', reject);
    req.write(multipartBody);
    req.end();
  });

  assert.strictEqual(uploadRes.status, 200, 'POST /api/upload must succeed');
  assert.strictEqual(uploadRes.data.success, true);
  assert.ok(uploadRes.data.url.startsWith('/api/uploads/'), 'Upload URL must be served from /api/uploads/');

  const servedStatus = await new Promise((resolve, reject) => {
    http
      .get(`http://localhost:${PORT}${uploadRes.data.url}`, (res) => {
        res.resume();
        res.on('end', () => resolve({ status: res.statusCode, contentType: res.headers['content-type'] }));
      })
      .on('error', reject);
  });
  assert.strictEqual(servedStatus.status, 200, 'Uploaded image must immediately stream back');
  assert.ok(servedStatus.contentType.includes('image/png'));

  const uploadedDiskPath = path.join(process.cwd(), 'data', 'uploads', uploadRes.data.filename);
  if (fs.existsSync(uploadedDiskPath)) fs.unlinkSync(uploadedDiskPath);

  console.log('✓ Test 20: Ellie Creator Profile, Fetish Category, & Multipart File Upload/Serve verified');
  passed++;

  // 21. Full Panel CRUD Actions (Edit & Delete across Admin Users, Creators, Catalog, Creator Posts, Custom Requests)
  const tempSubRes = await request('POST', '/api/auth/register', {
    name: 'Temp CRUD Fan',
    username: `tempfan_${Date.now()}`,
    email: `tempfan_${Date.now()}@themirage.vip`,
    password: 'SecretPassword123',
    role: 'SUBSCRIBER',
  });
  assert.strictEqual(tempSubRes.status, 200);
  const tempUserId = tempSubRes.data.user.id;

  const editUserRes = await request('PATCH', '/api/admin/users', {
    userId: tempUserId,
    name: 'Edited CRUD Fan',
    status: 'SUSPENDED',
    bio: 'Updated bio from admin panel',
  }, adminAuth);
  assert.strictEqual(editUserRes.status, 200);
  assert.strictEqual(editUserRes.data.user.name, 'Edited CRUD Fan');
  assert.strictEqual(editUserRes.data.user.status, 'SUSPENDED');

  const delUserRes = await request('DELETE', `/api/admin/users?userId=${encodeURIComponent(tempUserId)}`, null, adminAuth);
  assert.strictEqual(delUserRes.status, 200);
  const adminUsersAfterDel = await request('GET', '/api/admin/users', null, adminAuth);
  assert.ok(!adminUsersAfterDel.data.users.some((u) => u.id === tempUserId), 'Deleted user must be removed');

  const tempCreatorRes = await request('POST', '/api/auth/register', {
    name: 'Temp CRUD Creator',
    username: `tempcreator_${Date.now()}`,
    email: `tempcreator_${Date.now()}@themirage.vip`,
    password: 'SecretPassword123',
    role: 'CREATOR',
    monthlyPrice: 12.99,
  });
  assert.strictEqual(tempCreatorRes.status, 200);
  const tempCreatorId = tempCreatorRes.data.user.id;

  const adminAccount = adminUsersAfterDel.data.users.find((u) => u.role === 'ADMIN');
  assert.ok(adminAccount, 'Seeded Admin account must exist');
  const protectedAdminDel = await request('DELETE', `/api/admin/users?userId=${encodeURIComponent(adminAccount.id)}`, null, adminAuth);
  assert.strictEqual(protectedAdminDel.status, 400, 'Admin accounts must be protected from deletion');

  const editCreatorRes = await request('PATCH', '/api/admin/creators', {
    creatorId: tempCreatorId,
    name: 'Edited CRUD Creator',
    category: 'Fetish',
    monthlyPrice: 24.99,
    isVerified: true,
  }, adminAuth);
  assert.strictEqual(editCreatorRes.status, 200);
  assert.strictEqual(editCreatorRes.data.creator.category, 'Fetish');
  assert.strictEqual(editCreatorRes.data.creator.monthlyPrice, 24.99);
  assert.strictEqual(editCreatorRes.data.creator.isVerified, true);

  const delCreatorRes = await request('DELETE', `/api/admin/creators?creatorId=${encodeURIComponent(tempCreatorId)}`, null, adminAuth);
  assert.strictEqual(delCreatorRes.status, 200);

  // Studio Post Edit + Delete
  const studioPostRes = await request('POST', '/api/content/posts', {
    creatorId: 'c1',
    creatorHandle: 'luna-rae',
    creatorName: 'Luna Rae',
    title: 'Temp Studio Post',
    caption: 'Initial caption',
    mediaType: 'IMAGE',
    mediaUrl: '/api/uploads/sample-test.jpg',
    visibility: 'PURCHASE_ONLY',
    price: 19.0,
  }, lunaAuth);
  assert.strictEqual(studioPostRes.status, 200);
  const tempPostId = studioPostRes.data.post.id;

  const studioEditRes = await request('PATCH', '/api/content/posts', {
    postId: tempPostId,
    creatorId: 'c1',
    updates: { title: 'Edited Studio Post', price: 29.5, status: 'DRAFT' },
  }, lunaAuth);
  assert.strictEqual(studioEditRes.status, 200);
  assert.strictEqual(studioEditRes.data.post.title, 'Edited Studio Post');
  assert.strictEqual(studioEditRes.data.post.price, 29.5);

  const adminCatalogEditRes = await request('PATCH', '/api/admin/catalog', {
    postId: tempPostId,
    updates: { title: 'Admin Moderated Title', status: 'PUBLISHED', price: 33.0 },
  }, adminAuth);
  assert.strictEqual(adminCatalogEditRes.status, 200);
  assert.strictEqual(adminCatalogEditRes.data.post.title, 'Admin Moderated Title');

  const delPostRes = await request('DELETE', `/api/content/posts?postId=${encodeURIComponent(tempPostId)}`, null, lunaAuth);
  assert.strictEqual(delPostRes.status, 200);

  // Custom Order Edit & Delete
  const crudOrderRes = await request('POST', '/api/custom-requests', {
    creatorHandle: 'ellie',
    title: 'Temp Custom Order',
    price: 35.0,
    paid: false,
  }, alexAuth);
  assert.strictEqual(crudOrderRes.status, 200);
  const crudOrderId = crudOrderRes.data.request.id;

  const updateOrderRes = await request('PATCH', '/api/custom-requests', {
    requestId: crudOrderId,
    action: 'UPDATE',
    title: 'Updated Custom Order',
    price: 55.0,
  }, ellieAuth);
  assert.strictEqual(updateOrderRes.status, 200);
  assert.strictEqual(updateOrderRes.data.request.price, 55.0);

  const delOrderRes = await request('DELETE', `/api/custom-requests?requestId=${encodeURIComponent(crudOrderId)}`, null, ellieAuth);
  assert.strictEqual(delOrderRes.status, 200);

  console.log('✓ Test 21: Full Panel CRUD (Edit & Delete across Users, Creators, Catalog, Posts, Custom Orders) verified');
  passed++;

  // 22. Two-Way 1-on-1 Chat (Subscriber <-> Creator) & Dynamic User/Creator Profile + Avatar Updates
  const subChatSend = await request('POST', '/api/chat', {
    creator: 'ellie',
    sender: 'user',
    text: 'Hey Ellie, testing 1-on-1 live chat!',
    mediaUrl: '/api/uploads/chat-photo.jpg',
    mediaType: 'IMAGE',
  }, newSubAuth);
  assert.strictEqual(subChatSend.status, 200);
  assert.strictEqual(subChatSend.data.message.sender, 'user');

  const creatorInboxRes = await request(
    'GET',
    '/api/chat?mode=threads&role=CREATOR',
    null,
    ellieAuth
  );
  assert.strictEqual(creatorInboxRes.status, 200);
  assert.strictEqual(creatorInboxRes.data.mode, 'creator');
  assert.ok(
    creatorInboxRes.data.conversations.some(
      (c) => c.userId === newSubId && c.lastMessage.includes('testing 1-on-1 live chat')
    ),
    'Creator inbox must show subscriber incoming 1-on-1 message'
  );

  const creatorReplyRes = await request('POST', '/api/chat', {
    userId: newSubId,
    creator: 'ellie',
    sender: 'creator',
    text: 'Hey! Received your message in Creator Inbox!',
  }, ellieAuth);
  assert.strictEqual(creatorReplyRes.status, 200);

  const threadVerifyRes = await request('GET', '/api/chat?creator=ellie', null, newSubAuth);
  assert.strictEqual(threadVerifyRes.status, 200);
  assert.strictEqual(threadVerifyRes.data.messages.length, 2, 'Both Subscriber and Creator messages must sync');
  assert.strictEqual(threadVerifyRes.data.messages[1].sender, 'creator');

  const subProfileUpdate = await request('PATCH', '/api/user/profile', {
    name: 'Updated Dynamic Fan',
    bio: 'Dynamic member bio',
    avatar: '/api/uploads/fan-avatar-test.jpg',
    banner: '/api/uploads/fan-banner-test.jpg',
  }, newSubAuth);
  assert.strictEqual(subProfileUpdate.status, 200);
  assert.strictEqual(subProfileUpdate.data.user.avatar, '/api/uploads/fan-avatar-test.jpg');
  assert.strictEqual(subProfileUpdate.data.user.banner, '/api/uploads/fan-banner-test.jpg');

  const getSubProfile = await request('GET', '/api/user/profile', null, newSubAuth);
  assert.strictEqual(getSubProfile.status, 200);
  assert.strictEqual(getSubProfile.data.user.name, 'Updated Dynamic Fan');
  assert.strictEqual(getSubProfile.data.user.avatar, '/api/uploads/fan-avatar-test.jpg');
  assert.strictEqual(getSubProfile.data.user.banner, '/api/uploads/fan-banner-test.jpg');

  const creatorAvatarPatch = await request('PATCH', '/api/creators', {
    avatar: '/api/uploads/ellie-avatar-updated.jpg',
    banner: '/api/uploads/ellie-banner-updated.jpg',
  }, ellieAuth);
  assert.strictEqual(creatorAvatarPatch.status, 200);
  assert.strictEqual(creatorAvatarPatch.data.creator.avatar, '/api/uploads/ellie-avatar-updated.jpg');
  assert.strictEqual(creatorAvatarPatch.data.creator.banner, '/api/uploads/ellie-banner-updated.jpg');

  const ellieUserSyncRes = await request('GET', '/api/user/profile', null, ellieAuth);
  assert.strictEqual(ellieUserSyncRes.status, 200);
  assert.strictEqual(ellieUserSyncRes.data.user.avatar, '/api/uploads/ellie-avatar-updated.jpg');
  assert.strictEqual(ellieUserSyncRes.data.user.banner, '/api/uploads/ellie-banner-updated.jpg');

  const adminOwnProfilePatch = await request('PATCH', '/api/user/profile', {
    avatar: '/api/uploads/admin-avatar.jpg',
    banner: '/api/uploads/admin-banner.jpg',
  }, adminAuth);
  assert.strictEqual(adminOwnProfilePatch.status, 200);
  assert.strictEqual(adminOwnProfilePatch.data.user.avatar, '/api/uploads/admin-avatar.jpg');
  assert.strictEqual(adminOwnProfilePatch.data.user.banner, '/api/uploads/admin-banner.jpg');

  // Public stats + Post Like persistence check
  const creatorsStatsRes = await request('GET', '/api/creators');
  assert.strictEqual(creatorsStatsRes.status, 200);
  assert.ok(creatorsStatsRes.data.stats.totalCreators > 0);
  assert.ok(creatorsStatsRes.data.stats.creatorCommissionPercent > 0);

  const likePostRes = await request('PATCH', '/api/content/posts', {
    postId: 'post-luna-prev-img-1',
    action: 'LIKE',
  });
  assert.strictEqual(likePostRes.status, 200);
  assert.ok(likePostRes.data.post.likeCount > 0);

  console.log('✓ Test 22: Two-Way 1-on-1 Chat & Dynamic User/Creator Profile Avatar Sync verified');
  passed++;

  // 23. Strict Auth Isolation & Zero Profile-Switching Enforcement
  const unauthChecks = await Promise.all([
    request('GET', '/api/auth/me'),
    request('GET', '/api/admin/overview'),
    request('GET', '/api/admin/users'),
    request('GET', '/api/creator/earnings?creatorId=c1'),
    request('GET', '/api/chat?mode=threads'),
    request('GET', '/api/user/purchases'),
    request('GET', '/api/user/profile'),
    request('GET', '/api/content/posts?studio=true&handle=luna-rae'),
  ]);
  for (const res of unauthChecks) {
    assert.strictEqual(res.status, 401, 'Protected endpoint without session must return 401');
  }

  // Subscriber cannot open Admin, Creator Earnings, Creator Studio feed, Creator Inbox, or update Creators
  assert.strictEqual((await request('GET', '/api/admin/overview', null, newSubAuth)).status, 403);
  assert.strictEqual((await request('GET', '/api/creator/earnings?creatorId=c1', null, newSubAuth)).status, 403);
  assert.strictEqual((await request('GET', '/api/content/posts?studio=true&handle=luna-rae', null, newSubAuth)).status, 403);
  assert.strictEqual((await request('GET', '/api/chat?mode=threads&role=CREATOR', null, newSubAuth)).status, 403);
  assert.strictEqual((await request('PATCH', '/api/creators', { handle: 'ellie', monthlyPrice: 55 }, newSubAuth)).status, 403);

  // Subscriber cannot read another subscriber's private chat thread or profile
  assert.strictEqual((await request('GET', '/api/chat?userId=usr-1&creator=luna-rae', null, newSubAuth)).status, 403);
  const subSpoofProf = await request('GET', '/api/user/profile?userId=usr-1', null, newSubAuth);
  assert.strictEqual(subSpoofProf.status, 200);
  assert.strictEqual(subSpoofProf.data.user.id, newSubId, 'Profile GET must strictly return own profile only');

  // Creator Luna cannot switch into Ellie's chat inbox, reply as Ellie, or modify Ellie's creator pricing
  assert.strictEqual((await request('GET', `/api/chat?userId=${encodeURIComponent(newSubId)}&creator=ellie`, null, lunaAuth)).status, 403);
  assert.strictEqual(
    (
      await request(
        'POST',
        '/api/chat',
        { userId: newSubId, creator: 'ellie', sender: 'creator', text: 'Impersonate check' },
        lunaAuth
      )
    ).status,
    403
  );
  const lunaSpoofPatch = await request('PATCH', '/api/creators', { handle: 'ellie', bio: 'Spoof attempt' }, lunaAuth);
  assert.strictEqual(lunaSpoofPatch.status, 200);
  assert.strictEqual(lunaSpoofPatch.data.creator.handle, 'luna-rae', 'Creator PATCH must lock strictly to own creator profile');
  const ellieVerifyAfter = await request('GET', '/api/creators?handle=ellie');
  assert.ok(!ellieVerifyAfter.data.creators[0].bio.includes('Spoof attempt'), 'Ellie profile must remain untouched');

  // Cookie session verification & Logout clearing
  const meCookieRes = await request('GET', '/api/auth/me', null, { Cookie: `mirage_token=${lunaToken}` });
  assert.strictEqual(meCookieRes.status, 200);
  assert.strictEqual(meCookieRes.data.user.creatorHandle, 'luna-rae');

  const logoutRes = await request('POST', '/api/auth/logout');
  assert.strictEqual(logoutRes.status, 200);
  const logoutCookie = [].concat(logoutRes.headers['set-cookie'] || []).join(';');
  assert.ok(logoutCookie.includes('mirage_token=;'), 'Logout must clear mirage_token session cookie');

  console.log('✓ Test 23: Strict Auth Isolation & Zero Profile-Switching Enforcement verified');
  passed++;

  // 24. Admin Full Dynamic Control: Create User/Creator, Update Media, Suspend Filtering, Orders & Subscriptions
  const tempSuffix = Date.now();
  const adminCreateCreator = await request('POST', '/api/admin/creators', {
    name: 'Admin Created Star',
    handle: `adminstar-${tempSuffix}`,
    email: `adminstar-${tempSuffix}@themirage.vip`,
    password: 'CreatorPass123!',
    category: 'Glamour',
    monthlyPrice: 14.99,
    bio: 'Created directly from Admin Panel.',
    avatar: '/api/uploads/adminstar-avatar.jpg',
    banner: '/api/uploads/adminstar-banner.jpg',
    isVerified: true,
  }, adminAuth);
  assert.strictEqual(adminCreateCreator.status, 200, 'Admin POST /api/admin/creators should succeed');
  const createdCreatorId = adminCreateCreator.data.creator.id;
  const createdCreatorHandle = adminCreateCreator.data.creator.handle;
  assert.strictEqual(adminCreateCreator.data.creator.avatar, '/api/uploads/adminstar-avatar.jpg');

  const adminCreateUser = await request('POST', '/api/admin/users', {
    name: 'Admin Created Member',
    username: `adminfan_${tempSuffix}`,
    email: `adminfan-${tempSuffix}@themirage.vip`,
    password: 'MemberPass123!',
    role: 'SUBSCRIBER',
  }, adminAuth);
  assert.strictEqual(adminCreateUser.status, 200, 'Admin POST /api/admin/users should succeed');
  const createdUserId = adminCreateUser.data.user.id;

  // Update avatar/banner and suspend creator
  const adminSuspendCreator = await request('PATCH', '/api/admin/creators', {
    creatorId: createdCreatorId,
    avatar: '/api/uploads/adminstar-avatar-v2.jpg',
    banner: '/api/uploads/adminstar-banner-v2.jpg',
    status: 'SUSPENDED',
  }, adminAuth);
  assert.strictEqual(adminSuspendCreator.status, 200);
  assert.strictEqual(adminSuspendCreator.data.creator.status, 'SUSPENDED');
  assert.strictEqual(adminSuspendCreator.data.creator.avatar, '/api/uploads/adminstar-avatar-v2.jpg');

  // Public creators list must hide suspended creator, while Admin creators & overview still show it
  const pubAfterSuspend = await request('GET', `/api/creators?handle=${encodeURIComponent(createdCreatorHandle)}`);
  assert.strictEqual(pubAfterSuspend.status, 200);
  assert.strictEqual(pubAfterSuspend.data.creators.length, 0, 'Suspended creator must be hidden from public discovery');

  const adminListAfterSuspend = await request('GET', '/api/admin/creators', null, adminAuth);
  assert.strictEqual(adminListAfterSuspend.status, 200);
  assert.ok(adminListAfterSuspend.data.creators.some((c) => c.id === createdCreatorId), 'Admin list must still retain suspended creator');

  // Suspended creator must reject new subscriptions and custom requests
  const blockedSub = await request('POST', '/api/subscriptions/checkout', {
    creatorId: createdCreatorId,
    amount: 14.99,
  }, newSubAuth);
  assert.strictEqual(blockedSub.status, 400, 'Checkout for suspended creator must fail cleanly');

  const blockedOrder = await request('POST', '/api/custom-requests', {
    creatorHandle: createdCreatorHandle,
    title: 'Blocked Suspended Order',
    price: 30,
  }, newSubAuth);
  assert.strictEqual(blockedOrder.status, 400, 'Custom request for suspended creator must fail cleanly');

  // Reactivate creator -> test custom order & subscription management via Admin
  const adminReactivate = await request('PATCH', '/api/admin/creators', {
    creatorId: createdCreatorId,
    status: 'ACTIVE',
  }, adminAuth);
  assert.strictEqual(adminReactivate.status, 200);
  assert.strictEqual(adminReactivate.data.creator.status, 'ACTIVE');

  const subActiveRes = await request('POST', '/api/subscriptions/checkout', {
    creatorId: createdCreatorId,
    amount: 14.99,
  }, newSubAuth);
  assert.strictEqual(subActiveRes.status, 200);

  const adminSubsList = await request('GET', '/api/admin/subscriptions', null, adminAuth);
  assert.strictEqual(adminSubsList.status, 200);
  const matchingSub = adminSubsList.data.subscriptions.find((s) => s.creatorId === createdCreatorId);
  assert.ok(matchingSub, 'Admin subscriptions endpoint must list active subscription');

  const adminCancelSub = await request('PATCH', '/api/admin/subscriptions', {
    subscriptionId: matchingSub.id,
    status: 'CANCELLED',
  }, adminAuth);
  assert.strictEqual(adminCancelSub.status, 200);
  assert.strictEqual(adminCancelSub.data.subscription.status, 'CANCELLED');

  const adminOrderCreate = await request('POST', '/api/custom-requests', {
    creatorHandle: createdCreatorHandle,
    customerId: createdUserId,
    title: 'Admin Managed Order',
    price: 45,
    paid: true,
  }, adminAuth);
  assert.strictEqual(adminOrderCreate.status, 200);
  const adminOrderId = adminOrderCreate.data.request.id;

  const adminOrderDeliver = await request('PATCH', '/api/custom-requests', {
    requestId: adminOrderId,
    action: 'DELIVER',
    deliveredMediaUrl: '/api/uploads/admin-delivered.mp4',
  }, adminAuth);
  assert.strictEqual(adminOrderDeliver.status, 200);
  assert.strictEqual(adminOrderDeliver.data.request.status, 'DELIVERED');

  const adminEditUserMedia = await request('PATCH', '/api/admin/users', {
    userId: createdUserId,
    avatar: '/api/uploads/edited-user-avatar.jpg',
    banner: '/api/uploads/edited-user-banner.jpg',
  }, adminAuth);
  assert.strictEqual(adminEditUserMedia.status, 200);
  assert.strictEqual(adminEditUserMedia.data.user.avatar, '/api/uploads/edited-user-avatar.jpg');
  assert.strictEqual(adminEditUserMedia.data.user.banner, '/api/uploads/edited-user-banner.jpg');

  // Cleanup temp records
  await request('DELETE', `/api/custom-requests?requestId=${encodeURIComponent(adminOrderId)}`, null, adminAuth);
  await request('DELETE', `/api/admin/subscriptions?subscriptionId=${encodeURIComponent(matchingSub.id)}`, null, adminAuth);
  assert.strictEqual((await request('DELETE', `/api/admin/creators?creatorId=${encodeURIComponent(createdCreatorId)}`, null, adminAuth)).status, 200);
  assert.strictEqual((await request('DELETE', `/api/admin/users?userId=${encodeURIComponent(createdUserId)}`, null, adminAuth)).status, 200);

  console.log('✓ Test 24: Admin Full Dynamic Management, Suspension Filtering, Orders & Subscriptions verified');
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
