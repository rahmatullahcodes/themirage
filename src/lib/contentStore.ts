// In-memory persistent content & transactions store for The Mirage Phase 1 PPV & Subscriptions
export type MediaType = 'IMAGE' | 'VIDEO' | 'AUDIO';
export type Visibility = 'PUBLIC' | 'SUBSCRIBER_ONLY' | 'PURCHASE_ONLY';
export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type TransactionType = 'SUBSCRIPTION' | 'CUSTOM_CONTENT' | 'INDIVIDUAL_CONTENT' | 'TIP';

export interface PostItem {
  id: string;
  creatorId: string;
  creatorHandle: string;
  creatorName: string;
  creatorAvatar: string;
  title: string;
  caption: string;
  mediaType: MediaType;
  mediaUrl: string; // Original high-res or video URL - protected!
  thumbnailUrl: string; // Preview/thumbnail image (blurred/watermarked for PPV)
  previewUrl?: string; // Short preview if video
  visibility: Visibility;
  status: PostStatus;
  price: number;
  likeCount: number;
  salesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseRecord {
  id: string;
  userId: string;
  postId?: string;
  customRequestId?: string;
  title: string;
  creatorId: string;
  creatorName: string;
  creatorHandle: string;
  mediaType: MediaType;
  accessUrl: string; // High-res access URL verified
  thumbnailUrl: string;
  price: number;
  purchasedAt: string;
}

export interface TransactionRecord {
  id: string;
  transactionReference: string;
  userId: string;
  userName: string;
  creatorId?: string;
  creatorName?: string;
  postId?: string;
  postTitle?: string;
  type: TransactionType;
  grossAmount: number;
  creatorShare: number;
  platformShare: number;
  feeAmount: number;
  currency: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED';
  paymentGateway: string;
  gatewayReference: string;
  createdAt: string;
}

// Initial seed posts with individual paid images & videos
let posts: PostItem[] = [
  {
    id: 'post-ppv-1',
    creatorId: 'c1',
    creatorHandle: 'luna-rae',
    creatorName: 'Luna Rae',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    title: 'Private Sunset Mirage Collection #1',
    caption: 'Exclusive sunset cinematic photoshoot captured in Santorini. High-res RAW detail.',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1600&q=95',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=600&q=70',
    visibility: 'PURCHASE_ONLY',
    status: 'PUBLISHED',
    price: 15.00,
    likeCount: 142,
    salesCount: 28,
    createdAt: '2026-10-24T14:30:00Z',
    updatedAt: '2026-10-24T14:30:00Z',
  },
  {
    id: 'post-ppv-2',
    creatorId: 'c1',
    creatorHandle: 'luna-rae',
    creatorName: 'Luna Rae',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    title: 'Behind the Scenes — Midnight Studio Session (4K Video)',
    caption: '15-minute complete unfiltered 4K footage from my midnight creative session.',
    mediaType: 'VIDEO',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=70',
    previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    visibility: 'PURCHASE_ONLY',
    status: 'PUBLISHED',
    price: 25.00,
    likeCount: 89,
    salesCount: 19,
    createdAt: '2026-10-26T18:15:00Z',
    updatedAt: '2026-10-26T18:15:00Z',
  },
  {
    id: 'post-sub-1',
    creatorId: 'c1',
    creatorHandle: 'luna-rae',
    creatorName: 'Luna Rae',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    title: 'Subscribers Only: Paris Fashion Week Teaser',
    caption: 'Exclusive editorial shot for my monthly members.',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=70',
    visibility: 'SUBSCRIBER_ONLY',
    status: 'PUBLISHED',
    price: 0,
    likeCount: 215,
    salesCount: 0,
    createdAt: '2026-10-20T10:00:00Z',
    updatedAt: '2026-10-20T10:00:00Z',
  },
  {
    id: 'post-pub-1',
    creatorId: 'c1',
    creatorHandle: 'luna-rae',
    creatorName: 'Luna Rae',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    title: 'Golden Hour Greetings',
    caption: 'Welcome to my official Mirage channel! New drop tomorrow.',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1200&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=70',
    visibility: 'PUBLIC',
    status: 'PUBLISHED',
    price: 0,
    likeCount: 420,
    salesCount: 0,
    createdAt: '2026-10-18T09:00:00Z',
    updatedAt: '2026-10-18T09:00:00Z',
  },
  {
    id: 'post-ppv-3',
    creatorId: 'c2',
    creatorHandle: 'sophie-lee',
    creatorName: 'Sophie Lee',
    creatorAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    title: 'Neon Nights — Tokyo Rooftop Film',
    caption: 'Cinematic 4K Tokyo session. 8 minutes of visual aesthetics.',
    mediaType: 'VIDEO',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=70',
    previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    visibility: 'PURCHASE_ONLY',
    status: 'PUBLISHED',
    price: 20.00,
    likeCount: 95,
    salesCount: 14,
    createdAt: '2026-10-25T11:00:00Z',
    updatedAt: '2026-10-25T11:00:00Z',
  },
];

// Initial user purchases
let purchases: PurchaseRecord[] = [
  {
    id: 'pur-seed-1',
    userId: 'usr-1', // Default logged-in subscriber Alex Mercer
    postId: 'post-ppv-1',
    title: 'Private Sunset Mirage Collection #1',
    creatorId: 'c1',
    creatorName: 'Luna Rae',
    creatorHandle: 'luna-rae',
    mediaType: 'IMAGE',
    accessUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1600&q=95',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=600&q=70',
    price: 15.00,
    purchasedAt: '2026-10-25T16:20:00Z',
  },
];

// Active subscriptions store (userId -> Set of creatorIds)
const userSubscriptions: Record<string, Set<string>> = {
  'usr-1': new Set(['c1', 'c2']), // Subscribed to Luna Rae and Sophie Lee
};

// Initial transactions
let transactions: TransactionRecord[] = [
  {
    id: 'tx-1001',
    transactionReference: 'MIRAGE_SUB_9941',
    userId: 'usr-1',
    userName: 'Alex Mercer',
    creatorId: 'c1',
    creatorName: 'Luna Rae',
    type: 'SUBSCRIPTION',
    grossAmount: 9.99,
    creatorShare: 8.49,
    platformShare: 1.50,
    feeAmount: 0.0,
    currency: 'USD',
    status: 'SUCCESS',
    paymentGateway: 'MIRAGE_PAY',
    gatewayReference: 'gw_sub_9941',
    createdAt: '2026-10-21T11:45:00Z',
  },
  {
    id: 'tx-1002',
    transactionReference: 'MIRAGE_CUST_8832',
    userId: 'usr-1',
    userName: 'Alex Mercer',
    creatorId: 'c1',
    creatorName: 'Luna Rae',
    type: 'CUSTOM_CONTENT',
    grossAmount: 45.00,
    creatorShare: 38.25,
    platformShare: 6.75,
    feeAmount: 0.0,
    currency: 'USD',
    status: 'SUCCESS',
    paymentGateway: 'MIRAGE_PAY',
    gatewayReference: 'gw_cust_8832',
    createdAt: '2026-10-20T14:10:00Z',
  },
  {
    id: 'tx-1003',
    transactionReference: 'MIRAGE_PPV_7721',
    userId: 'usr-1',
    userName: 'Alex Mercer',
    creatorId: 'c1',
    creatorName: 'Luna Rae',
    postId: 'post-ppv-1',
    postTitle: 'Private Sunset Mirage Collection #1',
    type: 'INDIVIDUAL_CONTENT',
    grossAmount: 15.00,
    creatorShare: 12.75,
    platformShare: 2.25,
    feeAmount: 0.0,
    currency: 'USD',
    status: 'SUCCESS',
    paymentGateway: 'MIRAGE_PAY',
    gatewayReference: 'gw_ppv_7721',
    createdAt: '2026-10-25T16:20:00Z',
  },
];

// Helper: check if user is active subscriber
export function isUserSubscribedToCreator(userId: string | null | undefined, creatorId: string): boolean {
  if (!userId) return false;
  return !!userSubscriptions[userId]?.has(creatorId);
}

// Helper: check if user has purchased a specific post
export function hasUserPurchasedPost(userId: string | null | undefined, postId: string): boolean {
  if (!userId) return false;
  return purchases.some(p => p.userId === userId && p.postId === postId);
}

// Media Security: Check access authorization
export function checkMediaAuthorization(
  userId: string | null | undefined,
  postId: string
): { authorized: boolean; post?: PostItem; error?: string } {
  const post = posts.find(p => p.id === postId);
  if (!post) {
    return { authorized: false, error: 'Post not found' };
  }

  // Creator can always access their own content
  if (userId && post.creatorId === userId) {
    return { authorized: true, post };
  }

  // Public posts are available to anyone
  if (post.visibility === 'PUBLIC') {
    return { authorized: true, post };
  }

  // Subscriber-only posts require active subscription
  if (post.visibility === 'SUBSCRIBER_ONLY') {
    if (isUserSubscribedToCreator(userId, post.creatorId)) {
      return { authorized: true, post };
    }
    return { authorized: false, error: 'Subscription required to view this content' };
  }

  // PURCHASE_ONLY requires explicit individual purchase
  if (post.visibility === 'PURCHASE_ONLY') {
    if (hasUserPurchasedPost(userId, postId)) {
      return { authorized: true, post };
    }
    return {
      authorized: false,
      error: 'Individual purchase required. Non-buyers are not authorized to view the original media.',
    };
  }

  return { authorized: false, error: 'Access denied' };
}

// Feed retrieval: Enforce strict URL protection for non-buyers
export function getFeedForUser(creatorHandle?: string, userId?: string | null): PostItem[] {
  let list = posts.filter(p => p.status === 'PUBLISHED');

  if (creatorHandle) {
    list = list.filter(p => p.creatorHandle.toLowerCase() === creatorHandle.toLowerCase());
  }

  return list.map(post => {
    const isOwner = userId === post.creatorId;
    const isSubscribed = isUserSubscribedToCreator(userId, post.creatorId);
    const hasPurchased = hasUserPurchasedPost(userId, post.id);

    // If locked, NEVER return original full-resolution mediaUrl!
    if (post.visibility === 'PURCHASE_ONLY' && !isOwner && !hasPurchased) {
      return {
        ...post,
        mediaUrl: '', // Stripped completely for security
        thumbnailUrl: post.thumbnailUrl, // Low-res preview/thumbnail
      };
    }

    if (post.visibility === 'SUBSCRIBER_ONLY' && !isOwner && !isSubscribed) {
      return {
        ...post,
        mediaUrl: '',
        thumbnailUrl: post.thumbnailUrl,
      };
    }

    return post;
  });
}

// Purchase individual content (PPV)
export function purchaseIndividualContent(params: {
  userId: string;
  userName?: string;
  postId: string;
}): { success: boolean; purchase?: PurchaseRecord; transaction?: TransactionRecord; error?: string } {
  const { userId, userName = 'Subscriber', postId } = params;

  const post = posts.find(p => p.id === postId);
  if (!post) {
    return { success: false, error: 'Content not found' };
  }

  if (post.status !== 'PUBLISHED') {
    return { success: false, error: 'This content is not currently available for purchase.' };
  }

  // 1. Self-purchase prevention
  if (post.creatorId === userId) {
    return { success: false, error: 'Creators cannot purchase their own content.' };
  }

  // 2. Idempotency check: Already purchased?
  const existingPurchase = purchases.find(p => p.userId === userId && p.postId === postId);
  if (existingPurchase) {
    return {
      success: true,
      purchase: existingPurchase,
      error: 'Content already unlocked in your library.',
    };
  }

  const grossAmount = post.price || 0;
  if (grossAmount <= 0) {
    return { success: false, error: 'Invalid price for paid content.' };
  }

  // Calculate 85% creator / 15% platform split
  const creatorShare = Number((grossAmount * 0.85).toFixed(2));
  const platformShare = Number((grossAmount * 0.15).toFixed(2));
  const now = new Date().toISOString();
  const txRef = `MIRAGE_PPV_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  // Grant entitlement
  const newPurchase: PurchaseRecord = {
    id: `pur-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId,
    postId: post.id,
    title: post.title,
    creatorId: post.creatorId,
    creatorName: post.creatorName,
    creatorHandle: post.creatorHandle,
    mediaType: post.mediaType,
    accessUrl: post.mediaUrl, // Secure full access url unlocked
    thumbnailUrl: post.thumbnailUrl,
    price: grossAmount,
    purchasedAt: now,
  };

