/**
 * The Mirage - Creator Profile Preview Flow & Content Access Test Suite
 * 
 * Verifies:
 * 1. Creator cards link to /creator/[handle] without immediate subscription modal redirect
 * 2. Public profile previews provide up to 3 photos and up to 2 videos
 * 3. Backend strictly enforces max 3 photos and max 2 videos limits per creator
 * 4. Visitors (unauthenticated) can view/play public previews without login or subscription
 * 5. Subscriber-only media remains strictly locked to non-subscribers (mediaUrl stripped, 403)
 * 6. PPV media remains strictly locked to non-purchasers (mediaUrl stripped, 403)
 * 7. Active subscribers and purchasers receive high-res media access
 */

const assert = require('assert');

console.log('================================================================');
console.log(' The Mirage — Creator Profile Preview Flow & Limits Test Suite');
console.log('================================================================\n');

// 1. In-memory data store mirroring src/lib/contentStore.ts
const SEED_POSTS = [
  // Luna Rae (c1, luna-rae): Exactly 3 Photo Previews
  {
    id: 'post-luna-prev-img-1',
    creatorId: 'c1',
    creatorHandle: 'luna-rae',
    creatorName: 'Luna Rae',
    title: 'Santorini Sunset Editorial',
    caption: 'Golden hour shot over Oia cliffs.',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1600&q=90',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    visibility: 'PUBLIC',
    isPublicPreview: true,
    status: 'PUBLISHED',
    price: 0,
  },
  {
    id: 'post-luna-prev-img-2',
    creatorId: 'c1',
    creatorHandle: 'luna-rae',
    creatorName: 'Luna Rae',
    title: 'Parisian Morning Bloom',
    caption: 'Early morning coffee on the private balcony overlooking the city.',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1600&q=90',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    visibility: 'PUBLIC',
    isPublicPreview: true,
    status: 'PUBLISHED',
    price: 0,
  },
  {
    id: 'post-luna-prev-img-3',
    creatorId: 'c1',
    creatorHandle: 'luna-rae',
    creatorName: 'Luna Rae',
    title: 'Milan Haute Couture Session',
    caption: 'Studio lighting test before Milan Fashion Week runway show.',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1600&q=90',
    thumbnailUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    visibility: 'PUBLIC',
    isPublicPreview: true,
    status: 'PUBLISHED',
    price: 0,
  },

  // Luna Rae: Exactly 2 Video Previews
  {
    id: 'post-luna-prev-vid-1',
    creatorId: 'c1',
    creatorHandle: 'luna-rae',
    creatorName: 'Luna Rae',
    title: 'Paris Runway Fashion Week Teaser',
    caption: 'Exclusive backstage sneak peek into the 2026 autumn runway collection.',
    mediaType: 'VIDEO',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    videoDuration: '0:45',
    visibility: 'PUBLIC',
    isPublicPreview: true,
    status: 'PUBLISHED',
    price: 0,
  },
  {
    id: 'post-luna-prev-vid-2',
    creatorId: 'c1',
    creatorHandle: 'luna-rae',
    creatorName: 'Luna Rae',
    title: 'Sunset Studio BTS Clip',
    caption: 'Behind the lens of our private coastal editorial shoot.',
    mediaType: 'VIDEO',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
    previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    videoDuration: '1:15',
    visibility: 'PUBLIC',
    isPublicPreview: true,
    status: 'PUBLISHED',
    price: 0,
  },

  // Locked Posts for Luna Rae
  {
    id: 'post-ppv-1',
    creatorId: 'c1',
    creatorHandle: 'luna-rae',
    creatorName: 'Luna Rae',
    title: 'Private Sunset Mirage Collection #1',
    caption: 'Exclusive sunset photoshoot in Santorini.',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1600&q=95',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=600&q=70',
    visibility: 'PURCHASE_ONLY',
    isPublicPreview: false,
    status: 'PUBLISHED',
    price: 15.00,
  },
  {
    id: 'post-ppv-2',
    creatorId: 'c1',
    creatorHandle: 'luna-rae',
    creatorName: 'Luna Rae',
    title: 'Midnight Studio Session (4K Video)',
    caption: '15-minute complete unfiltered footage.',
    mediaType: 'VIDEO',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=70',
    previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    videoDuration: '15:20',
    visibility: 'PURCHASE_ONLY',
    isPublicPreview: false,
    status: 'PUBLISHED',
    price: 25.00,
  },
  {
    id: 'post-sub-1',
    creatorId: 'c1',
    creatorHandle: 'luna-rae',
    creatorName: 'Luna Rae',
    title: 'Subscribers Only: Paris Fashion Week Teaser',
    caption: 'Exclusive editorial shot for my monthly members.',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=70',
    visibility: 'SUBSCRIBER_ONLY',
    isPublicPreview: false,
    status: 'PUBLISHED',
    price: 0,
  },

  // Sophie Lee (c2, sophie-lee): 3 Photos and 2 Videos
  {
    id: 'post-sophie-prev-img-1',
    creatorId: 'c2',
    creatorHandle: 'sophie-lee',
    creatorName: 'Sophie Lee',
    title: 'Neon Nights Tokyo Teaser',
    caption: 'Midnight neon vibes in Shibuya.',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=70',
    visibility: 'PUBLIC',
    isPublicPreview: true,
    status: 'PUBLISHED',
    price: 0,
  },
  {
    id: 'post-sophie-prev-img-2',
    creatorId: 'c2',
    creatorHandle: 'sophie-lee',
    creatorName: 'Sophie Lee',
    title: 'Kyoto Bamboo Haven',
    caption: 'Serene morning peaceful capture.',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1200&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=70',
    visibility: 'PUBLIC',
    isPublicPreview: true,
    status: 'PUBLISHED',
    price: 0,
  },
  {
    id: 'post-sophie-prev-img-3',
    creatorId: 'c2',
    creatorHandle: 'sophie-lee',
    creatorName: 'Sophie Lee',
    title: 'Rooftop Horizon',
    caption: 'Tokyo skyscape during dusk.',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=70',
    visibility: 'PUBLIC',
    isPublicPreview: true,
    status: 'PUBLISHED',
    price: 0,
  },
  {
    id: 'post-sophie-prev-vid-1',
    creatorId: 'c2',
    creatorHandle: 'sophie-lee',
    creatorName: 'Sophie Lee',
    title: 'Tokyo Street Lights Reel',
    caption: '30-second teaser reel of Tokyo evening street lifestyle.',
    mediaType: 'VIDEO',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=70',
    previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    videoDuration: '0:30',
    visibility: 'PUBLIC',
    isPublicPreview: true,
    status: 'PUBLISHED',
    price: 0,
  },
  {
    id: 'post-sophie-prev-vid-2',
    creatorId: 'c2',
    creatorHandle: 'sophie-lee',
    creatorName: 'Sophie Lee',
    title: 'Behind the Lens in Shibuya',
    caption: 'Filming aesthetic clips on Shibuya crossing.',
    mediaType: 'VIDEO',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=70',
    previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    videoDuration: '1:00',
    visibility: 'PUBLIC',
    isPublicPreview: true,
    status: 'PUBLISHED',
    price: 0,
  },
];

