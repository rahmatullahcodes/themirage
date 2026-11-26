// Persistent unified data store for The Mirage (Users, Creators, Posts, Subscriptions, PPV Vault, Chat, Orders & Admin)
import fs from 'fs';
import path from 'path';
import { calculateCommission } from './commission';

export type MediaType = 'IMAGE' | 'VIDEO' | 'AUDIO';
export type Visibility = 'PUBLIC' | 'SUBSCRIBER_ONLY' | 'PURCHASE_ONLY';
export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type TransactionType = 'SUBSCRIPTION' | 'CUSTOM_CONTENT' | 'INDIVIDUAL_CONTENT' | 'TIP';
export type UserRole = 'ADMIN' | 'CREATOR' | 'SUBSCRIBER';
export type AccountStatus = 'ACTIVE' | 'SUSPENDED';

export interface UserRecord {
  id: string;
  name: string;
  username: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  status: AccountStatus;
  avatar?: string;
  bio?: string;
  ageVerified: boolean;
  createdAt: string;
}

export interface CreatorRecord {
  id: string;
  userId: string;
  name: string;
  handle: string;
  avatar: string;
  banner: string;
  bio: string;
  category: string;
  monthlyPrice: number;
  isVerified: boolean;
  followersCount: number;
  likesCount: number;
  status: AccountStatus;
  createdAt: string;
}

export interface SubscriptionRecord {
  id: string;
  userId: string;
  userName: string;
  userHandle: string;
  creatorId: string;
  creatorHandle: string;
  creatorName: string;
  creatorAvatar: string;
  price: number;
  status: 'ACTIVE' | 'CANCELLED';
  startDate: string;
  nextBilling: string;
}

export interface FollowRecord {
  id: string;
  userId: string;
  creatorId: string;
  creatorHandle: string;
  creatorName: string;
  creatorAvatar: string;
  price: number;
  createdAt: string;
}

export interface CustomRequestRecord {
  id: string;
  customerId: string;
  customerName: string;
  customerHandle: string;
  creatorId: string;
  creatorHandle: string;
  creatorName: string;
  title: string;
  description: string;
  price: number;
  status: 'PENDING_PAYMENT' | 'AWAITING_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  deliveredMediaUrl?: string;
  createdAt: string;
  deliveredAt?: string;
}

export interface ChatMessageRecord {
  id: string;
  conversationKey: string; // e.g. "usr-1:luna-rae"
  userId: string;
  creatorHandle: string;
  sender: 'user' | 'creator';
  text: string;
  mediaUrl?: string;
  mediaType?: MediaType;
  time: string;
  createdAt: string;
  customRequestId?: string;
}

export interface ContentReportRecord {
  id: string;
  reporterId: string;
  reporterName: string;
  postId?: string;
  postTitle: string;
  reason: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
}

export interface PlatformSettingsRecord {
  creatorCommissionPercent: number;
  platformCommissionPercent: number;
  updatedAt: string;
}

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
  videoDuration?: string; // E.g. "0:45", "1:15"
  visibility: Visibility;
  isPublicPreview?: boolean; // Allowed max 3 photos and max 2 videos per creator
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