  purchases.unshift(newPurchase);
  post.salesCount = (post.salesCount || 0) + 1;

  // Record transaction
  const newTransaction: TransactionRecord = {
    id: `tx-${Date.now()}`,
    transactionReference: txRef,
    userId,
    userName,
    creatorId: post.creatorId,
    creatorName: post.creatorName,
    postId: post.id,
    postTitle: post.title,
    type: 'INDIVIDUAL_CONTENT',
    grossAmount,
    creatorShare,
    platformShare,
    feeAmount: 0.0,
    currency: 'USD',
    status: 'SUCCESS',
    paymentGateway: 'MIRAGE_PAY',
    gatewayReference: `gw_${Date.now()}`,
    createdAt: now,
  };

  transactions.unshift(newTransaction);

  return {
    success: true,
    purchase: newPurchase,
    transaction: newTransaction,
  };
}

// User Purchases Library
export function getUserPurchasesLibrary(userId: string): PurchaseRecord[] {
  return purchases.filter(p => p.userId === userId);
}

// Creator upload new post
export function createCreatorPost(data: {
  creatorId: string;
  creatorHandle: string;
  creatorName: string;
  creatorAvatar?: string;
  title: string;
  caption: string;
  mediaType: MediaType;
  mediaUrl: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  visibility: Visibility;
  status?: PostStatus;
  price?: number;
}): PostItem {
  const newPost: PostItem = {
    id: `post-${Date.now()}`,
    creatorId: data.creatorId,
    creatorHandle: data.creatorHandle,
    creatorName: data.creatorName,
    creatorAvatar: data.creatorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    title: data.title,
    caption: data.caption,
    mediaType: data.mediaType,
    mediaUrl: data.mediaUrl,
    thumbnailUrl: data.thumbnailUrl || data.mediaUrl,
    previewUrl: data.previewUrl,
    visibility: data.visibility,
    status: data.status || 'PUBLISHED',
    price: data.visibility === 'PURCHASE_ONLY' ? Number(data.price || 0) : 0,
    likeCount: 0,
    salesCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  posts.unshift(newPost);
  return newPost;
}

// Update existing post (price, status, title, caption)
export function updatePostDetails(
  postId: string,
  creatorId: string,
  updates: Partial<Pick<PostItem, 'price' | 'status' | 'title' | 'caption' | 'thumbnailUrl'>>
): { success: boolean; post?: PostItem; error?: string } {
  const post = posts.find(p => p.id === postId);
  if (!post) {
    return { success: false, error: 'Post not found' };
  }

  if (post.creatorId !== creatorId) {
    return { success: false, error: 'Unauthorized to edit this post' };
  }

  if (updates.price !== undefined) {
    post.price = Number(updates.price);
  }
  if (updates.status !== undefined) {
    post.status = updates.status;
  }
  if (updates.title !== undefined) {
    post.title = updates.title;
  }
  if (updates.caption !== undefined) {
    post.caption = updates.caption;
  }
  if (updates.thumbnailUrl !== undefined) {
    post.thumbnailUrl = updates.thumbnailUrl;
  }
  post.updatedAt = new Date().toISOString();

  return { success: true, post };
}

// Creator Segregated Earnings
export function getCreatorSegregatedEarnings(creatorId: string) {
  const creatorTxs = transactions.filter(t => t.creatorId === creatorId && t.status === 'SUCCESS');

  // Subscriptions
  const subTxs = creatorTxs.filter(t => t.type === 'SUBSCRIPTION');
  const subscriptionGross = subTxs.reduce((sum, t) => sum + t.grossAmount, 0);
  const subscriptionCreatorNet = subTxs.reduce((sum, t) => sum + t.creatorShare, 0);
  const subscriptionPlatformCut = subTxs.reduce((sum, t) => sum + t.platformShare, 0);

  // Individual Content Sales (PPV)
  const ppvTxs = creatorTxs.filter(t => t.type === 'INDIVIDUAL_CONTENT');
  const ppvGross = ppvTxs.reduce((sum, t) => sum + t.grossAmount, 0);
  const ppvCreatorNet = ppvTxs.reduce((sum, t) => sum + t.creatorShare, 0);
  const ppvPlatformCut = ppvTxs.reduce((sum, t) => sum + t.platformShare, 0);
  const ppvSalesCount = ppvTxs.length;

  // Custom Content Requests
  const custTxs = creatorTxs.filter(t => t.type === 'CUSTOM_CONTENT');
  const customGross = custTxs.reduce((sum, t) => sum + t.grossAmount, 0);
  const customCreatorNet = custTxs.reduce((sum, t) => sum + t.creatorShare, 0);
  const customPlatformCut = custTxs.reduce((sum, t) => sum + t.platformShare, 0);

  // Total
  const totalGross = subscriptionGross + ppvGross + customGross;
  const totalCreatorNet = subscriptionCreatorNet + ppvCreatorNet + customCreatorNet;
  const totalPlatformCut = subscriptionPlatformCut + ppvPlatformCut + customPlatformCut;

  return {
    creatorId,
    subscriptions: {
      count: subTxs.length,
      grossAmount: Number(subscriptionGross.toFixed(2)),
      creatorNet: Number(subscriptionCreatorNet.toFixed(2)),
      platformShare: Number(subscriptionPlatformCut.toFixed(2)),
    },
    individualContent: {
      count: ppvSalesCount,
      grossAmount: Number(ppvGross.toFixed(2)),
      creatorNet: Number(ppvCreatorNet.toFixed(2)),
      platformShare: Number(ppvPlatformCut.toFixed(2)),
    },
    customRequests: {
      count: custTxs.length,
      grossAmount: Number(customGross.toFixed(2)),
      creatorNet: Number(customCreatorNet.toFixed(2)),
      platformShare: Number(customPlatformCut.toFixed(2)),
    },
    totals: {
      totalGross: Number(totalGross.toFixed(2)),
      totalCreatorNet: Number(totalCreatorNet.toFixed(2)),
      totalPlatformCut: Number(totalPlatformCut.toFixed(2)),
      commissionSplit: '85% Creator / 15% Platform',
    },
    recentTransactions: creatorTxs.slice(0, 15),
  };
}

// Admin Catalog retrieval
export function getAdminCatalogList(filters?: { status?: string; mediaType?: string }) {
  let list = [...posts];
  if (filters?.status && filters.status !== 'ALL') {
    list = list.filter(p => p.status === filters.status);
  }
  if (filters?.mediaType && filters.mediaType !== 'ALL') {
    list = list.filter(p => p.mediaType === filters.mediaType);
  }
  return list;
}

// Admin Moderation: Toggle status
export function setPostStatusAdmin(postId: string, status: PostStatus): { success: boolean; post?: PostItem } {
  const post = posts.find(p => p.id === postId);
  if (!post) return { success: false };
  post.status = status;
  post.updatedAt = new Date().toISOString();
  return { success: true, post };
}

// Admin All Transactions with filtering
export function getAdminTransactions(filters?: { type?: string; search?: string }) {
  let list = [...transactions];
  if (filters?.type && filters.type !== 'ALL') {
    list = list.filter(t => t.type === filters.type);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      t =>
        t.transactionReference.toLowerCase().includes(q) ||
        t.userName.toLowerCase().includes(q) ||
        (t.creatorName && t.creatorName.toLowerCase().includes(q)) ||
        (t.postTitle && t.postTitle.toLowerCase().includes(q))
    );
  }
  return list;
}

// Reset store (used in automated testing)
export function resetStoreForTesting() {
  purchases = [
    {
      id: 'pur-seed-1',
      userId: 'usr-1',
      postId: 'post-ppv-1',
      title: 'Private Sunset Mirage Collection #1',
      creatorId: 'c1',
      creatorName: 'Luna Rae',
      creatorHandle: 'luna-rae',
      mediaType: 'IMAGE',
      accessUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1600&q=95',
      thumbnailUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=600&q=70',
      price: 15.00,
      purchasedAt: '2026-10-25T16:20:00Z',
    },
  ];
}