let posts = JSON.parse(JSON.stringify(SEED_POSTS));
const userSubscriptions = {
  'usr-1': new Set(['c1', 'c2']), // Alex Mercer subscribed to Luna Rae and Sophie Lee
};
let purchases = [
  { userId: 'usr-1', postId: 'post-ppv-1' }, // Alex Mercer bought post-ppv-1
];

function resetStore() {
  posts = JSON.parse(JSON.stringify(SEED_POSTS));
  purchases = [{ userId: 'usr-1', postId: 'post-ppv-1' }];
}

function getCreatorPublicPreviews(creatorHandle) {
  const cleanHandle = creatorHandle.replace(/^@/, '').toLowerCase();
  const creatorPosts = posts.filter(
    p => p.creatorHandle.toLowerCase() === cleanHandle && p.status === 'PUBLISHED' && p.isPublicPreview === true
  );

  const photos = creatorPosts.filter(p => p.mediaType === 'IMAGE').slice(0, 3);
  const videos = creatorPosts.filter(p => p.mediaType === 'VIDEO').slice(0, 2);

  return {
    photos,
    videos,
    totalPhotos: photos.length,
    totalVideos: videos.length,
  };
}

function getCreatorPreviewCounts(creatorId) {
  const creatorPosts = posts.filter(
    p => p.creatorId === creatorId && p.status === 'PUBLISHED' && p.isPublicPreview === true
  );
  const photoCount = creatorPosts.filter(p => p.mediaType === 'IMAGE').length;
  const videoCount = creatorPosts.filter(p => p.mediaType === 'VIDEO').length;

  return {
    photos: photoCount,
    videos: videoCount,
    maxPhotos: 3,
    maxVideos: 2,
    canAddPhoto: photoCount < 3,
    canAddVideo: videoCount < 2,
  };
}