// Initial seed posts with individual paid images & videos and creator profile previews
const SEED_POSTS: PostItem[] = [
  // Luna Rae (c1, luna-rae): Exactly 3 Photo Previews
  {
    id: 'post-luna-prev-img-1',
    creatorId: 'c1',
    creatorHandle: 'luna-rae',
    creatorName: 'Luna Rae',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    title: 'Santorini Sunset Editorial',
    caption: 'Golden hour shot over Oia cliffs. One of my favorite looks from the summer campaign.',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1600&q=90',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    visibility: 'PUBLIC',
    isPublicPreview: true,
    status: 'PUBLISHED',
    price: 0,
    likeCount: 1420,
    salesCount: 0,
    createdAt: '2026-10-28T12:00:00Z',
    updatedAt: '2026-10-28T12:00:00Z',
  },
  {
    id: 'post-luna-prev-img-2',
    creatorId: 'c1',
    creatorHandle: 'luna-rae',
    creatorName: 'Luna Rae',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    title: 'Parisian Morning Bloom',
    caption: 'Early morning coffee on the private balcony overlooking the city.',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1600&q=90',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    visibility: 'PUBLIC',
    isPublicPreview: true,
    status: 'PUBLISHED',
    price: 0,
    likeCount: 980,
    salesCount: 0,
    createdAt: '2026-10-27T10:30:00Z',
    updatedAt: '2026-10-27T10:30:00Z',
  },
  {
    id: 'post-luna-prev-img-3',
    creatorId: 'c1',
    creatorHandle: 'luna-rae',
    creatorName: 'Luna Rae',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    title: 'Milan Haute Couture Session',
    caption: 'Studio lighting test before Milan Fashion Week runway show.',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1600&q=90',
    thumbnailUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    visibility: 'PUBLIC',
    isPublicPreview: true,
    status: 'PUBLISHED',
    price: 0,
    likeCount: 1650,
    salesCount: 0,
    createdAt: '2026-10-26T16:45:00Z',
    updatedAt: '2026-10-26T16:45:00Z',
  },

  // Luna Rae: Exactly 2 Video Previews
  {
    id: 'post-luna-prev-vid-1',
    creatorId: 'c1',
    creatorHandle: 'luna-rae',
    creatorName: 'Luna Rae',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
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
    likeCount: 2310,
    salesCount: 0,
    createdAt: '2026-10-29T14:10:00Z',
    updatedAt: '2026-10-29T14:10:00Z',
  },
  {
    id: 'post-luna-prev-vid-2',
    creatorId: 'c1',
    creatorHandle: 'luna-rae',
    creatorName: 'Luna Rae',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
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
    likeCount: 3120,
    salesCount: 0,
    createdAt: '2026-10-28T09:30:00Z',
    updatedAt: '2026-10-28T09:30:00Z',
  },

  // Luna Rae: Paid PPV & Subscriber content (LOCKED to non-authorized visitors)
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
    isPublicPreview: false,
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
    videoDuration: '15:20',
    visibility: 'PURCHASE_ONLY',
    isPublicPreview: false,
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
    isPublicPreview: false,
    status: 'PUBLISHED',
    price: 0,
    likeCount: 215,
    salesCount: 0,
    createdAt: '2026-10-20T10:00:00Z',
    updatedAt: '2026-10-20T10:00:00Z',
  },
  {
    id: 'post-sub-2',
    creatorId: 'c1',
    creatorHandle: 'luna-rae',
    creatorName: 'Luna Rae',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    title: 'Subscribers Only: Private Workout Session',
    caption: 'Morning routine & exclusive workout vlog with commentary.',
    mediaType: 'VIDEO',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=70',
    videoDuration: '10:05',
    visibility: 'SUBSCRIBER_ONLY',
    isPublicPreview: false,
    status: 'PUBLISHED',
    price: 0,
    likeCount: 184,
    salesCount: 0,
    createdAt: '2026-10-22T08:00:00Z',
    updatedAt: '2026-10-22T08:00:00Z',
  },

  // Sophie Lee (c2, sophie-lee): Previews & Content
  {
    id: 'post-sophie-prev-img-1',
    creatorId: 'c2',
    creatorHandle: 'sophie-lee',
    creatorName: 'Sophie Lee',
    creatorAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    title: 'Neon Nights Tokyo Teaser',
    caption: 'Midnight neon vibes in Shibuya. Shot on 35mm film.',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=70',
    visibility: 'PUBLIC',
    isPublicPreview: true,
    status: 'PUBLISHED',
    price: 0,
    likeCount: 520,
    salesCount: 0,
    createdAt: '2026-10-27T14:00:00Z',
    updatedAt: '2026-10-27T14:00:00Z',
  },
  {
    id: 'post-sophie-prev-img-2',
    creatorId: 'c2',
    creatorHandle: 'sophie-lee',
    creatorName: 'Sophie Lee',
    creatorAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    title: 'Kyoto Bamboo Haven',
    caption: 'Serene morning peaceful capture in Arashiyama.',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1200&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=70',
    visibility: 'PUBLIC',
    isPublicPreview: true,
    status: 'PUBLISHED',
    price: 0,
    likeCount: 680,
    salesCount: 0,
    createdAt: '2026-10-26T11:00:00Z',
    updatedAt: '2026-10-26T11:00:00Z',
  },
  {
    id: 'post-sophie-prev-img-3',
    creatorId: 'c2',
    creatorHandle: 'sophie-lee',
    creatorName: 'Sophie Lee',
    creatorAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    title: 'Rooftop Horizon',
    caption: 'Tokyo skyscape during dusk. Free public preview.',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=70',
    visibility: 'PUBLIC',
    isPublicPreview: true,
    status: 'PUBLISHED',
    price: 0,
    likeCount: 430,
    salesCount: 0,
    createdAt: '2026-10-25T15:00:00Z',
    updatedAt: '2026-10-25T15:00:00Z',
  },
  {
    id: 'post-sophie-prev-vid-1',
    creatorId: 'c2',
    creatorHandle: 'sophie-lee',
    creatorName: 'Sophie Lee',
    creatorAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
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
    likeCount: 890,
    salesCount: 0,
    createdAt: '2026-10-27T18:00:00Z',
    updatedAt: '2026-10-27T18:00:00Z',
  },
  {
    id: 'post-sophie-prev-vid-2',
    creatorId: 'c2',
    creatorHandle: 'sophie-lee',
    creatorName: 'Sophie Lee',
    creatorAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
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
    likeCount: 740,
    salesCount: 0,
    createdAt: '2026-10-26T20:00:00Z',
    updatedAt: '2026-10-26T20:00:00Z',
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
    videoDuration: '8:00',
    visibility: 'PURCHASE_ONLY',
    isPublicPreview: false,
    status: 'PUBLISHED',
    price: 20.00,
    likeCount: 95,
    salesCount: 14,
    createdAt: '2026-10-25T11:00:00Z',
    updatedAt: '2026-10-25T11:00:00Z',
  },

  // Mia Carter (c3, mia-carter): 3 Photo Previews, 2 Video Previews & PPV
  {
    id: 'post-mia-prev-img-1',
    creatorId: 'c3',
    creatorHandle: 'mia-carter',
    creatorName: 'Mia Carter',
    creatorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    title: 'Golden Sunset Terrace',
    caption: 'Unwinding after an all-day editorial session in Malibu.',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1600&q=90',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    visibility: 'PUBLIC',
    isPublicPreview: true,
    status: 'PUBLISHED',
    price: 0,
    likeCount: 1240,
    salesCount: 0,
    createdAt: '2026-10-28T14:00:00Z',
    updatedAt: '2026-10-28T14:00:00Z',
  },
  {
    id: 'post-mia-prev-img-2',
    creatorId: 'c3',
    creatorHandle: 'mia-carter',
    creatorName: 'Mia Carter',
    creatorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    title: 'Summer Glow Portrait',
    caption: 'Natural lighting and warm reflections in my studio.',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1600&q=90',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    visibility: 'PUBLIC',
    isPublicPreview: true,
    status: 'PUBLISHED',
    price: 0,
    likeCount: 1105,
    salesCount: 0,
    createdAt: '2026-10-27T16:00:00Z',
    updatedAt: '2026-10-27T16:00:00Z',
  },
  {
    id: 'post-mia-prev-img-3',
    creatorId: 'c3',
    creatorHandle: 'mia-carter',
    creatorName: 'Mia Carter',
    creatorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    title: 'Evening Elegance in Black & Gold',
    caption: 'Sneak preview from our private luxury gallery release.',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1600&q=90',
    thumbnailUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    visibility: 'PUBLIC',
    isPublicPreview: true,
    status: 'PUBLISHED',
    price: 0,
    likeCount: 1480,
    salesCount: 0,
    createdAt: '2026-10-26T19:00:00Z',
    updatedAt: '2026-10-26T19:00:00Z',
  },
  {
    id: 'post-mia-prev-vid-1',
    creatorId: 'c3',
    creatorHandle: 'mia-carter',
    creatorName: 'Mia Carter',
    creatorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    title: 'Malibu Sunset Studio Vlog',
    caption: 'Sneak peek into my daily creative routine and studio setup.',
    mediaType: 'VIDEO',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    videoDuration: '0:50',
    visibility: 'PUBLIC',
    isPublicPreview: true,
    status: 'PUBLISHED',
    price: 0,
    likeCount: 2190,
    salesCount: 0,
    createdAt: '2026-10-28T18:00:00Z',
    updatedAt: '2026-10-28T18:00:00Z',
  },
  {
    id: 'post-mia-prev-vid-2',
    creatorId: 'c3',
    creatorHandle: 'mia-carter',
    creatorName: 'Mia Carter',
    creatorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    title: 'Behind the Scenes — Glamour Look',
    caption: 'Full backstage lighting test and camera prep.',
    mediaType: 'VIDEO',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
    previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    videoDuration: '1:10',
    visibility: 'PUBLIC',
    isPublicPreview: true,
    status: 'PUBLISHED',
    price: 0,
    likeCount: 2850,
    salesCount: 0,
    createdAt: '2026-10-27T20:00:00Z',
    updatedAt: '2026-10-27T20:00:00Z',
  },
  {
    id: 'post-mia-ppv-1',
    creatorId: 'c3',
    creatorHandle: 'mia-carter',
    creatorName: 'Mia Carter',
    creatorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    title: 'Malibu Golden Hour VIP Gallery',
    caption: '12 exclusive unreleased high-definition editorial shots in Malibu.',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1600&q=95',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=70',
    visibility: 'PURCHASE_ONLY',
    isPublicPreview: false,
    status: 'PUBLISHED',
    price: 12.00,
    likeCount: 88,
    salesCount: 16,
    createdAt: '2026-10-25T16:00:00Z',
    updatedAt: '2026-10-25T16:00:00Z',
  },

  // Zara Khan (c4, zara-khan): 3 Photo Previews, 2 Video Previews
  {
    id: 'post-zara-prev-img-1',
    creatorId: 'c4',
    creatorHandle: 'zara-khan',
    creatorName: 'Zara Khan',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    title: 'Dubai Desert Horizon',
    caption: 'Golden dunes and sunset reflections on private safari.',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1600&q=90',
    thumbnailUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
    visibility: 'PUBLIC',
    isPublicPreview: true,
    status: 'PUBLISHED',
    price: 0,
    likeCount: 2100,
    salesCount: 0,
    createdAt: '2026-10-28T10:00:00Z',
    updatedAt: '2026-10-28T10:00:00Z',
  },
  {
    id: 'post-zara-prev-img-2',
    creatorId: 'c4',
    creatorHandle: 'zara-khan',
    creatorName: 'Zara Khan',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    title: 'Maldives Overwater Bungalow',
    caption: 'Morning swim in crystal turquoise waters.',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=90',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    visibility: 'PUBLIC',
    isPublicPreview: true,
    status: 'PUBLISHED',
    price: 0,
    likeCount: 2650,
    salesCount: 0,
    createdAt: '2026-10-27T11:00:00Z',
    updatedAt: '2026-10-27T11:00:00Z',
  },
  {
    id: 'post-zara-prev-img-3',
    creatorId: 'c4',
    creatorHandle: 'zara-khan',
    creatorName: 'Zara Khan',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    title: 'Amalfi Coast Viewpoint',
    caption: 'Classic Italian coastal colors and cliffside terrace.',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1600&q=90',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    visibility: 'PUBLIC',
    isPublicPreview: true,
    status: 'PUBLISHED',
    price: 0,
    likeCount: 1890,
    salesCount: 0,
    createdAt: '2026-10-26T15:00:00Z',
    updatedAt: '2026-10-26T15:00:00Z',
  },
  {
    id: 'post-zara-prev-vid-1',
    creatorId: 'c4',
    creatorHandle: 'zara-khan',
    creatorName: 'Zara Khan',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    title: 'Maldives Drone Cinema Teaser',
    caption: 'Aerial views of private coral islands and sunset lagoons.',
    mediaType: 'VIDEO',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    videoDuration: '0:55',
    visibility: 'PUBLIC',
    isPublicPreview: true,
    status: 'PUBLISHED',
    price: 0,
    likeCount: 3410,
    salesCount: 0,
    createdAt: '2026-10-28T12:00:00Z',
    updatedAt: '2026-10-28T12:00:00Z',
  },
  {
    id: 'post-zara-prev-vid-2',
    creatorId: 'c4',
    creatorHandle: 'zara-khan',
    creatorName: 'Zara Khan',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    title: 'Dubai High-Rise Penthouse Tour',
    caption: 'Exclusive tour of our VIP suite overlooking the marina.',
    mediaType: 'VIDEO',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
    previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    videoDuration: '1:20',
    visibility: 'PUBLIC',
    isPublicPreview: true,
    status: 'PUBLISHED',
    price: 0,
    likeCount: 3950,
    salesCount: 0,
    createdAt: '2026-10-27T17:00:00Z',
    updatedAt: '2026-10-27T17:00:00Z',
  },

  // Emily Rose (c5, emily-rose): 3 Photo Previews, 2 Video Previews
  {
    id: 'post-emily-prev-img-1',
    creatorId: 'c5',
    creatorHandle: 'emily-rose',
    creatorName: 'Emily Rose',
    creatorAvatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80',
    title: 'Sunrise Beach HIIT Session',
    caption: 'Pushing boundaries with morning endurance sprints on the sand.',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1600&q=90',
    thumbnailUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
    visibility: 'PUBLIC',
    isPublicPreview: true,
    status: 'PUBLISHED',
    price: 0,
    likeCount: 1420,
    salesCount: 0,
    createdAt: '2026-10-28T09:00:00Z',
    updatedAt: '2026-10-28T09:00:00Z',
  },
  {
    id: 'post-emily-prev-img-2',
    creatorId: 'c5',
    creatorHandle: 'emily-rose',
    creatorName: 'Emily Rose',
    creatorAvatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80',
    title: 'Studio Strength Form & Conditioning',
    caption: 'Focusing on core posture, breathing, and maximum control.',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1600&q=90',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    visibility: 'PUBLIC',
    isPublicPreview: true,
    status: 'PUBLISHED',
    price: 0,
    likeCount: 1290,
    salesCount: 0,
    createdAt: '2026-10-27T13:00:00Z',
    updatedAt: '2026-10-27T13:00:00Z',
  },
  {
    id: 'post-emily-prev-img-3',
    creatorId: 'c5',
    creatorHandle: 'emily-rose',
    creatorName: 'Emily Rose',
    creatorAvatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80',
    title: 'Post-Workout Recovery & Hydration',
    caption: 'My favorite clean smoothie recipe and cooldown stretches.',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1600&q=90',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    visibility: 'PUBLIC',
    isPublicPreview: true,
    status: 'PUBLISHED',
    price: 0,
    likeCount: 1560,
    salesCount: 0,
    createdAt: '2026-10-26T18:00:00Z',
    updatedAt: '2026-10-26T18:00:00Z',
  },
  {
    id: 'post-emily-prev-vid-1',
    creatorId: 'c5',
    creatorHandle: 'emily-rose',
    creatorName: 'Emily Rose',
    creatorAvatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80',
    title: '10-Minute Morning Warmup Routine',
    caption: 'Follow-along mobility and activation flow before daily training.',
    mediaType: 'VIDEO',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    videoDuration: '0:45',
    visibility: 'PUBLIC',
    isPublicPreview: true,
    status: 'PUBLISHED',
    price: 0,
    likeCount: 2150,
    salesCount: 0,
    createdAt: '2026-10-28T08:00:00Z',
    updatedAt: '2026-10-28T08:00:00Z',
  },
  {
    id: 'post-emily-prev-vid-2',
    creatorId: 'c5',
    creatorHandle: 'emily-rose',
    creatorName: 'Emily Rose',
    creatorAvatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80',
    title: 'Core & Glutes Blast Preview',
    caption: 'Quick highlights of my subscriber-only 45-min masterclass.',
    mediaType: 'VIDEO',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
    previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    videoDuration: '1:00',
    visibility: 'PUBLIC',
    isPublicPreview: true,
    status: 'PUBLISHED',
    price: 0,
    likeCount: 2840,
    salesCount: 0,
    createdAt: '2026-10-27T08:30:00Z',
    updatedAt: '2026-10-27T08:30:00Z',
  },
  {
    id: 'post-mia-sub-1',
    creatorId: 'c3',
    creatorHandle: 'mia-carter',
    creatorName: 'Mia Carter',
    creatorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    title: 'Subscribers Only: Malibu Morning Vlog',
    caption: 'Exclusive morning routine & Q&A video for my subscribers.',
    mediaType: 'VIDEO',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=70',
    videoDuration: '09:30',
    visibility: 'SUBSCRIBER_ONLY',
    isPublicPreview: false,
    status: 'PUBLISHED',
    price: 0,
    likeCount: 192,
    salesCount: 0,
    createdAt: '2026-10-24T12:00:00Z',
    updatedAt: '2026-10-24T12:00:00Z',
  },
  {
    id: 'post-zara-ppv-1',
    creatorId: 'c4',
    creatorHandle: 'zara-khan',
    creatorName: 'Zara Khan',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    title: 'Maldives Private Lagoon 4K Film',
    caption: 'Full 14-minute private island cinema escape in 4K UHD.',
    mediaType: 'VIDEO',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=70',
    videoDuration: '14:10',
    visibility: 'PURCHASE_ONLY',
    isPublicPreview: false,
    status: 'PUBLISHED',
    price: 19.99,
    likeCount: 310,
    salesCount: 22,
    createdAt: '2026-10-25T15:00:00Z',
    updatedAt: '2026-10-25T15:00:00Z',
  },
  {
    id: 'post-zara-sub-1',
    creatorId: 'c4',
    creatorHandle: 'zara-khan',
    creatorName: 'Zara Khan',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    title: 'Subscribers Only: Dubai Penthouse Evening',
    caption: 'Private twilight views & travel diary for active subscribers.',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1600&q=95',
    thumbnailUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=70',
    visibility: 'SUBSCRIBER_ONLY',
    isPublicPreview: false,
    status: 'PUBLISHED',
    price: 0,
    likeCount: 245,
    salesCount: 0,
    createdAt: '2026-10-23T19:00:00Z',
    updatedAt: '2026-10-23T19:00:00Z',
  },
  {
    id: 'post-emily-ppv-1',
    creatorId: 'c5',
    creatorHandle: 'emily-rose',
    creatorName: 'Emily Rose',
    creatorAvatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80',
    title: 'Full 45-Min Core & Sculpt Masterclass',
    caption: 'Complete guided high-intensity athletic conditioning session.',
    mediaType: 'VIDEO',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=70',
    videoDuration: '45:00',
    visibility: 'PURCHASE_ONLY',
    isPublicPreview: false,
    status: 'PUBLISHED',
    price: 14.99,
    likeCount: 274,
    salesCount: 31,
    createdAt: '2026-10-25T09:00:00Z',
    updatedAt: '2026-10-25T09:00:00Z',
  },
  {
    id: 'post-emily-sub-1',
    creatorId: 'c5',
    creatorHandle: 'emily-rose',
    creatorName: 'Emily Rose',
    creatorAvatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80',
    title: 'Subscribers Only: Weekly Nutrition & Form Check',
    caption: 'My complete weekly meal plan & backstage fitness portrait set.',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1600&q=95',
    thumbnailUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=70',
    visibility: 'SUBSCRIBER_ONLY',
    isPublicPreview: false,
    status: 'PUBLISHED',
    price: 0,
    likeCount: 205,
    salesCount: 0,
    createdAt: '2026-10-24T07:30:00Z',
    updatedAt: '2026-10-24T07:30:00Z',
  },
  // Ellie (c9, ellie): 3 Public Photo Previews, 2 Public Video Previews & Paid Feed
  {
    id: 'post-ellie-prev-img-1',
    creatorId: 'c9',
    creatorHandle: 'ellie',
    creatorName: 'Ellie',
    creatorAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    title: 'After Dark Lace & Velvet Preview',
    caption: 'Exclusive twilight studio editorial preview. Unlock the complete private collection.',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1600&q=90',
    thumbnailUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    visibility: 'PUBLIC',
    isPublicPreview: true,
    status: 'PUBLISHED',
    price: 0,
    likeCount: 1620,
    salesCount: 0,
    createdAt: '2026-10-28T15:00:00Z',
    updatedAt: '2026-10-28T15:00:00Z',
  },
  {
    id: 'post-ellie-prev-img-2',
    creatorId: 'c9',
    creatorHandle: 'ellie',
    creatorName: 'Ellie',
    creatorAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    title: 'Midnight Mirror Silhouette',
    caption: 'Intimate studio mood lighting portrait from my private fetish & glamour set.',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=1600&q=90',
    thumbnailUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
    visibility: 'PUBLIC',
    isPublicPreview: true,
    status: 'PUBLISHED',
    price: 0,
    likeCount: 1410,
    salesCount: 0,
    createdAt: '2026-10-27T18:00:00Z',
    updatedAt: '2026-10-27T18:00:00Z',
  },
  {
    id: 'post-ellie-prev-img-3',
    creatorId: 'c9',
    creatorHandle: 'ellie',
    creatorName: 'Ellie',
    creatorAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    title: 'Black & Gold Penthouse Suite',
    caption: 'VIP backstage preview shot before tonight’s live fan request stream.',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1600&q=90',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    visibility: 'PUBLIC',
    isPublicPreview: true,
    status: 'PUBLISHED',
    price: 0,
    likeCount: 1890,
    salesCount: 0,
    createdAt: '2026-10-26T20:00:00Z',
    updatedAt: '2026-10-26T20:00:00Z',
  },
  {
    id: 'post-ellie-prev-vid-1',
    creatorId: 'c9',
    creatorHandle: 'ellie',
    creatorName: 'Ellie',
    creatorAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    title: 'Ellie Studio Teaser Clip',
    caption: 'First 45 seconds of my exclusive VIP studio shoot.',
    mediaType: 'VIDEO',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    videoDuration: '0:45',
    visibility: 'PUBLIC',
    isPublicPreview: true,
    status: 'PUBLISHED',
    price: 0,
    likeCount: 2450,
    salesCount: 0,
    createdAt: '2026-10-28T19:00:00Z',
    updatedAt: '2026-10-28T19:00:00Z',
  },
  {
    id: 'post-ellie-prev-vid-2',
    creatorId: 'c9',
    creatorHandle: 'ellie',
    creatorName: 'Ellie',
    creatorAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    title: 'Late Night Custom Prep Preview',
    caption: 'Getting ready for custom subscriber requests — DM me yours!',
    mediaType: 'VIDEO',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
    previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    videoDuration: '1:05',
    visibility: 'PUBLIC',
    isPublicPreview: true,
    status: 'PUBLISHED',
    price: 0,
    likeCount: 2110,
    salesCount: 0,
    createdAt: '2026-10-27T21:00:00Z',
    updatedAt: '2026-10-27T21:00:00Z',
  },
  {
    id: 'post-ellie-ppv-1',
    creatorId: 'c9',
    creatorHandle: 'ellie',
    creatorName: 'Ellie',
    creatorAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    title: 'Ellie VIP Velvet Uncut 4K Collection',
    caption: 'Complete 20-minute uncut 4K private room shoot.',
    mediaType: 'VIDEO',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=70',
    videoDuration: '20:10',
    visibility: 'PURCHASE_ONLY',
    isPublicPreview: false,
    status: 'PUBLISHED',
    price: 19.99,
    likeCount: 412,
    salesCount: 14,
    createdAt: '2026-10-26T18:00:00Z',
    updatedAt: '2026-10-26T18:00:00Z',
  },
  {
    id: 'post-ellie-sub-1',
    creatorId: 'c9',
    creatorHandle: 'ellie',
    creatorName: 'Ellie',
    creatorAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    title: 'Subscribers Only: Private Satin Gallery',
    caption: 'Full uncensored photo set exclusively for active subscribers.',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=1600&q=95',
    thumbnailUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&q=70',
    visibility: 'SUBSCRIBER_ONLY',
    isPublicPreview: false,
    status: 'PUBLISHED',
    price: 0,
    likeCount: 318,
    salesCount: 0,
    createdAt: '2026-10-25T12:00:00Z',
    updatedAt: '2026-10-25T12:00:00Z',
  },
];