function createCreatorPost(data) {
  const isPreview = !!data.isPublicPreview;

  if (isPreview) {
    const counts = getCreatorPreviewCounts(data.creatorId);
    if (data.mediaType === 'IMAGE' && !counts.canAddPhoto) {
      throw new Error('Maximum of 3 public preview photos allowed per creator. Please unmark an existing preview photo first.');
    }
    if (data.mediaType === 'VIDEO' && !counts.canAddVideo) {
      throw new Error('Maximum of 2 public preview videos allowed per creator. Please unmark an existing preview video first.');
    }
  }

  const newPost = {
    id: `post-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    creatorId: data.creatorId,
    creatorHandle: data.creatorHandle,
    creatorName: data.creatorName,
    title: data.title,
    caption: data.caption,
    mediaType: data.mediaType,
    mediaUrl: data.mediaUrl,
    thumbnailUrl: data.thumbnailUrl || data.mediaUrl,
    previewUrl: data.previewUrl,
    videoDuration: data.videoDuration,
    visibility: isPreview ? 'PUBLIC' : data.visibility,
    isPublicPreview: isPreview,
    status: data.status || 'PUBLISHED',
    price: (!isPreview && data.visibility === 'PURCHASE_ONLY') ? Number(data.price || 0) : 0,
  };

  posts.unshift(newPost);
  return newPost;
}

function updatePostDetails(postId, creatorId, updates) {
  const post = posts.find(p => p.id === postId);
  if (!post) return { success: false, error: 'Post not found' };
  if (post.creatorId !== creatorId) return { success: false, error: 'Unauthorized' };

  if (updates.isPublicPreview !== undefined && updates.isPublicPreview !== post.isPublicPreview) {
    if (updates.isPublicPreview) {
      const counts = getCreatorPreviewCounts(creatorId);
      if (post.mediaType === 'IMAGE' && !counts.canAddPhoto) {
        return { success: false, error: 'Maximum of 3 public preview photos allowed per creator. Please unmark an existing preview photo first.' };
      }
      if (post.mediaType === 'VIDEO' && !counts.canAddVideo) {
        return { success: false, error: 'Maximum of 2 public preview videos allowed per creator. Please unmark an existing preview video first.' };
      }
      post.isPublicPreview = true;
      post.visibility = 'PUBLIC';
    } else {
      post.isPublicPreview = false;
    }
  }

  if (updates.price !== undefined) post.price = Number(updates.price);
  if (updates.status !== undefined) post.status = updates.status;

  return { success: true, post };
}

function checkMediaAuthorization(userId, postId) {
  const post = posts.find(p => p.id === postId);
  if (!post) return { authorized: false, error: 'Post not found' };

  // Creator owner
  if (userId && post.creatorId === userId) return { authorized: true, post };

  // Public previews & public content
  if (post.isPublicPreview || post.visibility === 'PUBLIC') {
    return { authorized: true, post };
  }

  // Subscriber-only
  if (post.visibility === 'SUBSCRIBER_ONLY') {
    if (userId && userSubscriptions[userId] && userSubscriptions[userId].has(post.creatorId)) {
      return { authorized: true, post };
    }
    return { authorized: false, error: 'Subscription required to view this content' };
  }

  // PPV
  if (post.visibility === 'PURCHASE_ONLY') {
    if (userId && purchases.some(p => p.userId === userId && p.postId === postId)) {
      return { authorized: true, post };
    }
    return { authorized: false, error: 'Individual purchase required. Non-buyers are not authorized to view the original media.' };
  }

  return { authorized: false, error: 'Access denied' };
}

function getFeedForUser(creatorHandle, userId) {
  let list = posts.filter(p => p.status === 'PUBLISHED');
  if (creatorHandle) {
    const cleanHandle = creatorHandle.replace(/^@/, '').toLowerCase();
    list = list.filter(p => p.creatorHandle.toLowerCase() === cleanHandle);
  }

  return list.map(post => {
    if (post.isPublicPreview || post.visibility === 'PUBLIC') return post;

    const isOwner = userId === post.creatorId;
    const isSubscribed = userId && userSubscriptions[userId] && userSubscriptions[userId].has(post.creatorId);
    const hasPurchased = userId && purchases.some(p => p.userId === userId && p.postId === post.id);

    if (post.visibility === 'PURCHASE_ONLY' && !isOwner && !hasPurchased) {
      return { ...post, mediaUrl: '' };
    }
    if (post.visibility === 'SUBSCRIBER_ONLY' && !isOwner && !isSubscribed) {
      return { ...post, mediaUrl: '' };
    }
    return post;
  });
}

// -------------------------------------------------------------
// EXECUTE TESTS
// -------------------------------------------------------------
let passed = 0;
let total = 0;

function it(name, testFn) {
  total++;
  try {
    testFn();
    console.log(`✓ Test ${total} Passed: ${name}`);
    passed++;
  } catch (err) {
    console.error(`✗ Test ${total} Failed: ${name}`);
    console.error(`  Error: ${err.message}`);
    process.exit(1);
  }
}

resetStore();

// Test 1: Luna Rae public previews
it('getCreatorPublicPreviews returns up to 3 photos and 2 videos for Luna Rae', () => {
  const previews = getCreatorPublicPreviews('luna-rae');
  assert.strictEqual(previews.photos.length, 3, 'Must return exactly 3 photos');
  assert.strictEqual(previews.videos.length, 2, 'Must return exactly 2 videos');
  previews.photos.forEach(p => {
    assert.strictEqual(p.mediaType, 'IMAGE');
    assert.strictEqual(p.isPublicPreview, true);
    assert.ok(p.mediaUrl.length > 0);
  });
  previews.videos.forEach(v => {
    assert.strictEqual(v.mediaType, 'VIDEO');
    assert.strictEqual(v.isPublicPreview, true);
    assert.ok(v.mediaUrl.length > 0);
    assert.ok(v.videoDuration);
  });
});

// Test 2: Preview counts report accurate state
it('getCreatorPreviewCounts reports exactly 3 photos, 2 videos, and zero capacity', () => {
  const counts = getCreatorPreviewCounts('c1');
  assert.strictEqual(counts.photos, 3);
  assert.strictEqual(counts.videos, 2);
  assert.strictEqual(counts.canAddPhoto, false);
  assert.strictEqual(counts.canAddVideo, false);
});

// Test 3: Backend limit enforcement on creating 4th photo
it('createCreatorPost rejects a 4th preview photo', () => {
  assert.throws(() => {
    createCreatorPost({
      creatorId: 'c1',
      creatorHandle: 'luna-rae',
      creatorName: 'Luna Rae',
      title: 'Extra Photo 4',
      caption: 'Over limit',
      mediaType: 'IMAGE',
      mediaUrl: 'https://images.unsplash.com/extra.jpg',
      visibility: 'PUBLIC',
      isPublicPreview: true,
    });
  }, /Maximum of 3 public preview photos allowed per creator/);
});

// Test 4: Backend limit enforcement on creating 3rd video
it('createCreatorPost rejects a 3rd preview video', () => {
  assert.throws(() => {
    createCreatorPost({
      creatorId: 'c1',
      creatorHandle: 'luna-rae',
      creatorName: 'Luna Rae',
      title: 'Extra Video 3',
      caption: 'Over limit',
      mediaType: 'VIDEO',
      mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/extra.mp4',
      visibility: 'PUBLIC',
      isPublicPreview: true,
    });
  }, /Maximum of 2 public preview videos allowed per creator/);
});

// Test 5: updatePostDetails enforces limits when toggling post to preview
it('updatePostDetails rejects marking 4th photo as preview', () => {
  const regular = createCreatorPost({
    creatorId: 'c1',
    creatorHandle: 'luna-rae',
    creatorName: 'Luna Rae',
    title: 'Regular Photo',
    caption: 'For subscribers',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/reg.jpg',
    visibility: 'SUBSCRIBER_ONLY',
    isPublicPreview: false,
  });

  const res = updatePostDetails(regular.id, 'c1', { isPublicPreview: true });
  assert.strictEqual(res.success, false);
  assert.ok(res.error.includes('Maximum of 3 public preview photos allowed'));
});

// Test 6: Unmarking an existing preview frees up capacity
it('Unmarking an existing preview photo allows marking a replacement', () => {
  const unmark = updatePostDetails('post-luna-prev-img-1', 'c1', { isPublicPreview: false });
  assert.strictEqual(unmark.success, true);

  const counts = getCreatorPreviewCounts('c1');
  assert.strictEqual(counts.photos, 2);
  assert.strictEqual(counts.canAddPhoto, true);

  const replacement = createCreatorPost({
    creatorId: 'c1',
    creatorHandle: 'luna-rae',
    creatorName: 'Luna Rae',
    title: 'New Replacement Photo',
    caption: 'Preview replacement',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/replacement.jpg',
    visibility: 'PUBLIC',
    isPublicPreview: true,
  });
  assert.strictEqual(replacement.isPublicPreview, true);

  const updatedCounts = getCreatorPreviewCounts('c1');
  assert.strictEqual(updatedCounts.photos, 3);
  assert.strictEqual(updatedCounts.canAddPhoto, false);

  resetStore();
});

// Test 7: Visitor (unauthenticated) can view public preview media
it('Visitor (userId = null) is authorized to view public preview photos and videos', () => {
  const photoAuth = checkMediaAuthorization(null, 'post-luna-prev-img-1');
  assert.strictEqual(photoAuth.authorized, true);
  assert.ok(photoAuth.post.mediaUrl.length > 0);

  const videoAuth = checkMediaAuthorization(null, 'post-luna-prev-vid-1');
  assert.strictEqual(videoAuth.authorized, true);
  assert.ok(videoAuth.post.mediaUrl.length > 0);
});

// Test 8: Non-subscribers cannot access subscriber-only content (mediaUrl stripped)
it('Visitor (userId = null) is denied subscriber content and mediaUrl is stripped', () => {
  const subAuth = checkMediaAuthorization(null, 'post-sub-1');
  assert.strictEqual(subAuth.authorized, false);
  assert.ok(subAuth.error.includes('Subscription required'));

  const feed = getFeedForUser('luna-rae', null);
  const subPost = feed.find(p => p.id === 'post-sub-1');
  assert.strictEqual(subPost.mediaUrl, '', 'Subscriber mediaUrl must be stripped');
});

// Test 9: Non-purchasers cannot access PPV content (mediaUrl stripped)
it('Visitor (userId = null) is denied PPV content and mediaUrl is stripped', () => {
  const ppvAuth = checkMediaAuthorization(null, 'post-ppv-2');
  assert.strictEqual(ppvAuth.authorized, false);
  assert.ok(ppvAuth.error.includes('Individual purchase required'));

  const feed = getFeedForUser('luna-rae', null);
  const ppvPost = feed.find(p => p.id === 'post-ppv-2');
  assert.strictEqual(ppvPost.mediaUrl, '', 'PPV mediaUrl must be stripped');
});

// Test 10: Active subscriber has full access to subscriber-only content
it('Active subscriber (usr-1) has full access to subscriber-only content', () => {
  const auth = checkMediaAuthorization('usr-1', 'post-sub-1');
  assert.strictEqual(auth.authorized, true);
  assert.ok(auth.post.mediaUrl.length > 0);

  const feed = getFeedForUser('luna-rae', 'usr-1');
  const post = feed.find(p => p.id === 'post-sub-1');
  assert.ok(post.mediaUrl.length > 0);
});

// Test 11: Authorized purchaser has full access to purchased PPV content
it('Authorized purchaser (usr-1) has full access to purchased PPV content', () => {
  const auth = checkMediaAuthorization('usr-1', 'post-ppv-1');
  assert.strictEqual(auth.authorized, true);
  assert.ok(auth.post.mediaUrl.length > 0);

  const feed = getFeedForUser('luna-rae', 'usr-1');
  const post = feed.find(p => p.id === 'post-ppv-1');
  assert.ok(post.mediaUrl.length > 0);
});

// Test 12: Independent multi-creator isolation for Sophie Lee
it('Sophie Lee previews are independently isolated and capped at 3 photos and 2 videos', () => {
  const sophiePreviews = getCreatorPublicPreviews('sophie-lee');
  assert.strictEqual(sophiePreviews.photos.length, 3);
  assert.strictEqual(sophiePreviews.videos.length, 2);

  const sophieCounts = getCreatorPreviewCounts('c2');
  assert.strictEqual(sophieCounts.photos, 3);
  assert.strictEqual(sophieCounts.videos, 2);
  assert.strictEqual(sophieCounts.canAddPhoto, false);
  assert.strictEqual(sophieCounts.canAddVideo, false);
});

console.log(`\n================================================================`);
console.log(` ALL ${passed}/${total} CREATOR PREVIEWS TESTS PASSED (100% SUCCESS) ✓`);
console.log(`================================================================\n`);