export interface MirageDbState {
  users: UserRecord[];
  creators: CreatorRecord[];
  posts: PostItem[];
  purchases: PurchaseRecord[];
  subscriptions: SubscriptionRecord[];
  follows: FollowRecord[];
  customRequests: CustomRequestRecord[];
  chatMessages: ChatMessageRecord[];
  transactions: TransactionRecord[];
  reports: ContentReportRecord[];
  settings: PlatformSettingsRecord;
}

const SEED_USERS: UserRecord[] = [
  {
    id: 'admin-1',
    name: 'Mirage Admin',
    username: 'admin',
    email: 'admin@themirage.vip',
    role: 'ADMIN',
    status: 'ACTIVE',
    bio: 'Platform Administrator',
    ageVerified: true,
    createdAt: '2026-10-01T09:00:00Z',
  },
  {
    id: 'c1',
    name: 'Luna Rae',
    username: 'luna-rae',
    email: 'creator@themirage.vip',
    role: 'CREATOR',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: 'Fashion model, fitness enthusiast and creative visual storyteller.',
    ageVerified: true,
    createdAt: '2026-10-08T10:00:00Z',
  },
  {
    id: 'c2',
    name: 'Sophie Lee',
    username: 'sophie-lee',
    email: 'sophie@themirage.vip',
    role: 'CREATOR',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    bio: 'Cosplay artist, designer, and studio creator.',
    ageVerified: true,
    createdAt: '2026-10-12T10:00:00Z',
  },
  {
    id: 'c3',
    name: 'Mia Carter',
    username: 'mia-carter',
    email: 'mia@themirage.vip',
    role: 'CREATOR',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    bio: 'Lifestyle creator and wellness guide.',
    ageVerified: true,
    createdAt: '2026-10-13T10:00:00Z',
  },
  {
    id: 'c4',
    name: 'Zara Khan',
    username: 'zara-khan',
    email: 'zara@themirage.vip',
    role: 'CREATOR',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    bio: 'Luxury travel filmmaker & photographer.',
    ageVerified: true,
    createdAt: '2026-10-14T10:00:00Z',
  },
  {
    id: 'c5',
    name: 'Emily Rose',
    username: 'emily-rose',
    email: 'emily@themirage.vip',
    role: 'CREATOR',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80',
    bio: 'Athletic conditioning coach & creator.',
    ageVerified: true,
    createdAt: '2026-10-15T10:00:00Z',
  },
  {
    id: 'c9',
    name: 'Ellie',
    username: 'ellie',
    email: 'ellie@themirage.vip',
    role: 'CREATOR',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    bio: 'Exclusive fetish & glamour creator sharing private sets and custom video moments.',
    ageVerified: true,
    createdAt: '2026-10-18T12:00:00Z',
  },
  {
    id: 'usr-1',
    name: 'Alex Mercer',
    username: 'alexmercer',
    email: 'subscriber@themirage.vip',
    role: 'SUBSCRIBER',
    status: 'ACTIVE',
    bio: 'VIP Subscriber member on The Mirage.',
    ageVerified: true,
    createdAt: '2026-10-14T11:30:00Z',
  },
  {
    id: 'usr-2',
    name: 'Marcus Wright',
    username: 'marcus_w',
    email: 'marcus@example.com',
    role: 'SUBSCRIBER',
    status: 'ACTIVE',
    ageVerified: true,
    createdAt: '2026-10-15T12:00:00Z',
  },
  {
    id: 'usr-3',
    name: 'David Kim',
    username: 'david_k',
    email: 'david@example.com',
    role: 'SUBSCRIBER',
    status: 'ACTIVE',
    ageVerified: true,
    createdAt: '2026-10-16T09:00:00Z',
  },
  {
    id: 'usr-4',
    name: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
    role: 'SUBSCRIBER',
    status: 'SUSPENDED',
    ageVerified: true,
    createdAt: '2026-10-10T08:00:00Z',
  },
];

const SEED_CREATORS: CreatorRecord[] = [
  {
    id: 'c1',
    userId: 'c1',
    name: 'Luna Rae',
    handle: 'luna-rae',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    banner: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1400&q=80',
    bio: 'Fashion model, fitness enthusiast and creative visual storyteller. Sharing my exclusive lifestyle, behind the scenes, and direct chat moments with you.',
    category: 'Popular',
    monthlyPrice: 9.99,
    isVerified: true,
    followersCount: 128000,
    likesCount: 340000,
    status: 'ACTIVE',
    createdAt: '2026-10-08T10:00:00Z',
  },
  {
    id: 'c2',
    userId: 'c2',
    name: 'Sophie Lee',
    handle: 'sophie-lee',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
    banner: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1400&q=80',
    bio: 'Cosplay designer, editorial stylist, and studio creator. Exclusive looks, photo shoots, and custom video sets available for subscribers.',
    category: 'Cosplay',
    monthlyPrice: 9.99,
    isVerified: true,
    followersCount: 180000,
    likesCount: 410000,
    status: 'ACTIVE',
    createdAt: '2026-10-12T10:00:00Z',
  },
  {
    id: 'c3',
    userId: 'c3',
    name: 'Mia Carter',
    handle: 'mia-carter',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    banner: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1400&q=80',
    bio: 'Lifestyle creator, wellness guide, and everyday glamour enthusiast. Join my private community for daily looks, personal vlogs, and 1-on-1 chats.',
    category: 'Lifestyle',
    monthlyPrice: 7.99,
    isVerified: true,
    followersCount: 95000,
    likesCount: 290000,
    status: 'ACTIVE',
    createdAt: '2026-10-13T10:00:00Z',
  },
  {
    id: 'c4',
    userId: 'c4',
    name: 'Zara Khan',
    handle: 'zara-khan',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
    banner: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80',
    bio: 'Luxury fetish & editorial creator. Unlock private after-dark galleries, 4K sunset shoots, and behind-the-scenes clips.',
    category: 'Fetish',
    monthlyPrice: 12.99,
    isVerified: true,
    followersCount: 210000,
    likesCount: 520000,
    status: 'ACTIVE',
    createdAt: '2026-10-14T10:00:00Z',
  },
  {
    id: 'c5',
    userId: 'c5',
    name: 'Emily Rose',
    handle: 'emily-rose',
    avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80',
    banner: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1400&q=80',
    bio: 'Certified athletic conditioning coach & fitness creator. Full-length guided training routines, studio sets, and personalized custom fitness videos.',
    category: 'Fitness',
    monthlyPrice: 8.99,
    isVerified: true,
    followersCount: 98000,
    likesCount: 265000,
    status: 'ACTIVE',
    createdAt: '2026-10-15T10:00:00Z',
  },
  {
    id: 'c6',
    userId: 'c6',
    name: 'Aria Vance',
    handle: 'aria-vance',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&q=80',
    banner: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1400&q=80',
    bio: 'Rising visual artist and fashion editorial muse on The Mirage.',
    category: 'New',
    monthlyPrice: 10.99,
    isVerified: true,
    followersCount: 142000,
    likesCount: 210000,
    status: 'ACTIVE',
    createdAt: '2026-10-16T10:00:00Z',
  },
  {
    id: 'c7',
    userId: 'c7',
    name: 'Chloe Bennett',
    handle: 'chloe-bennett',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80',
    banner: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1400&q=80',
    bio: 'Curated lifestyle & city portraits creator.',
    category: 'Nearby',
    monthlyPrice: 6.99,
    isVerified: false,
    followersCount: 88000,
    likesCount: 124000,
    status: 'ACTIVE',
    createdAt: '2026-10-17T10:00:00Z',
  },
  {
    id: 'c8',
    userId: 'c8',
    name: 'Elena Rostova',
    handle: 'elena-rostova',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    banner: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1400&q=80',
    bio: 'Exclusive VIP mature art & private gallery creator.',
    category: 'Mature',
    monthlyPrice: 14.99,
    isVerified: true,
    followersCount: 230000,
    likesCount: 495000,
    status: 'ACTIVE',
    createdAt: '2026-10-18T10:00:00Z',
  },
  {
    id: 'c9',
    userId: 'c9',
    name: 'Ellie',
    handle: 'ellie',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
    banner: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1400&q=80',
    bio: 'Welcome to Ellie’s world on The Mirage. Unlock exclusive after-dark glamour, fetish editorial sets, 4K clips, and custom private chat.',
    category: 'Fetish',
    monthlyPrice: 9.99,
    isVerified: true,
    followersCount: 165000,
    likesCount: 380000,
    status: 'ACTIVE',
    createdAt: '2026-10-18T12:00:00Z',
  },
];

const SEED_PURCHASES: PurchaseRecord[] = [
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

const SEED_SUBSCRIPTIONS: SubscriptionRecord[] = [
  {
    id: 'sub-1',
    userId: 'usr-1',
    userName: 'Alex Mercer',
    userHandle: '@alexmercer',
    creatorId: 'c1',
    creatorHandle: 'luna-rae',
    creatorName: 'Luna Rae',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    price: 9.99,
    status: 'ACTIVE',
    startDate: '2026-10-21T11:45:00Z',
    nextBilling: 'November 21, 2026',
  },
  {
    id: 'sub-2',
    userId: 'usr-1',
    userName: 'Alex Mercer',
    userHandle: '@alexmercer',
    creatorId: 'c2',
    creatorHandle: 'sophie-lee',
    creatorName: 'Sophie Lee',
    creatorAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    price: 9.99,
    status: 'ACTIVE',
    startDate: '2026-10-18T10:00:00Z',
    nextBilling: 'November 18, 2026',
  },
  {
    id: 'sub-3',
    userId: 'usr-2',
    userName: 'Marcus Wright',
    userHandle: '@marcus_w',
    creatorId: 'c1',
    creatorHandle: 'luna-rae',
    creatorName: 'Luna Rae',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    price: 9.99,
    status: 'ACTIVE',
    startDate: '2026-10-14T10:00:00Z',
    nextBilling: 'November 14, 2026',
  },
  {
    id: 'sub-4',
    userId: 'usr-3',
    userName: 'David Kim',
    userHandle: '@david_k',
    creatorId: 'c1',
    creatorHandle: 'luna-rae',
    creatorName: 'Luna Rae',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    price: 9.99,
    status: 'ACTIVE',
    startDate: '2026-10-16T10:00:00Z',
    nextBilling: 'November 16, 2026',
  },
];

const SEED_FOLLOWS: FollowRecord[] = [
  {
    id: 'fol-1',
    userId: 'usr-1',
    creatorId: 'c3',
    creatorHandle: 'mia-carter',
    creatorName: 'Mia Carter',
    creatorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    price: 7.99,
    createdAt: '2026-10-15T10:00:00Z',
  },
  {
    id: 'fol-2',
    userId: 'usr-1',
    creatorId: 'c4',
    creatorHandle: 'zara-khan',
    creatorName: 'Zara Khan',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    price: 12.99,
    createdAt: '2026-10-16T10:00:00Z',
  },
];

const SEED_CUSTOM_REQUESTS: CustomRequestRecord[] = [
  {
    id: 'req-201',
    customerId: 'usr-1',
    customerName: 'Alex Mercer',
    customerHandle: '@alexmercer',
    creatorId: 'c1',
    creatorHandle: 'luna-rae',
    creatorName: 'Luna Rae',
    title: 'Birthday Video Shoutout for Sarah',
    description: '2-min custom greeting mentioning Sarah in VIP black & gold studio.',
    price: 50.00,
    status: 'AWAITING_DELIVERY',
    createdAt: '2026-10-20T14:00:00Z',
  },
  {
    id: 'req-202',
    customerId: 'usr-2',
    customerName: 'Marcus Wright',
    customerHandle: '@marcus_w',
    creatorId: 'c1',
    creatorHandle: 'luna-rae',
    creatorName: 'Luna Rae',
    title: 'Private Fitness Nutrition Advice Clip',
    description: 'Custom Q&A clip covering morning routine and nutrition.',
    price: 35.00,
    status: 'DELIVERED',
    deliveredMediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    createdAt: '2026-10-18T11:00:00Z',
    deliveredAt: '2026-10-18T16:30:00Z',
  },
];

const SEED_TRANSACTIONS: TransactionRecord[] = [
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
  {
    id: 'tx-1004',
    transactionReference: 'MIRAGE_SUB_7721',
    userId: 'usr-2',
    userName: 'Marcus Wright',
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
    gatewayReference: 'gw_sub_7721',
    createdAt: '2026-10-22T16:12:00Z',
  },
  {
    id: 'tx-1005',
    transactionReference: 'MIRAGE_PPV_5542',
    userId: 'usr-2',
    userName: 'Marcus Wright',
    creatorId: 'c1',
    creatorName: 'Luna Rae',
    postId: 'post-ppv-2',
    postTitle: 'Behind the Scenes — Midnight Studio Session (4K Video)',
    type: 'INDIVIDUAL_CONTENT',
    grossAmount: 25.00,
    creatorShare: 21.25,
    platformShare: 3.75,
    feeAmount: 0.0,
    currency: 'USD',
    status: 'SUCCESS',
    paymentGateway: 'MIRAGE_PAY',
    gatewayReference: 'gw_ppv_5542',
    createdAt: '2026-10-26T20:30:00Z',
  },
  {
    id: 'tx-1006',
    transactionReference: 'MIRAGE_SUB_6619',
    userId: 'usr-3',
    userName: 'David Kim',
    creatorId: 'c2',
    creatorName: 'Sophie Lee',
    type: 'SUBSCRIPTION',
    grossAmount: 9.99,
    creatorShare: 8.49,
    platformShare: 1.50,
    feeAmount: 0.0,
    currency: 'USD',
    status: 'SUCCESS',
    paymentGateway: 'MIRAGE_PAY',
    gatewayReference: 'gw_sub_6619',
    createdAt: '2026-10-23T09:30:00Z',
  },
];

const SEED_REPORTS: ContentReportRecord[] = [
  {
    id: 'rep-1',
    reporterId: 'usr-1',
    reporterName: 'Alex Mercer',
    postTitle: 'Exclusive Stage Set',
    reason: 'Copyright Rights Verification Check',
    status: 'PENDING',
    createdAt: '2026-10-20T12:00:00Z',
  },
  {
    id: 'rep-2',
    reporterId: 'system',
    reporterName: 'System Gate',
    postTitle: 'Feed Post #41',
    reason: 'Age verification declaration audit',
    status: 'RESOLVED',
    createdAt: '2026-10-19T08:00:00Z',
  },
];

const DEFAULT_SETTINGS: PlatformSettingsRecord = {
  creatorCommissionPercent: 85,
  platformCommissionPercent: 15,
  updatedAt: '2026-10-01T00:00:00Z',
};

declare global {
  // eslint-disable-next-line no-var
  var __mirageDb: MirageDbState | undefined;
}

function getDbFilePath(): string {
  return process.env.MIRAGE_DB_FILE || path.join(process.cwd(), 'data', 'mirage-db.json');
}

function createInitialDb(): MirageDbState {
  const nowIso = new Date().toISOString();
  return {
    users: JSON.parse(JSON.stringify(SEED_USERS)),
    creators: JSON.parse(JSON.stringify(SEED_CREATORS)),
    posts: JSON.parse(JSON.stringify(SEED_POSTS)),
    purchases: JSON.parse(JSON.stringify(SEED_PURCHASES)),
    subscriptions: JSON.parse(JSON.stringify(SEED_SUBSCRIPTIONS)),
    follows: JSON.parse(JSON.stringify(SEED_FOLLOWS)),
    customRequests: JSON.parse(JSON.stringify(SEED_CUSTOM_REQUESTS)),
    chatMessages: [
      {
        id: 'seed-msg-1',
        conversationKey: 'usr-1:luna-rae',
        userId: 'usr-1',
        creatorHandle: 'luna-rae',
        sender: 'creator',
        text: 'Hey Alex! Welcome to my private Mirage channel. Message me anytime or request custom shoots ✨',
        time: '11:42 AM',
        createdAt: nowIso,
      },
      {
        id: 'seed-msg-2',
        conversationKey: 'usr-1:ellie',
        userId: 'usr-1',
        creatorHandle: 'ellie',
        sender: 'creator',
        text: 'Hey! Thanks for visiting my profile — feel free to send a direct message or custom content request anytime 🖤',
        time: '12:05 PM',
        createdAt: nowIso,
      },
    ],
    transactions: JSON.parse(JSON.stringify(SEED_TRANSACTIONS)),
    reports: JSON.parse(JSON.stringify(SEED_REPORTS)),
    settings: { ...DEFAULT_SETTINGS },
  };
}

function saveDb(db: MirageDbState): void {
  if (process.env.MIRAGE_DISABLE_DISK_PERSIST === 'true') return;
  try {
    const dbFile = getDbFilePath();
    const dir = path.dirname(dbFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error('[MirageDB] Failed to persist store to disk:', err);
  }
}

function getDb(): MirageDbState {
  if (globalThis.__mirageDb) {
    return globalThis.__mirageDb;
  }

  const dbFile = getDbFilePath();
  if (process.env.MIRAGE_DISABLE_DISK_PERSIST !== 'true' && fs.existsSync(dbFile)) {
    try {
      const raw = fs.readFileSync(dbFile, 'utf8');
      const parsed = JSON.parse(raw) as Partial<MirageDbState>;
      const base = createInitialDb();
      const hydrated: MirageDbState = {
        users: Array.isArray(parsed.users) ? parsed.users : base.users,
        creators: Array.isArray(parsed.creators) ? parsed.creators : base.creators,
        posts: Array.isArray(parsed.posts) ? parsed.posts : base.posts,
        purchases: Array.isArray(parsed.purchases) ? parsed.purchases : base.purchases,
        subscriptions: Array.isArray(parsed.subscriptions) ? parsed.subscriptions : base.subscriptions,
        follows: Array.isArray(parsed.follows) ? parsed.follows : base.follows,
        customRequests: Array.isArray(parsed.customRequests) ? parsed.customRequests : base.customRequests,
        chatMessages: Array.isArray(parsed.chatMessages) ? parsed.chatMessages : base.chatMessages,
        transactions: Array.isArray(parsed.transactions) ? parsed.transactions : base.transactions,
        reports: Array.isArray(parsed.reports) ? parsed.reports : base.reports,
        settings: parsed.settings || base.settings,
      };

      // Auto-migrate existing persisted DB: ensure Travel -> Fetish and ensure Ellie ('c9') exists
      let migrated = false;
      hydrated.creators.forEach(c => {
        if (c.category === 'Travel') {
          c.category = 'Fetish';
          migrated = true;
        }
      });
      if (!hydrated.users.some(u => u.username === 'ellie' || u.id === 'c9')) {
        const ellieUser = base.users.find(u => u.id === 'c9');
        if (ellieUser) {
          hydrated.users.unshift(ellieUser);
          migrated = true;
        }
      }
      if (!hydrated.creators.some(c => c.handle === 'ellie' || c.id === 'c9')) {
        const ellieCreator = base.creators.find(c => c.id === 'c9');
        if (ellieCreator) {
          hydrated.creators.unshift(ellieCreator);
          migrated = true;
        }
      }
      const elliePosts = base.posts.filter(p => p.creatorId === 'c9');
      elliePosts.forEach(ep => {
        if (!hydrated.posts.some(p => p.id === ep.id)) {
          hydrated.posts.push(ep);
          migrated = true;
        }
      });
      if (migrated) saveDb(hydrated);

      globalThis.__mirageDb = hydrated;
      return hydrated;
    } catch (err) {
      console.error('[MirageDB] Corrupt DB file detected, initializing fresh defaults:', err);
    }
  }

  const initial = createInitialDb();
  globalThis.__mirageDb = initial;
  saveDb(initial);
  return initial;
}

const HANDLE_TO_CREATOR_ID: Record<string, string> = {
  'luna-rae': 'c1',
  'sophie-lee': 'c2',
  'mia-carter': 'c3',
  'zara-khan': 'c4',
  'emily-rose': 'c5',
  'aria-vance': 'c6',
  'chloe-bennett': 'c7',
  'elena-rostova': 'c8',
  'ellie': 'c9',
};

export function resolveCreatorId(creatorIdOrHandle: string): string {
  if (!creatorIdOrHandle || typeof creatorIdOrHandle !== 'string') return '';
  const cleaned = creatorIdOrHandle.replace(/^creator-/, '').replace(/^@/, '').toLowerCase();
  if (HANDLE_TO_CREATOR_ID[cleaned]) return HANDLE_TO_CREATOR_ID[cleaned];
  const db = getDb();
  const match = db.creators.find(
    c =>
      c.id.toLowerCase() === cleaned ||
      c.handle.toLowerCase() === cleaned ||
      c.userId.toLowerCase() === cleaned
  );
  return match ? match.id : creatorIdOrHandle;
}

export function getCreatorNameById(creatorIdOrHandle: string): string {
  const resolved = resolveCreatorId(creatorIdOrHandle);
  const db = getDb();
  const creatorMatch = db.creators.find(c => c.id === resolved || c.handle === resolved);
  if (creatorMatch) return creatorMatch.name;
  const postMatch = db.posts.find(p => p.creatorId === resolved);
  return postMatch ? postMatch.creatorName : 'The Mirage Creator';
}

export function getPlatformSettings(): PlatformSettingsRecord {
  return { ...getDb().settings };
}

export function updatePlatformSettings(creatorCommissionPercent: number): PlatformSettingsRecord {
  const clamped = Math.min(95, Math.max(50, Math.round(Number(creatorCommissionPercent) || 85)));
  const db = getDb();
  db.settings = {
    creatorCommissionPercent: clamped,
    platformCommissionPercent: 100 - clamped,
    updatedAt: new Date().toISOString(),
  };
  saveDb(db);
  return { ...db.settings };
}

// ======================= USER & CREATOR REGISTRY =======================

export function listAllUsers(): UserRecord[] {
  return [...getDb().users];
}

export function findUserByEmail(email: string): UserRecord | undefined {
  const clean = email.trim().toLowerCase();
  return getDb().users.find(u => u.email.toLowerCase() === clean);
}

export function findUserById(userId: string): UserRecord | undefined {
  return getDb().users.find(u => u.id === userId);
}

export function registerNewUser(params: {
  name: string;
  username: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  monthlyPrice?: number;
}): { success: boolean; user?: UserRecord; creator?: CreatorRecord; error?: string } {
  const db = getDb();
  const cleanEmail = params.email.trim().toLowerCase();
  const cleanUsername = params.username.trim().toLowerCase().replace(/^@/, '').replace(/[^a-z0-9_-]/g, '') || `user_${Date.now()}`;

  const existingEmail = db.users.find(u => u.email.toLowerCase() === cleanEmail);
  if (existingEmail) {
    return { success: false, error: 'An account with this email already exists.' };
  }

  const now = new Date().toISOString();
  const userId = `usr_${Date.now()}`;
  const assignedRole: UserRole = params.role === 'CREATOR' ? 'CREATOR' : 'SUBSCRIBER';

  const newUser: UserRecord = {
    id: userId,
    name: params.name.trim(),
    username: cleanUsername,
    email: cleanEmail,
    passwordHash: params.passwordHash,
    role: assignedRole,
    status: 'ACTIVE',
    avatar:
      assignedRole === 'CREATOR'
        ? 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&q=80'
        : undefined,
    bio: assignedRole === 'CREATOR' ? 'Exclusive creator on The Mirage.' : 'Subscriber member on The Mirage.',
    ageVerified: true,
    createdAt: now,
  };

  db.users.unshift(newUser);

  let createdCreator: CreatorRecord | undefined;
  if (assignedRole === 'CREATOR') {
    const existingHandle = db.creators.some(c => c.handle.toLowerCase() === cleanUsername);
    const finalHandle = existingHandle ? `${cleanUsername}-${Date.now().toString().slice(-4)}` : cleanUsername;
    createdCreator = {
      id: userId,
      userId,
      name: newUser.name,
      handle: finalHandle,
      avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&q=80',
      banner: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1400&q=80',
      bio: `Official Mirage profile for ${newUser.name}. Subscribe for exclusive photos, videos & 1-on-1 chat.`,
      category: 'New',
      monthlyPrice: Number(params.monthlyPrice) > 0 ? Number(params.monthlyPrice) : 9.99,
      isVerified: false,
      followersCount: 0,
      likesCount: 0,
      status: 'ACTIVE',
      createdAt: now,
    };
    db.creators.unshift(createdCreator);
  }

  saveDb(db);
  return { success: true, user: newUser, creator: createdCreator };
}

export function updateUserStatusAdmin(userId: string, status: AccountStatus): { success: boolean; user?: UserRecord } {
  const db = getDb();
  const user = db.users.find(u => u.id === userId);
  if (!user) return { success: false };
  user.status = status;
  const creator = db.creators.find(c => c.id === userId || c.userId === userId);
  if (creator) creator.status = status;
  saveDb(db);
  return { success: true, user };
}

export function updateUserAdmin(
  userId: string,
  updates: { name?: string; username?: string; email?: string; role?: UserRole; status?: AccountStatus; bio?: string }
): { success: boolean; user?: UserRecord; error?: string } {
  const db = getDb();
  const user = db.users.find(u => u.id === userId);
  if (!user) return { success: false, error: 'User not found' };

  if (updates.email !== undefined) {
    const cleanEmail = updates.email.trim().toLowerCase();
    if (!cleanEmail) return { success: false, error: 'Email cannot be empty' };
    const dup = db.users.find(u => u.id !== userId && u.email.toLowerCase() === cleanEmail);
    if (dup) return { success: false, error: 'Email is already registered to another user' };
    user.email = cleanEmail;
  }
  if (updates.name !== undefined && updates.name.trim()) user.name = updates.name.trim();
  if (updates.username !== undefined && updates.username.trim()) {
    user.username = updates.username.trim().toLowerCase().replace(/^@/, '').replace(/[^a-z0-9_-]/g, '') || user.username;
  }
  if (updates.role && ['ADMIN', 'CREATOR', 'SUBSCRIBER'].includes(updates.role)) {
    user.role = updates.role;
  }
  if (updates.status && (updates.status === 'ACTIVE' || updates.status === 'SUSPENDED')) {
    user.status = updates.status;
  }
  if (updates.bio !== undefined) user.bio = updates.bio;

  const creator = db.creators.find(c => c.id === userId || c.userId === userId);
  if (creator) {
    creator.name = user.name;
    creator.status = user.status;
  }
  saveDb(db);
  return { success: true, user };
}

export function deleteUserAdmin(userId: string): { success: boolean; error?: string } {
  const db = getDb();
  const idx = db.users.findIndex(u => u.id === userId);
  if (idx === -1) return { success: false, error: 'User not found' };
  if (db.users[idx].role === 'ADMIN') {
    return { success: false, error: 'Administrator accounts cannot be deleted.' };
  }
  db.users.splice(idx, 1);

  const creatorIdx = db.creators.findIndex(c => c.id === userId || c.userId === userId);
  if (creatorIdx !== -1) {
    const removedCreator = db.creators[creatorIdx];
    db.creators.splice(creatorIdx, 1);
    db.posts = db.posts.filter(p => p.creatorId !== removedCreator.id);
  }
  db.subscriptions = db.subscriptions.filter(s => s.userId !== userId);
  db.follows = db.follows.filter(f => f.userId !== userId);
  saveDb(db);
  return { success: true };
}

export function updateUserProfile(
  userId: string,
  updates: { name?: string; username?: string; bio?: string; avatar?: string }
): { success: boolean; user?: UserRecord; error?: string } {
  const db = getDb();
  const user = db.users.find(u => u.id === userId);
  if (!user) return { success: false, error: 'User not found' };
  if (updates.name && updates.name.trim()) user.name = updates.name.trim();
  if (updates.username !== undefined && updates.username.trim()) {
    const clean = updates.username.trim().toLowerCase().replace(/^@/, '').replace(/[^a-z0-9_-]/g, '');
    if (clean) user.username = clean;
  }
  if (updates.bio !== undefined) user.bio = updates.bio;
  if (updates.avatar !== undefined && updates.avatar.trim()) user.avatar = updates.avatar.trim();

  const linkedCreator = db.creators.find(c => c.userId === userId || c.id === userId);
  if (linkedCreator) {
    if (updates.name && updates.name.trim()) linkedCreator.name = user.name;
    if (updates.avatar && updates.avatar.trim()) linkedCreator.avatar = user.avatar!;
    if (updates.bio !== undefined) linkedCreator.bio = updates.bio;
  }

  saveDb(db);
  return { success: true, user };
}

export function formatFollowerLabel(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${Math.round(count / 1000)}K`;
  return String(count);
}

export function listAllCreators(filters?: { category?: string; q?: string; sort?: string; handle?: string }) {
  const db = getDb();
  let list = db.creators.map(c => {
    const subs = db.subscriptions.filter(s => s.creatorId === c.id && s.status === 'ACTIVE').length;
    const earnings = db.transactions
      .filter(t => t.creatorId === c.id && t.status === 'SUCCESS')
      .reduce((sum, t) => sum + t.creatorShare, 0);
    const postsCount = db.posts.filter(p => p.creatorId === c.id && p.status === 'PUBLISHED').length;
    return {
      ...c,
      followers: formatFollowerLabel(c.followersCount),
      subscribers: subs,
      earnings: Number(earnings.toFixed(2)),
      postsCount,
    };
  });

  if (filters?.handle) {
    const clean = filters.handle.replace(/^@/, '').toLowerCase();
    list = list.filter(c => c.handle.toLowerCase() === clean || c.id.toLowerCase() === clean);
  }
  if (filters?.category && filters.category.toLowerCase() !== 'all') {
    list = list.filter(c => c.category.toLowerCase() === filters.category!.toLowerCase());
  }
  if (filters?.q) {
    const q = filters.q.toLowerCase();
    list = list.filter(c => c.name.toLowerCase().includes(q) || c.handle.toLowerCase().includes(q));
  }
  if (filters?.sort === 'price-low') {
    list.sort((a, b) => a.monthlyPrice - b.monthlyPrice);
  } else if (filters?.sort === 'price-high') {
    list.sort((a, b) => b.monthlyPrice - a.monthlyPrice);
  } else if (filters?.sort === 'newest') {
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else {
    list.sort((a, b) => b.followersCount - a.followersCount);
  }
  return list;
}

export function toggleCreatorVerificationAdmin(creatorId: string): { success: boolean; creator?: CreatorRecord } {
  const db = getDb();
  const resolved = resolveCreatorId(creatorId);
  const creator = db.creators.find(c => c.id === creatorId || c.id === resolved);
  if (!creator) return { success: false };
  creator.isVerified = !creator.isVerified;
  saveDb(db);
  return { success: true, creator };
}

export function updateCreatorAdmin(
  creatorIdOrHandle: string,
  updates: {
    name?: string;
    handle?: string;
    category?: string;
    monthlyPrice?: number;
    bio?: string;
    avatar?: string;
    banner?: string;
    isVerified?: boolean;
    status?: AccountStatus;
  }
): { success: boolean; creator?: CreatorRecord; error?: string } {
  const db = getDb();
  const resolved = resolveCreatorId(creatorIdOrHandle);
  const creator = db.creators.find(
    c =>
      c.id === resolved ||
      c.id === creatorIdOrHandle ||
      c.handle.toLowerCase() === creatorIdOrHandle.replace(/^@/, '').toLowerCase()
  );
  if (!creator) return { success: false, error: 'Creator profile not found' };

  if (updates.monthlyPrice !== undefined) {
    const p = Number(updates.monthlyPrice);
    if (!Number.isFinite(p) || p < 1) return { success: false, error: 'Invalid monthly price' };
    creator.monthlyPrice = Number(p.toFixed(2));
  }
  if (updates.name !== undefined && updates.name.trim()) {
    creator.name = updates.name.trim();
  }
  if (updates.handle !== undefined && updates.handle.trim()) {
    const cleanHandle = updates.handle.trim().toLowerCase().replace(/^@/, '').replace(/[^a-z0-9_-]/g, '');
    if (cleanHandle) creator.handle = cleanHandle;
  }
  if (updates.category !== undefined && updates.category.trim()) creator.category = updates.category.trim();
  if (updates.bio !== undefined) creator.bio = updates.bio;
  if (updates.avatar !== undefined && updates.avatar.trim()) creator.avatar = updates.avatar.trim();
  if (updates.banner !== undefined && updates.banner.trim()) creator.banner = updates.banner.trim();
  if (updates.isVerified !== undefined) creator.isVerified = Boolean(updates.isVerified);
  if (updates.status === 'ACTIVE' || updates.status === 'SUSPENDED') {
    creator.status = updates.status;
  }

  // Sync linked user & posts metadata
  const linkedUser = db.users.find(u => u.id === creator.userId || u.id === creator.id);
  if (linkedUser) {
    linkedUser.name = creator.name;
    linkedUser.status = creator.status;
    linkedUser.bio = creator.bio;
    if (creator.avatar) linkedUser.avatar = creator.avatar;
  }
  db.posts.forEach(p => {
    if (p.creatorId === creator.id) {
      p.creatorName = creator.name;
      p.creatorHandle = creator.handle;
    }
  });

  saveDb(db);
  return { success: true, creator };
}

export function deleteCreatorAdmin(creatorIdOrHandle: string): { success: boolean; error?: string } {
  const db = getDb();
  const resolved = resolveCreatorId(creatorIdOrHandle);
  const idx = db.creators.findIndex(
    c =>
      c.id === creatorIdOrHandle ||
      c.id === resolved ||
      c.handle.toLowerCase() === creatorIdOrHandle.replace(/^@/, '').toLowerCase()
  );
  if (idx === -1) return { success: false, error: 'Creator not found' };
  const [removed] = db.creators.splice(idx, 1);
  db.posts = db.posts.filter(p => p.creatorId !== removed.id);
  db.subscriptions = db.subscriptions.filter(s => s.creatorId !== removed.id);
  db.follows = db.follows.filter(f => f.creatorId !== removed.id);
  saveDb(db);
  return { success: true };
}

export function updateCreatorProfileSettings(
  creatorIdOrHandle: string,
  updates: { monthlyPrice?: number; bio?: string; category?: string; name?: string; avatar?: string; banner?: string }
): { success: boolean; creator?: CreatorRecord; error?: string } {
  return updateCreatorAdmin(creatorIdOrHandle, updates);
}

// ======================= TRANSACTIONS & SUBSCRIPTIONS =======================

export function recordTransaction(tx: TransactionRecord): void {
  if (!tx || !tx.id) return;
  const db = getDb();
  db.transactions.unshift(tx);
  saveDb(db);
}

export function subscribeUserToCreator(
  userId: string,
  creatorIdOrHandle: string,
  priceOverride?: number
): SubscriptionRecord | null {
  if (!userId || !creatorIdOrHandle) return null;
  const db = getDb();
  const resolvedId = resolveCreatorId(creatorIdOrHandle);
  const creator = db.creators.find(c => c.id === resolvedId || c.handle === creatorIdOrHandle);
  const user = db.users.find(u => u.id === userId);
  const nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const existing = db.subscriptions.find(s => s.userId === userId && s.creatorId === resolvedId);
  if (existing) {
    existing.status = 'ACTIVE';
    existing.nextBilling = nextBillingDate;
    if (priceOverride && priceOverride > 0) existing.price = priceOverride;
    saveDb(db);
    return existing;
  }

  const newSub: SubscriptionRecord = {
    id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId,
    userName: user?.name || 'Subscriber',
    userHandle: user ? `@${user.username}` : '@subscriber',
    creatorId: resolvedId,
    creatorHandle: creator?.handle || creatorIdOrHandle.replace(/^creator-/, '').replace(/^@/, ''),
    creatorName: creator?.name || getCreatorNameById(resolvedId),
    creatorAvatar:
      creator?.avatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    price: priceOverride || creator?.monthlyPrice || 9.99,
    status: 'ACTIVE',
    startDate: new Date().toISOString(),
    nextBilling: nextBillingDate,
  };

  db.subscriptions.unshift(newSub);
  saveDb(db);
  return newSub;
}

export function getUserSubscriptions(userId: string): SubscriptionRecord[] {
  if (!userId) return [];
  return getDb().subscriptions.filter(s => s.userId === userId && s.status === 'ACTIVE');
}

export function cancelUserSubscription(userId: string, subscriptionId: string): { success: boolean } {
  const db = getDb();
  const sub = db.subscriptions.find(s => s.id === subscriptionId && s.userId === userId);
  if (!sub) return { success: false };
  sub.status = 'CANCELLED';
  saveDb(db);
  return { success: true };
}

export function isUserSubscribedToCreator(userId: string | null | undefined, creatorId: string): boolean {
  if (!userId) return false;
  const resolvedId = resolveCreatorId(creatorId);
  return getDb().subscriptions.some(
    s => s.userId === userId && (s.creatorId === resolvedId || s.creatorId === creatorId) && s.status === 'ACTIVE'
  );
}

// ======================= FOLLOWS =======================

export function getUserFollows(userId: string): FollowRecord[] {
  if (!userId) return [];
  return getDb().follows.filter(f => f.userId === userId);
}

export function followCreator(userId: string, creatorIdOrHandle: string): { success: boolean; follow?: FollowRecord } {
  if (!userId || !creatorIdOrHandle) return { success: false };
  const db = getDb();
  const resolvedId = resolveCreatorId(creatorIdOrHandle);
  const creator = db.creators.find(c => c.id === resolvedId || c.handle === creatorIdOrHandle.replace(/^@/, '').toLowerCase());
  const existing = db.follows.find(
    f => f.userId === userId && (f.creatorId === resolvedId || f.creatorHandle === (creator?.handle || creatorIdOrHandle))
  );
  if (existing) return { success: true, follow: existing };

  const follow: FollowRecord = {
    id: `fol-${Date.now()}`,
    userId,
    creatorId: creator?.id || resolvedId,
    creatorHandle: creator?.handle || creatorIdOrHandle.replace(/^@/, '').toLowerCase(),
    creatorName: creator?.name || getCreatorNameById(resolvedId),
    creatorAvatar:
      creator?.avatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    price: creator?.monthlyPrice || 9.99,
    createdAt: new Date().toISOString(),
  };

  db.follows.unshift(follow);
  if (creator) creator.followersCount += 1;
  saveDb(db);
  return { success: true, follow };
}

export function unfollowCreator(userId: string, creatorIdOrHandle: string): { success: boolean } {
  if (!userId || !creatorIdOrHandle) return { success: false };
  const db = getDb();
  const cleanHandle = creatorIdOrHandle.replace(/^creator-/, '').replace(/^@/, '').toLowerCase();
  const resolvedId = resolveCreatorId(creatorIdOrHandle);
  const idx = db.follows.findIndex(
    f => f.userId === userId && (f.creatorId === resolvedId || f.creatorHandle.toLowerCase() === cleanHandle)
  );
  if (idx === -1) return { success: false };
  db.follows.splice(idx, 1);
  const creator = db.creators.find(c => c.id === resolvedId || c.handle.toLowerCase() === cleanHandle);
  if (creator && creator.followersCount > 0) creator.followersCount -= 1;
  saveDb(db);
  return { success: true };
}

// ======================= CHAT & CUSTOM REQUESTS =======================

export function getChatMessagesForThread(userId: string, creatorHandle: string): ChatMessageRecord[] {
  const cleanHandle = creatorHandle.replace(/^@/, '').toLowerCase();
  const key = `${userId}:${cleanHandle}`;
  return getDb().chatMessages.filter(m => m.conversationKey === key);
}

export function addChatMessage(params: {
  userId: string;
  creatorHandle: string;
  sender: 'user' | 'creator';
  text: string;
  mediaUrl?: string;
  mediaType?: MediaType;
  customRequestId?: string;
}): ChatMessageRecord {
  const db = getDb();
  const cleanHandle = params.creatorHandle.replace(/^@/, '').toLowerCase();
  const msg: ChatMessageRecord = {
    id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    conversationKey: `${params.userId}:${cleanHandle}`,
    userId: params.userId,
    creatorHandle: cleanHandle,
    sender: params.sender,
    text: params.text,
    mediaUrl: params.mediaUrl,
    mediaType: params.mediaType,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    createdAt: new Date().toISOString(),
    customRequestId: params.customRequestId,
  };
  db.chatMessages.push(msg);
  saveDb(db);
  return msg;
}

export function getChatConversationsForUser(params: {
  userId: string;
  mode?: 'user' | 'creator';
  creatorHandle?: string;
}) {
  const db = getDb();
  const mode = params.mode || 'user';

  if (mode === 'creator') {
    const cleanCreatorHandle = (params.creatorHandle || '').replace(/^@/, '').toLowerCase();
    const myCreator =
      db.creators.find(c => cleanCreatorHandle && c.handle.toLowerCase() === cleanCreatorHandle) ||
      db.creators.find(c => c.userId === params.userId || c.id === params.userId) ||
      db.creators[0];
    const handle = myCreator ? myCreator.handle.toLowerCase() : 'luna-rae';

    // Collect all fan users + any userId who messaged or requested custom content from this creator
    const fanMap = new Map<string, { id: string; name: string; username: string; avatar?: string }>();
    db.users.forEach(u => {
      if (u.role !== 'ADMIN' && u.id !== myCreator?.userId && u.id !== myCreator?.id) {
        fanMap.set(u.id, { id: u.id, name: u.name, username: u.username, avatar: u.avatar });
      }
    });
    db.chatMessages.forEach(m => {
      if (m.creatorHandle.toLowerCase() === handle && !fanMap.has(m.userId)) {
        const u = db.users.find(usr => usr.id === m.userId);
        fanMap.set(m.userId, {
          id: m.userId,
          name: u?.name || 'Mirage Member',
          username: u?.username || m.userId,
          avatar: u?.avatar,
        });
      }
    });
    db.customRequests.forEach(r => {
      if (r.creatorHandle.toLowerCase() === handle && !fanMap.has(r.customerId)) {
        fanMap.set(r.customerId, {
          id: r.customerId,
          name: r.customerName || 'Mirage Member',
          username: (r.customerHandle || r.customerId).replace(/^@/, ''),
        });
      }
    });

    const threads = Array.from(fanMap.values()).map(fan => {
      const key = `${fan.id}:${handle}`;
      const msgs = db.chatMessages.filter(m => m.conversationKey === key);
      const last = msgs[msgs.length - 1];
      const reqs = db.customRequests.filter(r => r.customerId === fan.id && r.creatorHandle.toLowerCase() === handle);
      const lastReq = reqs[0];
      const lastTs = last
        ? new Date(last.createdAt).getTime()
        : lastReq
        ? new Date(lastReq.createdAt).getTime()
        : 0;
      return {
        threadKey: key,
        userId: fan.id,
        creatorHandle: handle,
        partnerName: fan.name,
        partnerHandle: `@${fan.username}`,
        partnerAvatar: fan.avatar || '',
        isVerified: true,
        lastMessage: last?.text || (lastReq ? `Custom Request: ${lastReq.title}` : `Direct chat with ${fan.name}`),
        lastTime: last?.time || (lastReq ? 'Request' : 'Online'),
        lastTimestamp: lastTs,
      };
    });

    threads.sort((a, b) => b.lastTimestamp - a.lastTimestamp);
    return { mode: 'creator' as const, activeCreatorHandle: handle, conversations: threads };
  }

  // Subscriber / Member mode: list all active creators dynamically
  const threads = db.creators.map(c => {
    const cleanHandle = c.handle.toLowerCase();
    const key = `${params.userId}:${cleanHandle}`;
    const msgs = db.chatMessages.filter(m => m.conversationKey === key);
    const last = msgs[msgs.length - 1];
    const reqs = db.customRequests.filter(r => r.customerId === params.userId && r.creatorHandle.toLowerCase() === cleanHandle);
    const lastReq = reqs[0];
    const lastTs = last
      ? new Date(last.createdAt).getTime()
      : lastReq
      ? new Date(lastReq.createdAt).getTime()
      : 0;
    return {
      threadKey: key,
      userId: params.userId,
      creatorHandle: cleanHandle,
      partnerName: c.name,
      partnerHandle: `@${c.handle}`,
      partnerAvatar: c.avatar,
      category: c.category,
      isVerified: c.isVerified,
      lastMessage: last?.text || (lastReq ? `Custom Request: ${lastReq.title}` : `Message ${c.name} 1-on-1`),
      lastTime: last?.time || 'Online',
      lastTimestamp: lastTs,
    };
  });

  threads.sort((a, b) => b.lastTimestamp - a.lastTimestamp);
  return { mode: 'user' as const, activeCreatorHandle: null, conversations: threads };
}

export function getCustomRequests(filters?: { creatorId?: string; customerId?: string }): CustomRequestRecord[] {
  let list = [...getDb().customRequests];
  if (filters?.creatorId) {
    const resolved = resolveCreatorId(filters.creatorId);
    const clean = filters.creatorId.replace(/^@/, '').toLowerCase();
    list = list.filter(
      r => r.creatorId === resolved || r.creatorId === filters.creatorId || r.creatorHandle.toLowerCase() === clean
    );
  }
  if (filters?.customerId) {
    list = list.filter(r => r.customerId === filters.customerId);
  }
  return list;
}

export function createCustomRequest(params: {
  customerId: string;
  customerName?: string;
  customerHandle?: string;
  creatorIdOrHandle: string;
  title: string;
  description?: string;
  price: number;
  paid?: boolean;
}): CustomRequestRecord {
  const db = getDb();
  const resolvedCreator = resolveCreatorId(params.creatorIdOrHandle);
  const creator = db.creators.find(
    c => c.id === resolvedCreator || c.handle === params.creatorIdOrHandle.replace(/^@/, '').toLowerCase()
  );
  const customer = db.users.find(u => u.id === params.customerId);
  const now = new Date().toISOString();
  const numericPrice = Math.max(5, Number(params.price) || 35);

  const reqItem: CustomRequestRecord = {
    id: `req-${Date.now()}`,
    customerId: params.customerId,
    customerName: params.customerName || customer?.name || 'Subscriber',
    customerHandle: params.customerHandle || (customer ? `@${customer.username}` : '@subscriber'),
    creatorId: creator?.id || resolvedCreator,
    creatorHandle: creator?.handle || params.creatorIdOrHandle.replace(/^@/, '').toLowerCase(),
    creatorName: creator?.name || getCreatorNameById(resolvedCreator),
    title: params.title,
    description: params.description || params.title,
    price: numericPrice,
    status: params.paid ? 'AWAITING_DELIVERY' : 'PENDING_PAYMENT',
    createdAt: now,
  };

  db.customRequests.unshift(reqItem);

  if (params.paid) {
    const split = calculateCommission(numericPrice, db.settings.creatorCommissionPercent);
    db.transactions.unshift({
      id: `tx_cust_${Date.now()}`,
      transactionReference: `MIRAGE_CUST_${Date.now()}`,
      userId: reqItem.customerId,
      userName: reqItem.customerName,
      creatorId: reqItem.creatorId,
      creatorName: reqItem.creatorName,
      postTitle: reqItem.title,
      type: 'CUSTOM_CONTENT',
      grossAmount: split.grossAmount,
      creatorShare: split.creatorShare,
      platformShare: split.platformShare,
      feeAmount: 0,
      currency: 'USD',
      status: 'SUCCESS',
      paymentGateway: 'MIRAGE_PAY',
      gatewayReference: `gw_cust_${Date.now()}`,
      createdAt: now,
    });
  }

  saveDb(db);
  return reqItem;
}

export function payCustomRequest(requestId: string, userId: string): { success: boolean; request?: CustomRequestRecord; error?: string } {
  const db = getDb();
  const reqItem = db.customRequests.find(r => r.id === requestId);
  if (!reqItem) return { success: false, error: 'Custom request not found' };
  if (reqItem.status !== 'PENDING_PAYMENT') {
    return { success: true, request: reqItem };
  }

  const split = calculateCommission(reqItem.price, db.settings.creatorCommissionPercent);
  const now = new Date().toISOString();
  reqItem.status = 'AWAITING_DELIVERY';

  db.transactions.unshift({
    id: `tx_cust_${Date.now()}`,
    transactionReference: `MIRAGE_CUST_${Date.now()}`,
    userId: userId || reqItem.customerId,
    userName: reqItem.customerName,
    creatorId: reqItem.creatorId,
    creatorName: reqItem.creatorName,
    postTitle: reqItem.title,
    type: 'CUSTOM_CONTENT',
    grossAmount: split.grossAmount,
    creatorShare: split.creatorShare,
    platformShare: split.platformShare,
    feeAmount: 0,
    currency: 'USD',
    status: 'SUCCESS',
    paymentGateway: 'MIRAGE_PAY',
    gatewayReference: `gw_cust_${Date.now()}`,
    createdAt: now,
  });

  saveDb(db);
  return { success: true, request: reqItem };
}

export function deliverCustomRequest(
  requestId: string,
  deliveredMediaUrl: string
): { success: boolean; request?: CustomRequestRecord; error?: string } {
  const db = getDb();
  const reqItem = db.customRequests.find(r => r.id === requestId);
  if (!reqItem) return { success: false, error: 'Custom order not found' };
  if (!deliveredMediaUrl.trim()) return { success: false, error: 'Delivery media URL is required' };

  const now = new Date().toISOString();
  reqItem.status = 'DELIVERED';
  reqItem.deliveredMediaUrl = deliveredMediaUrl.trim();
  reqItem.deliveredAt = now;

  // Unlock into subscriber's Private Vault automatically
  const existingVault = db.purchases.find(p => p.customRequestId === reqItem.id);
  if (!existingVault) {
    const isVideo = /\.(mp4|mov|webm)(\?|$)/i.test(reqItem.deliveredMediaUrl);
    const creator = db.creators.find(c => c.id === reqItem.creatorId || c.handle === reqItem.creatorHandle);
    db.purchases.unshift({
      id: `pur-cust-${Date.now()}`,
      userId: reqItem.customerId,
      customRequestId: reqItem.id,
      title: `Custom Order: ${reqItem.title}`,
      creatorId: reqItem.creatorId,
      creatorName: reqItem.creatorName,
      creatorHandle: reqItem.creatorHandle,
      mediaType: isVideo ? 'VIDEO' : 'IMAGE',
      accessUrl: reqItem.deliveredMediaUrl,
      thumbnailUrl: isVideo
        ? creator?.avatar || reqItem.deliveredMediaUrl
        : reqItem.deliveredMediaUrl,
      price: reqItem.price,
      purchasedAt: now,
    });
  }

  saveDb(db);
  return { success: true, request: reqItem };
}

export function updateCustomRequest(
  requestId: string,
  updates: { title?: string; description?: string; price?: number; status?: CustomRequestRecord['status'] }
): { success: boolean; request?: CustomRequestRecord; error?: string } {
  const db = getDb();
  const reqItem = db.customRequests.find(r => r.id === requestId);
  if (!reqItem) return { success: false, error: 'Custom order not found' };
  if (updates.title !== undefined && updates.title.trim()) reqItem.title = updates.title.trim();
  if (updates.description !== undefined) reqItem.description = updates.description;
  if (updates.price !== undefined) {
    const p = Number(updates.price);
    if (!Number.isFinite(p) || p < 1) return { success: false, error: 'Invalid price' };
    reqItem.price = Number(p.toFixed(2));
  }
  if (updates.status) reqItem.status = updates.status;
  saveDb(db);
  return { success: true, request: reqItem };
}

export function deleteCustomRequest(requestId: string): { success: boolean; error?: string } {
  const db = getDb();
  const idx = db.customRequests.findIndex(r => r.id === requestId);
  if (idx === -1) return { success: false, error: 'Custom order not found' };
  db.customRequests.splice(idx, 1);
  saveDb(db);
  return { success: true };
}

// ======================= POSTS, MEDIA & PPV VAULT =======================

export function getCreatorStudioPosts(creatorHandle?: string): PostItem[] {
  const db = getDb();
  if (!creatorHandle) return [...db.posts];
  const cleanHandle = creatorHandle.replace(/^@/, '').toLowerCase();
  return db.posts.filter(p => p.creatorHandle.toLowerCase() === cleanHandle);
}

export function hasUserPurchasedPost(userId: string | null | undefined, postId: string): boolean {
  if (!userId) return false;
  return getDb().purchases.some(p => p.userId === userId && p.postId === postId);
}

export function checkMediaAuthorization(
  userId: string | null | undefined,
  postId: string
): { authorized: boolean; post?: PostItem; error?: string } {
  const post = getDb().posts.find(p => p.id === postId);
  if (!post) {
    return { authorized: false, error: 'Post not found' };
  }

  if (userId && post.creatorId === userId) {
    return { authorized: true, post };
  }

  if (post.isPublicPreview || post.visibility === 'PUBLIC') {
    return { authorized: true, post };
  }

  if (post.visibility === 'SUBSCRIBER_ONLY') {
    if (isUserSubscribedToCreator(userId, post.creatorId)) {
      return { authorized: true, post };
    }
    return { authorized: false, error: 'Subscription required to view this content' };
  }

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

export function getFeedForUser(creatorHandle?: string, userId?: string | null): PostItem[] {
  let list = getDb().posts.filter(p => p.status === 'PUBLISHED');

  if (creatorHandle) {
    const cleanHandle = creatorHandle.replace(/^@/, '').toLowerCase();
    list = list.filter(p => p.creatorHandle.toLowerCase() === cleanHandle);
  }

  return list.map(post => {
    if (post.isPublicPreview || post.visibility === 'PUBLIC') {
      return post;
    }

    const isOwner = userId === post.creatorId;
    const isSubscribed = isUserSubscribedToCreator(userId, post.creatorId);
    const hasPurchased = hasUserPurchasedPost(userId, post.id);

    if (post.visibility === 'PURCHASE_ONLY' && !isOwner && !hasPurchased) {
      return {
        ...post,
        mediaUrl: '',
        thumbnailUrl: post.thumbnailUrl,
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

export function purchaseIndividualContent(params: {
  userId: string;
  userName?: string;
  postId: string;
}): { success: boolean; purchase?: PurchaseRecord; transaction?: TransactionRecord; error?: string } {
  const { userId, userName = 'Subscriber', postId } = params;
  const db = getDb();

  const post = db.posts.find(p => p.id === postId);
  if (!post) {
    return { success: false, error: 'Content not found' };
  }

  if (post.status !== 'PUBLISHED') {
    return { success: false, error: 'This content is not currently available for purchase.' };
  }

  if (post.creatorId === userId) {
    return { success: false, error: 'Creators cannot purchase their own content.' };
  }

  const existingPurchase = db.purchases.find(p => p.userId === userId && p.postId === postId);
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

  const split = calculateCommission(grossAmount, db.settings.creatorCommissionPercent);
  const now = new Date().toISOString();
  const txRef = `MIRAGE_PPV_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  const newPurchase: PurchaseRecord = {
    id: `pur-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId,
    postId: post.id,
    title: post.title,
    creatorId: post.creatorId,
    creatorName: post.creatorName,
    creatorHandle: post.creatorHandle,
    mediaType: post.mediaType,
    accessUrl: post.mediaUrl,
    thumbnailUrl: post.thumbnailUrl,
    price: grossAmount,
    purchasedAt: now,
  };

  db.purchases.unshift(newPurchase);
  post.salesCount = (post.salesCount || 0) + 1;

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
    creatorShare: split.creatorShare,
    platformShare: split.platformShare,
    feeAmount: 0.0,
    currency: 'USD',
    status: 'SUCCESS',
    paymentGateway: 'MIRAGE_PAY',
    gatewayReference: `gw_${Date.now()}`,
    createdAt: now,
  };

  db.transactions.unshift(newTransaction);
  saveDb(db);

  return {
    success: true,
    purchase: newPurchase,
    transaction: newTransaction,
  };
}

export function getUserPurchasesLibrary(userId: string): PurchaseRecord[] {
  return getDb().purchases.filter(p => p.userId === userId);
}

export function getUserTransactions(userId: string): TransactionRecord[] {
  if (!userId) return [];
  return getDb().transactions.filter(t => t.userId === userId);
}

export function getCreatorPublicPreviews(creatorHandle: string): {
  photos: PostItem[];
  videos: PostItem[];
  totalPhotos: number;
  totalVideos: number;
} {
  const cleanHandle = creatorHandle.replace(/^@/, '').toLowerCase();
  const creatorPosts = getDb().posts.filter(
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

export function getCreatorPreviewCounts(creatorId: string): {
  photos: number;
  videos: number;
  maxPhotos: number;
  maxVideos: number;
  canAddPhoto: boolean;
  canAddVideo: boolean;
} {
  const creatorPosts = getDb().posts.filter(
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
  videoDuration?: string;
  visibility: Visibility;
  status?: PostStatus;
  price?: number;
  isPublicPreview?: boolean;
}): PostItem {
  const isPreview = !!data.isPublicPreview;
  const db = getDb();
  const cleanHandle = (data.creatorHandle || '').toLowerCase();
  const creator = db.creators.find(
    c =>
      c.id === data.creatorId ||
      c.userId === data.creatorId ||
      (cleanHandle && c.handle.toLowerCase() === cleanHandle)
  );
  const resolvedCreatorId = creator?.id || data.creatorHandle || data.creatorId;

  if (isPreview) {
    const counts = getCreatorPreviewCounts(resolvedCreatorId);
    if (data.mediaType === 'IMAGE' && !counts.canAddPhoto) {
      throw new Error('Maximum of 3 public preview photos allowed per creator. Please unmark an existing preview photo first.');
    }
    if (data.mediaType === 'VIDEO' && !counts.canAddVideo) {
      throw new Error('Maximum of 2 public preview videos allowed per creator. Please unmark an existing preview video first.');
    }
  }

  const visibility = isPreview ? 'PUBLIC' : data.visibility;

  const newPost: PostItem = {
    id: `post-${Date.now()}`,
    creatorId: creator?.id || data.creatorId,
    creatorHandle: creator?.handle || data.creatorHandle,
    creatorName: creator?.name || data.creatorName,
    creatorAvatar:
      data.creatorAvatar ||
      creator?.avatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    title: data.title,
    caption: data.caption,
    mediaType: data.mediaType,
    mediaUrl: data.mediaUrl,
    thumbnailUrl: data.thumbnailUrl || data.mediaUrl,
    previewUrl: data.previewUrl || (data.mediaType === 'VIDEO' ? data.mediaUrl : undefined),
    videoDuration: data.videoDuration || (data.mediaType === 'VIDEO' ? '1:00' : undefined),
    visibility,
    isPublicPreview: isPreview,
    status: data.status || 'PUBLISHED',
    price: (!isPreview && visibility === 'PURCHASE_ONLY') ? Number(data.price || 0) : 0,
    likeCount: 0,
    salesCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.posts.unshift(newPost);
  saveDb(db);
  return newPost;
}

export function updatePostDetails(
  postId: string,
  creatorId: string,
  updates: Partial<Pick<PostItem, 'price' | 'status' | 'title' | 'caption' | 'thumbnailUrl' | 'mediaUrl' | 'mediaType' | 'visibility' | 'isPublicPreview'>>
): { success: boolean; post?: PostItem; error?: string } {
  const db = getDb();
  const post = db.posts.find(p => p.id === postId);
  if (!post) {
    return { success: false, error: 'Post not found' };
  }

  const resolvedCreator = resolveCreatorId(creatorId);
  if (post.creatorId !== creatorId && post.creatorId !== resolvedCreator) {
    return { success: false, error: 'Unauthorized to edit this post' };
  }

  if (updates.visibility !== undefined) {
    post.visibility = updates.visibility;
    if (updates.visibility !== 'PURCHASE_ONLY') {
      post.price = 0;
    }
    if (updates.visibility !== 'PUBLIC' && updates.isPublicPreview === undefined) {
      post.isPublicPreview = false;
    }
  }

  if (updates.isPublicPreview !== undefined && updates.isPublicPreview !== post.isPublicPreview) {
    if (updates.isPublicPreview) {
      const counts = getCreatorPreviewCounts(post.creatorId);
      if (post.mediaType === 'IMAGE' && !counts.canAddPhoto) {
        return { success: false, error: 'Maximum of 3 public preview photos allowed per creator. Please unmark an existing preview photo first.' };
      }
      if (post.mediaType === 'VIDEO' && !counts.canAddVideo) {
        return { success: false, error: 'Maximum of 2 public preview videos allowed per creator. Please unmark an existing preview video first.' };
      }
      post.isPublicPreview = true;
      post.visibility = 'PUBLIC';
      post.price = 0;
    } else {
      post.isPublicPreview = false;
    }
  }

  if (updates.price !== undefined) {
    post.price = Number(updates.price);
  }
  if (updates.status !== undefined) {
    if (updates.status === 'PUBLISHED' && post.status !== 'PUBLISHED' && post.isPublicPreview) {
      const counts = getCreatorPreviewCounts(post.creatorId);
      if (post.mediaType === 'IMAGE' && !counts.canAddPhoto) {
        return { success: false, error: 'Maximum of 3 public preview photos allowed per creator. Please unmark an existing preview photo first.' };
      }
      if (post.mediaType === 'VIDEO' && !counts.canAddVideo) {
        return { success: false, error: 'Maximum of 2 public preview videos allowed per creator. Please unmark an existing preview video first.' };
      }
    }
    post.status = updates.status;
  }
  if (updates.title !== undefined && updates.title.trim()) post.title = updates.title.trim();
  if (updates.caption !== undefined) post.caption = updates.caption;
  if (updates.mediaUrl !== undefined && updates.mediaUrl.trim()) post.mediaUrl = updates.mediaUrl.trim();
  if (updates.thumbnailUrl !== undefined && updates.thumbnailUrl.trim()) post.thumbnailUrl = updates.thumbnailUrl.trim();
  if (updates.mediaType !== undefined) post.mediaType = updates.mediaType;
  post.updatedAt = new Date().toISOString();

  saveDb(db);
  return { success: true, post };
}

export function deletePost(
  postId: string,
  requesterCreatorIdOrAdmin: string,
  isAdmin = false
): { success: boolean; error?: string } {
  const db = getDb();
  const idx = db.posts.findIndex(p => p.id === postId);
  if (idx === -1) return { success: false, error: 'Post not found' };
  const target = db.posts[idx];
  if (!isAdmin) {
    const resolvedCreator = resolveCreatorId(requesterCreatorIdOrAdmin);
    if (target.creatorId !== requesterCreatorIdOrAdmin && target.creatorId !== resolvedCreator) {
      return { success: false, error: 'Unauthorized to delete this post' };
    }
  }
  db.posts.splice(idx, 1);
  saveDb(db);
  return { success: true };
}

// ======================= CREATOR EARNINGS & ADMIN DASHBOARD =======================

export function getCreatorSegregatedEarnings(creatorId: string) {
  const db = getDb();
  const resolvedId = resolveCreatorId(creatorId);
  const creatorTxs = db.transactions.filter(
    t => (t.creatorId === creatorId || t.creatorId === resolvedId) && t.status === 'SUCCESS'
  );
  const creatorProfile = db.creators.find(c => c.id === resolvedId || c.id === creatorId);
  const activeSubscribers = db.subscriptions.filter(
    s => (s.creatorId === resolvedId || s.creatorId === creatorId) && s.status === 'ACTIVE'
  );

  const subTxs = creatorTxs.filter(t => t.type === 'SUBSCRIPTION');
  const subscriptionGross = subTxs.reduce((sum, t) => sum + t.grossAmount, 0);
  const subscriptionCreatorNet = subTxs.reduce((sum, t) => sum + t.creatorShare, 0);
  const subscriptionPlatformCut = subTxs.reduce((sum, t) => sum + t.platformShare, 0);

  const ppvTxs = creatorTxs.filter(t => t.type === 'INDIVIDUAL_CONTENT');
  const ppvGross = ppvTxs.reduce((sum, t) => sum + t.grossAmount, 0);
  const ppvCreatorNet = ppvTxs.reduce((sum, t) => sum + t.creatorShare, 0);
  const ppvPlatformCut = ppvTxs.reduce((sum, t) => sum + t.platformShare, 0);

  const custTxs = creatorTxs.filter(t => t.type === 'CUSTOM_CONTENT');
  const customGross = custTxs.reduce((sum, t) => sum + t.grossAmount, 0);
  const customCreatorNet = custTxs.reduce((sum, t) => sum + t.creatorShare, 0);
  const customPlatformCut = custTxs.reduce((sum, t) => sum + t.platformShare, 0);

  const totalGross = subscriptionGross + ppvGross + customGross;
  const totalCreatorNet = subscriptionCreatorNet + ppvCreatorNet + customCreatorNet;
  const totalPlatformCut = subscriptionPlatformCut + ppvPlatformCut + customPlatformCut;

  return {
    creatorId: resolvedId || creatorId,
    creatorProfile: creatorProfile || null,
    activeSubscribersCount: activeSubscribers.length,
    subscribersList: activeSubscribers.map(sub => {
      const userSpent = creatorTxs
        .filter(t => t.userId === sub.userId)
        .reduce((s, t) => s + t.grossAmount, 0);
      return {
        id: sub.id,
        userId: sub.userId,
        name: sub.userName,
        handle: sub.userHandle,
        status: sub.status,
        joined: new Date(sub.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        totalSpent: `$${Math.max(sub.price, userSpent).toFixed(2)}`,
      };
    }),
    subscriptions: {
      count: subTxs.length,
      grossAmount: Number(subscriptionGross.toFixed(2)),
      creatorNet: Number(subscriptionCreatorNet.toFixed(2)),
      platformShare: Number(subscriptionPlatformCut.toFixed(2)),
    },
    individualContent: {
      count: ppvTxs.length,
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
      commissionSplit: `${db.settings.creatorCommissionPercent}% Creator / ${db.settings.platformCommissionPercent}% Platform`,
    },
    recentTransactions: creatorTxs.slice(0, 25),
    settings: db.settings,
  };
}

export function getAdminCatalogList(filters?: { status?: string; mediaType?: string }) {
  let list = [...getDb().posts];
  if (filters?.status && filters.status !== 'ALL') {
    list = list.filter(p => p.status === filters.status);
  }
  if (filters?.mediaType && filters.mediaType !== 'ALL') {
    list = list.filter(p => p.mediaType === filters.mediaType);
  }
  return list;
}

export function setPostStatusAdmin(postId: string, status: PostStatus): { success: boolean; post?: PostItem } {
  const db = getDb();
  const post = db.posts.find(p => p.id === postId);
  if (!post) return { success: false };
  post.status = status;
  post.updatedAt = new Date().toISOString();
  saveDb(db);
  return { success: true, post };
}

export function updatePostAdmin(
  postId: string,
  updates: Partial<Pick<PostItem, 'price' | 'status' | 'title' | 'caption' | 'thumbnailUrl' | 'mediaUrl' | 'mediaType' | 'visibility' | 'isPublicPreview'>>
): { success: boolean; post?: PostItem; error?: string } {
  const post = getDb().posts.find(p => p.id === postId);
  if (!post) return { success: false, error: 'Post not found' };
  return updatePostDetails(postId, post.creatorId, updates);
}

export function getAdminTransactions(filters?: { type?: string; search?: string }) {
  let list = [...getDb().transactions];
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

export function issueRefundAdmin(txId: string): { success: boolean; transaction?: TransactionRecord } {
  const db = getDb();
  const tx = db.transactions.find(t => t.id === txId);
  if (!tx) return { success: false };
  tx.status = 'REFUNDED';
  saveDb(db);
  return { success: true, transaction: tx };
}

export function deleteTransactionAdmin(txId: string): { success: boolean } {
  const db = getDb();
  const idx = db.transactions.findIndex(t => t.id === txId);
  if (idx === -1) return { success: false };
  db.transactions.splice(idx, 1);
  saveDb(db);
  return { success: true };
}

export function getAdminReports(): ContentReportRecord[] {
  return [...getDb().reports];
}

export function updateReportStatusAdmin(
  reportId: string,
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED',
  postAction?: PostStatus
): { success: boolean; report?: ContentReportRecord } {
  const db = getDb();
  const report = db.reports.find(r => r.id === reportId);
  if (!report) return { success: false };
  report.status = status;
  if (postAction && report.postId) {
    const post = db.posts.find(p => p.id === report.postId);
    if (post) {
      post.status = postAction;
      post.updatedAt = new Date().toISOString();
    }
  }
  saveDb(db);
  return { success: true, report };
}

export function deleteReportAdmin(reportId: string): { success: boolean } {
  const db = getDb();
  const idx = db.reports.findIndex(r => r.id === reportId);
  if (idx === -1) return { success: false };
  db.reports.splice(idx, 1);
  saveDb(db);
  return { success: true };
}

export function getAdminOverviewData() {
  const db = getDb();
  const activeTxs = db.transactions.filter(t => t.status === 'SUCCESS');

  const subscriptionVolume = activeTxs
    .filter(t => t.type === 'SUBSCRIPTION')
    .reduce((sum, t) => sum + t.grossAmount, 0);
  const ppvContentVolume = activeTxs
    .filter(t => t.type === 'INDIVIDUAL_CONTENT')
    .reduce((sum, t) => sum + t.grossAmount, 0);
  const customRequestsVolume = activeTxs
    .filter(t => t.type === 'CUSTOM_CONTENT')
    .reduce((sum, t) => sum + t.grossAmount, 0);

  const totalGross = subscriptionVolume + ppvContentVolume + customRequestsVolume;
  const totalCreatorNet = activeTxs.reduce((sum, t) => sum + t.creatorShare, 0);
  const totalPlatformCut = activeTxs.reduce((sum, t) => sum + t.platformShare, 0);

  return {
    metrics: {
      subscriptionVolume: Number(subscriptionVolume.toFixed(2)),
      ppvContentVolume: Number(ppvContentVolume.toFixed(2)),
      customRequestsVolume: Number(customRequestsVolume.toFixed(2)),
      totalGross: Number(totalGross.toFixed(2)),
      totalCreatorNet: Number(totalCreatorNet.toFixed(2)),
      totalPlatformCut: Number(totalPlatformCut.toFixed(2)),
      activeUsersCount: db.users.filter(u => u.status === 'ACTIVE').length,
      totalUsersCount: db.users.length,
      totalCreatorsCount: db.creators.length,
      pendingReportsCount: db.reports.filter(r => r.status === 'PENDING').length,
    },
    users: [...db.users],
    creators: listAllCreators(),
    transactions: [...db.transactions],
    reports: [...db.reports],
    settings: { ...db.settings },
  };
}

// Reset store (used in automated testing)
export function resetStoreForTesting() {
  globalThis.__mirageDb = createInitialDb();
  saveDb(globalThis.__mirageDb);
}

