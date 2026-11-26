'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Crown,
  CheckCircle2,
  Lock,
  Heart,
  Calendar,
  Grid,
  Image as ImageIcon,
  Video,
  Info,
  DollarSign,
  Sparkles,
  CreditCard,
  Play,
  Layers,
  X,
  Eye,
  Maximize2,
  Volume2,
} from 'lucide-react';
import SubscribeModal from '@/components/SubscribeModal';
import PurchaseContentModal from '@/components/PurchaseContentModal';

export interface PostItem {
  id: string;
  type: 'image' | 'video';
  mediaUrl: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  videoDuration?: string;
  title?: string;
  caption: string;
  isLocked: boolean;
  isPublicPreview?: boolean;
  visibility: 'PUBLIC' | 'SUBSCRIBER_ONLY' | 'PURCHASE_ONLY';
  price: number;
  hasPurchased?: boolean;
  likes: number;
  date: string;
}

export interface PreviewPhotoItem {
  id: string;
  title: string;
  caption: string;
  mediaUrl: string;
  thumbnailUrl: string;
  likes?: number;
}

export interface PreviewVideoItem {
  id: string;
  title: string;
  caption: string;
  mediaUrl: string;
  thumbnailUrl: string;
  previewUrl?: string;
  videoDuration: string;
  likes?: number;
}

const CREATOR_DATA: Record<string, any> = {
  'luna-rae': {
    name: 'Luna Rae',
    handle: '@luna-rae',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    banner: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1400&q=80',
    bio: 'Fashion model, fitness enthusiast and creative visual storyteller. Sharing my exclusive lifestyle, behind the scenes, and direct chat moments with you.',
    monthlyPrice: 9.99,
    followersCount: '128K',
    postsCount: 48,
    likesCount: '340K',
    category: 'Popular',
    photoPreviews: [
      {
        id: 'post-luna-prev-img-1',
        title: 'Santorini Sunset Editorial',
        caption: 'Golden hour shot over Oia cliffs. One of my favorite looks from the summer campaign.',
        mediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1600&q=90',
        thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        likes: 1420,
      },
      {
        id: 'post-luna-prev-img-2',
        title: 'Parisian Morning Bloom',
        caption: 'Early morning coffee on the private balcony overlooking the city.',
        mediaUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1600&q=90',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
        likes: 980,
      },
      {
        id: 'post-luna-prev-img-3',
        title: 'Milan Haute Couture Session',
        caption: 'Studio lighting test before Milan Fashion Week runway show.',
        mediaUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1600&q=90',
        thumbnailUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
        likes: 1650,
      },
    ],
    videoPreviews: [
      {
        id: 'post-luna-prev-vid-1',
        title: 'Paris Runway Fashion Week Teaser',
        caption: 'Exclusive backstage sneak peek into the 2026 autumn runway collection.',
        mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
        previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        videoDuration: '0:45',
        likes: 2310,
      },
      {
        id: 'post-luna-prev-vid-2',
        title: 'Sunset Studio BTS Clip',
        caption: 'Behind the lens of our private coastal editorial shoot.',
        mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
        previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        videoDuration: '1:15',
        likes: 3120,
      },
    ],
  },
  'mia-carter': {
    name: 'Mia Carter',
    handle: '@mia-carter',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    banner: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1400&q=80',
    bio: 'Lifestyle creator, wellness guide, and everyday glamour enthusiast. Join my private community for daily looks, personal vlogs, and 1-on-1 chats.',
    monthlyPrice: 7.99,
    followersCount: '95K',
    postsCount: 42,
    likesCount: '290K',
    category: 'Lifestyle',
    photoPreviews: [
      {
        id: 'post-mia-prev-img-1',
        title: 'Golden Sunset Terrace',
        caption: 'Unwinding after an all-day editorial session in Malibu.',
        mediaUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1600&q=90',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
        likes: 1240,
      },
      {
        id: 'post-mia-prev-img-2',
        title: 'Summer Glow Portrait',
        caption: 'Natural lighting and warm reflections in my studio.',
        mediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1600&q=90',
        thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        likes: 1105,
      },
      {
        id: 'post-mia-prev-img-3',
        title: 'Evening Elegance in Black & Gold',
        caption: 'Sneak preview from our private luxury gallery release.',
        mediaUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1600&q=90',
        thumbnailUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
        likes: 1480,
      },
    ],
    videoPreviews: [
      {
        id: 'post-mia-prev-vid-1',
        title: 'Malibu Sunset Studio Vlog',
        caption: 'Sneak peek into my daily creative routine and studio setup.',
        mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
        previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        videoDuration: '0:50',
        likes: 2190,
      },
      {
        id: 'post-mia-prev-vid-2',
        title: 'Behind the Scenes — Glamour Look',
        caption: 'Full backstage lighting test and camera prep.',
        mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
        previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        videoDuration: '1:10',
        likes: 2850,
      },
    ],
  },
  'sophie-lee': {
    name: 'Sophie Lee',
    handle: '@sophie-lee',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
    banner: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1400&q=80',
    bio: 'Tokyo-based editorial model and visual creator. Neon aesthetics, travel cinematography, and private subscriber logs.',
    monthlyPrice: 9.99,
    followersCount: '180K',
    postsCount: 36,
    likesCount: '210K',
    category: 'Cosplay',
    photoPreviews: [
      {
        id: 'post-sophie-prev-img-1',
        title: 'Shibuya Neon Nightfall',
        caption: 'Rain reflections and cyberpunk vibes in central Tokyo.',
        mediaUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1600&q=90',
        thumbnailUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
        likes: 1980,
      },
      {
        id: 'post-sophie-prev-img-2',
        title: 'Akihabara Fantasy Costume',
        caption: 'Handcrafted cosplay costume reveal for my members.',
        mediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1600&q=90',
        thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        likes: 1540,
      },
      {
        id: 'post-sophie-prev-img-3',
        title: 'Kyoto Temple Garden Walk',
        caption: 'Traditional kimono look amidst autumn blossoms.',
        mediaUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1600&q=90',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
        likes: 1720,
      },
    ],
    videoPreviews: [
      {
        id: 'post-sophie-prev-vid-1',
        title: 'Tokyo Neon Nights Teaser',
        caption: 'Late night wander through Shinjuku alleys and arcade halls.',
        mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
        previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        videoDuration: '0:40',
        likes: 2450,
      },
      {
        id: 'post-sophie-prev-vid-2',
        title: 'Cosplay Crafting & Fitting',
        caption: 'Sewing and styling the newest fantasy character look.',
        mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
        previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        videoDuration: '1:05',
        likes: 2900,
      },
    ],
  },
  'zara-khan': {
    name: 'Zara Khan',
    handle: '@zara-khan',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
    banner: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80',
    bio: 'International luxury travel vlogger and photographer. Exploring hidden gems and private escapes across the globe.',
    monthlyPrice: 12.99,
    followersCount: '210K',
    postsCount: 54,
    likesCount: '480K',
    category: 'Travel',
    photoPreviews: [
      {
        id: 'post-zara-prev-img-1',
        title: 'Dubai Desert Horizon',
        caption: 'Golden dunes and sunset reflections on private safari.',
        mediaUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1600&q=90',
        thumbnailUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
        likes: 2100,
      },
      {
        id: 'post-zara-prev-img-2',
        title: 'Maldives Overwater Bungalow',
        caption: 'Morning swim in crystal turquoise waters.',
        mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=90',
        thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        likes: 2650,
      },
      {
        id: 'post-zara-prev-img-3',
        title: 'Amalfi Coast Viewpoint',
        caption: 'Classic Italian coastal colors and cliffside terrace.',
        mediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1600&q=90',
        thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        likes: 1890,
      },
    ],
    videoPreviews: [
      {
        id: 'post-zara-prev-vid-1',
        title: 'Maldives Drone Cinema Teaser',
        caption: 'Aerial views of private coral islands and sunset lagoons.',
        mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        videoDuration: '0:55',
        likes: 3410,
      },
      {
        id: 'post-zara-prev-vid-2',
        title: 'Dubai High-Rise Penthouse Tour',
        caption: 'Exclusive tour of our VIP suite overlooking the marina.',
        mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
        previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        videoDuration: '1:20',
        likes: 3950,
      },
    ],
  },
  'emily-rose': {
    name: 'Emily Rose',
    handle: '@emily-rose',
    avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80',
    banner: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1400&q=80',
    bio: 'Fitness coach, athlete and daily motivation mentor. High intensity routines, nutrition guides, and personal training tips.',
    monthlyPrice: 8.99,
    followersCount: '98K',
    postsCount: 40,
    likesCount: '275K',
    category: 'Fitness',
    photoPreviews: [
      {
        id: 'post-emily-prev-img-1',
        title: 'Sunrise Beach HIIT Session',
        caption: 'Pushing boundaries with morning endurance sprints on the sand.',
        mediaUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1600&q=90',
        thumbnailUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
        likes: 1420,
      },
      {
        id: 'post-emily-prev-img-2',
        title: 'Studio Strength Form & Conditioning',
        caption: 'Focusing on core posture, breathing, and maximum control.',
        mediaUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1600&q=90',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
        likes: 1290,
      },
      {
        id: 'post-emily-prev-img-3',
        title: 'Post-Workout Recovery & Hydration',
        caption: 'My favorite clean smoothie recipe and cooldown stretches.',
        mediaUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1600&q=90',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
        likes: 1560,
      },
    ],
    videoPreviews: [
      {
        id: 'post-emily-prev-vid-1',
        title: '10-Minute Morning Warmup Routine',
        caption: 'Follow-along mobility and activation flow before daily training.',
        mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
        previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        videoDuration: '0:45',
        likes: 2150,
      },
      {
        id: 'post-emily-prev-vid-2',
        title: 'Core & Glutes Blast Preview',
        caption: 'Quick highlights of my subscriber-only 45-min masterclass.',
        mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
        previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        videoDuration: '1:00',
        likes: 2840,
      },
    ],
  },
};

function CreatorProfileContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawParam = params?.handle;
  const rawHandle = (Array.isArray(rawParam) ? rawParam[0] : (rawParam as string)) || 'luna-rae';
  const decodedHandle = decodeURIComponent(rawHandle);
  const cleanHandle = decodedHandle.replace(/^@/, '').toLowerCase();

  const [activeTab, setActiveTab] = useState<'posts' | 'photos' | 'videos' | 'subscription' | 'paid' | 'about'>('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [selectedPurchasePost, setSelectedPurchasePost] = useState<PostItem | null>(null);

  // Lightbox & Video Player modal states for public previews
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState<PreviewPhotoItem | null>(null);
  const [activeVideoPreview, setActiveVideoPreview] = useState<PreviewVideoItem | null>(null);

  // Dynamic creator metadata
  const baseCreator = CREATOR_DATA[cleanHandle] || {
    name: cleanHandle.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
    handle: `@${cleanHandle}`,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    banner: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1400&q=80',
    bio: 'Exclusive creator on The Mirage. Explore my curated public previews and subscribe for complete access.',
    monthlyPrice: 9.99,
    followersCount: '110K',
    postsCount: 42,
    likesCount: '280K',
    category: 'Popular',
    photoPreviews: CREATOR_DATA['luna-rae'].photoPreviews,
    videoPreviews: CREATOR_DATA['luna-rae'].videoPreviews,
  };

  const creator = {
    id: `creator-${cleanHandle}`,
    ...baseCreator,
    isVerified: true,
  };

  // Up to 3 Photo Previews state
  const [photoPreviews, setPhotoPreviews] = useState<PreviewPhotoItem[]>(
    baseCreator.photoPreviews || CREATOR_DATA['luna-rae'].photoPreviews
  );

  // Up to 2 Video Previews state
  const [videoPreviews, setVideoPreviews] = useState<PreviewVideoItem[]>(
    baseCreator.videoPreviews || CREATOR_DATA['luna-rae'].videoPreviews
  );

  // Check if current user is following or subscribed to this creator
  useEffect(() => {
    try {
      const stored = localStorage.getItem('mirage_followed_creators');
      if (stored) {
        const list: any[] = JSON.parse(stored);
        const match = list.some(c => c.handle.replace(/^@/, '').toLowerCase() === cleanHandle);
        setIsFollowing(match);
      }
    } catch (e) {}

    try {
      const storedSubs = localStorage.getItem('mirage_subscriptions');
      if (storedSubs) {
        const list: any[] = JSON.parse(storedSubs);
        const matchSub = list.some(s => s.creatorHandle.replace(/^@/, '').toLowerCase() === cleanHandle && s.status === 'ACTIVE');
        if (matchSub) setIsSubscribed(true);
      }
    } catch (e) {}
  }, [cleanHandle]);

  const handleToggleFollow = () => {
    try {
      const stored = localStorage.getItem('mirage_followed_creators');
      let list: any[] = stored ? JSON.parse(stored) : [
        { id: 'f1', name: 'Mia Carter', handle: 'mia-carter', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80', price: 7.99 },
        { id: 'f2', name: 'Zara Khan', handle: 'zara-khan', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80', price: 12.99 },
      ];
      const nextState = !isFollowing;
      setIsFollowing(nextState);

      if (nextState) {
        if (!list.some(c => c.handle.replace(/^@/, '').toLowerCase() === cleanHandle)) {
          list.push({
            id: `f-${cleanHandle}`,
            name: creator.name,
            handle: cleanHandle,
            avatar: creator.avatar,
            price: creator.monthlyPrice,
          });
        }
      } else {
        list = list.filter(c => c.handle.replace(/^@/, '').toLowerCase() !== cleanHandle);
      }
      localStorage.setItem('mirage_followed_creators', JSON.stringify(list));
    } catch (e) {
      setIsFollowing(!isFollowing);
    }
  };

  // Synchronize state if cleanHandle changes
  useEffect(() => {
    if (baseCreator.photoPreviews) {
      setPhotoPreviews(baseCreator.photoPreviews);
    }
    if (baseCreator.videoPreviews) {
      setVideoPreviews(baseCreator.videoPreviews);
    }
  }, [cleanHandle]);

  // Main Posts feed (PPV, Subscribers, and Full Feed)
  const [posts, setPosts] = useState<PostItem[]>([
    {
      id: 'p-paid-1',
      type: 'image',
      mediaUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1600&q=95',
      thumbnailUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=600&q=70',
      title: 'Private Sunset Mirage Collection #1',
      caption: 'Exclusive sunset cinematic photoshoot captured in Santorini. High-res RAW detail.',
      visibility: 'PURCHASE_ONLY',
      price: 15.00,
      hasPurchased: false,
      isLocked: true,
      likes: 142,
      date: '1 day ago',
    },
    {
      id: 'p-paid-2',
      type: 'video',
      mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=70',
      previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      videoDuration: '15:20',
      title: 'Behind the Scenes — Midnight Studio Session (4K Video)',
      caption: '15-minute complete unfiltered 4K footage from my midnight creative session.',
      visibility: 'PURCHASE_ONLY',
      price: 25.00,
      hasPurchased: false,
      isLocked: true,
      likes: 89,
      date: '2 days ago',
    },
    {
      id: 'p-sub-1',
      type: 'image',
      mediaUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=70',
      title: 'Subscribers Only: Paris Fashion Week Teaser',
      caption: 'Exclusive editorial shot for my monthly members.',
      visibility: 'SUBSCRIBER_ONLY',
      price: 0,
      isLocked: !isSubscribed,
      likes: 215,
      date: '3 days ago',
    },
    {
      id: 'p-sub-2',
      type: 'video',
      mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=70',
      videoDuration: '10:05',
      title: 'Subscribers Only: Private Workout Session',
      caption: 'Morning routine & exclusive workout vlog with commentary.',
      visibility: 'SUBSCRIBER_ONLY',
      price: 0,
      isLocked: !isSubscribed,
      likes: 184,
      date: '4 days ago',
    },
  ]);

  // Synchronize previews and feed from backend API
  useEffect(() => {
    async function loadBackendData() {
      try {
        const previewRes = await fetch(`/api/content/posts?handle=${cleanHandle}&previews=true`);
        if (previewRes.ok) {
          const previewJson = await previewRes.json();
          if (previewJson?.previews) {
            if (previewJson.previews.photos?.length > 0) {
              setPhotoPreviews(previewJson.previews.photos.slice(0, 3));
            }
            if (previewJson.previews.videos?.length > 0) {
              setVideoPreviews(previewJson.previews.videos.slice(0, 2));
            }
          }
        }

        let token: string | null = null;
        let currentUserId: string | null = null;
        try {
          token = localStorage.getItem('mirage_token');
          const rawUser = localStorage.getItem('mirage_user');
          if (rawUser) {
            currentUserId = JSON.parse(rawUser)?.id || null;
          }
        } catch (e) {}

        const feedUrl = currentUserId
          ? `/api/content/posts?handle=${cleanHandle}&userId=${encodeURIComponent(currentUserId)}`
          : `/api/content/posts?handle=${cleanHandle}`;
        const feedRes = await fetch(feedUrl, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (feedRes.ok) {
          const feedJson = await feedRes.json();
          if (feedJson?.posts && Array.isArray(feedJson.posts)) {
            const mappedPosts: PostItem[] = feedJson.posts
              .filter((p: any) => !p.isPublicPreview)
              .map((p: any) => ({
                id: p.id,
                type: p.mediaType === 'VIDEO' ? 'video' : 'image',
                mediaUrl: p.mediaUrl,
                thumbnailUrl: p.thumbnailUrl,
                previewUrl: p.previewUrl,
                videoDuration: p.videoDuration,
                title: p.title,
                caption: p.caption,
                visibility: p.visibility,
                price: p.price || 0,
                isLocked: p.visibility !== 'PUBLIC' && !p.mediaUrl,
                hasPurchased: false,
                likes: p.likeCount || 100,
                date: 'Recently',
              }));
            if (mappedPosts.length > 0) {
              setPosts(mappedPosts);
            }
          }
        }
      } catch (err) {
        // Fallback to local state if network fetch is unavailable
      }
    }

    loadBackendData();
  }, [cleanHandle]);

  // Escape key global listener to close any open modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveLightboxPhoto(null);
        setActiveVideoPreview(null);
        setSelectedPurchasePost(null);
        setShowSubscribeModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Check URL parameter for auto opening subscribe modal if requested
  useEffect(() => {
    if (searchParams?.get('subscribe') === 'true') {
      setShowSubscribeModal(true);
    }
  }, [searchParams]);

  const handleSubscribeSuccess = () => {
    setIsSubscribed(true);
    try {
      const storedSubs = localStorage.getItem('mirage_subscriptions');
      let subsList: any[] = storedSubs ? JSON.parse(storedSubs) : [
        {
          id: 'sub-1',
          creatorName: 'Luna Rae',
          creatorHandle: 'luna-rae',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          price: 9.99,
          status: 'ACTIVE',
          nextBilling: 'November 21, 2026',
        },
        {
          id: 'sub-2',
          creatorName: 'Sophie Lee',
          creatorHandle: 'sophie-lee',
          avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
          price: 9.99,
          status: 'ACTIVE',
          nextBilling: 'November 18, 2026',
        },
      ];
      if (!subsList.some(s => s.creatorHandle.replace(/^@/, '').toLowerCase() === cleanHandle)) {
        subsList.push({
          id: `sub-${Date.now()}`,
          creatorName: creator.name,
          creatorHandle: cleanHandle,
          avatar: creator.avatar,
          price: creator.monthlyPrice,
          status: 'ACTIVE',
          nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        });
        localStorage.setItem('mirage_subscriptions', JSON.stringify(subsList));
      }
    } catch (e) {}

    setPosts(prev =>
      prev.map(p => {
        if (p.visibility === 'SUBSCRIBER_ONLY') {
          return { ...p, isLocked: false };
        }
        return p;
      })
    );
  };

  const handlePurchaseSuccess = (purchasedItem: any) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id === purchasedItem.postId) {
          return { ...p, isLocked: false, hasPurchased: true };
        }
        return p;
      })
    );
  };

  // Filter posts according to active tab
  const filteredPosts = posts.filter(post => {
    if (activeTab === 'posts') return true;
    if (activeTab === 'photos') return post.type === 'image';
    if (activeTab === 'videos') return post.type === 'video';
    if (activeTab === 'subscription') return post.visibility === 'SUBSCRIBER_ONLY';
    if (activeTab === 'paid') return post.visibility === 'PURCHASE_ONLY';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#08080a] text-white pb-20 selection:bg-[#d4af37]/30 selection:text-white">
      {/* Monthly Subscription Modal - ONLY rendered when showSubscribeModal is true */}
      {showSubscribeModal && (
        <SubscribeModal
          creator={{
            id: creator.id,
            name: creator.name,
            handle: creator.handle,
            price: creator.monthlyPrice,
          }}
          isOpen={showSubscribeModal}
          onClose={() => setShowSubscribeModal(false)}
          onSuccess={handleSubscribeSuccess}
        />
      )}

      {/* Individual Content Purchase Modal */}
      {selectedPurchasePost && (
        <PurchaseContentModal
          content={{
            id: selectedPurchasePost.id,
            title: selectedPurchasePost.title || 'Exclusive Media',
            creatorName: creator.name,
            creatorHandle: creator.handle,
            price: selectedPurchasePost.price,
            mediaType: selectedPurchasePost.type === 'video' ? 'VIDEO' : 'IMAGE',
            thumbnailUrl: selectedPurchasePost.thumbnailUrl || selectedPurchasePost.mediaUrl,
          }}
          isOpen={!!selectedPurchasePost}
          onClose={() => setSelectedPurchasePost(null)}
          onSuccess={handlePurchaseSuccess}
        />
      )}

      {/* ========================================================
          FULL-RESOLUTION PHOTO LIGHTBOX MODAL (Section 3 Requirement)
      ======================================================== */}
      {activeLightboxPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-between p-4 sm:p-6 animate-fadeIn"
          onClick={() => setActiveLightboxPhoto(null)}
        >
          {/* Top Bar */}
          <div
            className="w-full max-w-5xl flex items-center justify-between z-10 py-2 border-b border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <img
                src={creator.avatar}
                alt={creator.name}
                className="w-9 h-9 rounded-full object-cover border border-[#d4af37]/40"
              />
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  {creator.name}
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1e1a12] text-[#f5d77f] border border-[#d4af37]/40">
                    Free Public Preview
                  </span>
                </h4>
                <p className="text-xs text-[#8c8c9e]">{activeLightboxPhoto.title}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveLightboxPhoto(null);
              }}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close Lightbox"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Centered Image */}
          <div
            className="flex-1 flex items-center justify-center p-2 sm:p-4 max-w-5xl w-full my-auto overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeLightboxPhoto.mediaUrl}
              alt={activeLightboxPhoto.title}
              className="max-h-[75vh] max-w-full object-contain rounded-2xl border border-[#2b2b3a] shadow-2xl"
            />
          </div>

          {/* Bottom Caption & Action */}
          <div
            className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs text-[#8c8c9e]"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="line-clamp-2 max-w-xl text-center sm:text-left text-[#cbd5e1]">
              {activeLightboxPhoto.caption}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveLightboxPhoto(null);
                setShowSubscribeModal(true);
              }}
              className="px-5 py-2 rounded-full gold-button text-xs font-bold shadow-gold-sm flex-shrink-0 cursor-pointer"
            >
              Subscribe for Full Access (${creator.monthlyPrice.toFixed(2)}/mo)
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          VIDEO PREVIEW PLAYER MODAL (Section 4 Requirement)
      ======================================================== */}
      {activeVideoPreview && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-between p-4 sm:p-6 animate-fadeIn"
          onClick={() => setActiveVideoPreview(null)}
        >
          {/* Top Bar */}
          <div
            className="w-full max-w-4xl flex items-center justify-between z-10 py-2 border-b border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <img
                src={creator.avatar}
                alt={creator.name}
                className="w-9 h-9 rounded-full object-cover border border-[#d4af37]/40"
              />
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  {creator.name}
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1e1a12] text-[#f5d77f] border border-[#d4af37]/40">
                    Video Preview ({activeVideoPreview.videoDuration})
                  </span>
                </h4>
                <p className="text-xs text-[#8c8c9e]">{activeVideoPreview.title}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveVideoPreview(null);
              }}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close Video Player"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Centered HTML5 Video Player */}
          <div
            className="flex-1 flex items-center justify-center p-2 sm:p-4 max-w-4xl w-full my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={activeVideoPreview.mediaUrl}
              controls
              autoPlay
              playsInline
              className="w-full max-h-[72vh] rounded-2xl bg-black border border-[#d4af37]/30 shadow-2xl"
            />
          </div>

          {/* Bottom Bar */}
          <div
            className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs text-[#8c8c9e]"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="line-clamp-2 max-w-lg text-center sm:text-left text-[#cbd5e1]">
              {activeVideoPreview.caption}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveVideoPreview(null);
                setShowSubscribeModal(true);
              }}
              className="px-5 py-2 rounded-full gold-button text-xs font-bold shadow-gold-sm flex-shrink-0 cursor-pointer"
            >
              Subscribe for Full Access (${creator.monthlyPrice.toFixed(2)}/mo)
            </button>
          </div>
        </div>
      )}

      {/* Banner Container */}
      <div className="relative h-48 sm:h-72 w-full overflow-hidden bg-[#121218]">
        <img
          src={creator.banner}
          alt={creator.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-transparent to-black/30" />
      </div>

      {/* Profile Header Details */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-20 sm:-mt-24 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#1c1c28]">
          {/* Avatar & Identifiers */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full p-1 bg-gradient-to-br from-[#d4af37] via-[#f5d77f] to-[#aa820a] shadow-gold-glow flex-shrink-0">
              <img
                src={creator.avatar}
                alt={creator.name}
                className="w-full h-full object-cover rounded-full"
              />
              <span className="absolute bottom-2 right-2 p-1.5 rounded-full bg-[#0a0a0e] text-[#f5d77f] border border-[#d4af37]/40 shadow-md">
                <Crown className="w-4 h-4" />
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-serif font-black text-white tracking-wide">
                  {creator.name}
                </h1>
                {creator.isVerified && (
                  <span title="Verified Creator">
                    <CheckCircle2 className="w-5 h-5 fill-[#d4af37] text-black" />
                  </span>
                )}
              </div>
              <p className="text-sm text-[#8c8c9e] font-mono">{creator.handle}</p>
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#181824] text-[10px] text-[#f5d77f] border border-[#d4af37]/30 font-semibold uppercase tracking-wider">
                {creator.category} Creator
              </div>
            </div>
          </div>

          {/* Social Stats & Primary Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-6 px-4 py-2.5 rounded-2xl bg-[#111118] border border-[#22222e]">
              <div className="text-center">
                <div className="text-sm font-bold text-white">{creator.followersCount}</div>
                <div className="text-[10px] text-[#717182] uppercase tracking-wider">Fans</div>
              </div>
              <div className="w-px h-6 bg-[#252532]" />
              <div className="text-center">
                <div className="text-sm font-bold text-white">{creator.postsCount}</div>
                <div className="text-[10px] text-[#717182] uppercase tracking-wider">Posts</div>
              </div>
              <div className="w-px h-6 bg-[#252532]" />
              <div className="text-center">
                <div className="text-sm font-bold text-white">{creator.likesCount}</div>
                <div className="text-[10px] text-[#717182] uppercase tracking-wider">Likes</div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleToggleFollow}
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-full text-xs font-semibold border transition-all ${
                  isFollowing
                    ? 'bg-[#181822] text-[#f5d77f] border-[#d4af37]/40'
                    : 'bg-transparent text-white border-[#333344] hover:border-white'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              <button
                type="button"
                onClick={() => (isSubscribed ? router.push('/dashboard') : setShowSubscribeModal(true))}
                className="flex-1 sm:flex-none px-7 py-2.5 rounded-full gold-button text-xs font-bold shadow-gold-sm"
              >
                {isSubscribed ? 'Subscribed ✓' : `Subscribe $${creator.monthlyPrice.toFixed(2)}/mo`}
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================
            PUBLIC PREVIEWS SECTION (Section 3 & 4 Client Request)
            Visitors view 3 photos and 2 video previews before subscribing
        ======================================================== */}
        <section className="mb-12 rounded-3xl bg-[#0f0f15] border border-[#232332] p-5 sm:p-8 relative overflow-hidden shadow-2xl">
          {/* Subtle gold accent glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />

          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#20202e]">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1e1a12] border border-[#d4af37]/40 text-[#f5d77f] text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Free Public Previews</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-white tracking-wide">
                Explore Content Before Subscribing
              </h2>
              <p className="text-xs sm:text-sm text-[#8e8ea0] mt-1">
                Browse {photoPreviews.length} free photo previews and watch {videoPreviews.length} video clips before joining {creator.name}&apos;s membership.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-[#717182]">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Full High-Res Available Free</span>
            </div>
          </div>

          {/* Subsection 1: 3 Photo Previews */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3.5">
              <ImageIcon className="w-4 h-4 text-[#d4af37]" />
              <h3 className="text-xs uppercase tracking-wider font-bold text-white">
                Photo Previews ({photoPreviews.length} Photos)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {photoPreviews.map((photo, idx) => (
                <div
                  key={photo.id || idx}
                  onClick={() => setActiveLightboxPhoto(photo)}
                  className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#15151e] border border-[#242436] hover:border-[#d4af37]/60 cursor-pointer transition-all duration-300 hover:shadow-gold-sm hover:-translate-y-1"
                >
                  <img
                    src={photo.thumbnailUrl || photo.mediaUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                  {/* Badge */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/70 backdrop-blur-md text-[#f5d77f] border border-[#d4af37]/30">
                    Preview #{idx + 1}
                  </span>

                  {/* Expand icon on hover */}
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="w-4 h-4 text-[#f5d77f]" />
                  </div>

                  {/* Details Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 space-y-1 text-left">
                    <h4 className="text-xs font-serif font-bold text-white group-hover:text-[#f5d77f] transition-colors truncate">
                      {photo.title}
                    </h4>
                    <p className="text-[11px] text-[#a0a0b2] line-clamp-1 font-normal">
                      {photo.caption}
                    </p>
                    <div className="pt-1 flex items-center justify-between text-[10px] text-[#d4af37]">
                      <span>Click to view full image</span>
                      <Eye className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subsection 2: 2 Video Previews */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3.5">
              <Video className="w-4 h-4 text-[#d4af37]" />
              <h3 className="text-xs uppercase tracking-wider font-bold text-white">
                Video Previews ({videoPreviews.length} Clips)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videoPreviews.map((vid, idx) => (
                <div
                  key={vid.id || idx}
                  onClick={() => setActiveVideoPreview(vid)}
                  className="group relative aspect-video rounded-2xl overflow-hidden bg-[#15151e] border border-[#242436] hover:border-[#d4af37]/60 cursor-pointer transition-all duration-300 hover:shadow-gold-sm hover:-translate-y-1"
                >
                  <img
                    src={vid.thumbnailUrl || 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80'}
                    alt={vid.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20 group-hover:bg-black/30 transition-colors" />

                  {/* Duration Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/70 backdrop-blur-md text-[#f5d77f] border border-[#d4af37]/30">
                    <Video className="w-3 h-3" />
                    <span>Clip #{idx + 1} • {vid.videoDuration}</span>
                  </div>

                  {/* Centered Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black/60 border border-[#d4af37] text-[#f5d77f] flex items-center justify-center shadow-gold-sm group-hover:scale-110 group-hover:bg-[#d4af37] group-hover:text-black transition-all">
                      <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-current ml-1" />
                    </div>
                  </div>

                  {/* Bottom Title & Play CTA */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-left">
                    <div>
                      <h4 className="text-xs sm:text-sm font-serif font-bold text-white group-hover:text-[#f5d77f] transition-colors truncate">
                        {vid.title}
                      </h4>
                      <p className="text-[11px] text-[#a0a0b2] line-clamp-1 font-normal">
                        {vid.caption}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-[#d4af37] bg-black/60 px-2.5 py-1 rounded-full flex-shrink-0 ml-2">
                      Play Preview
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================
              DEDICATED LUXURY SUBSCRIBE CTA BANNER (Section 6 Requirement)
          ======================================================== */}
          <div className="rounded-2xl bg-gradient-to-r from-[#171722] via-[#201d14] to-[#171722] border border-[#d4af37]/40 p-6 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-center md:text-left max-w-xl">
              <div className="inline-flex items-center gap-1.5 text-xs text-[#f5d77f] font-semibold">
                <Crown className="w-4 h-4 text-[#f5d77f]" />
                <span>Ready for complete access?</span>
              </div>
              <h3 className="text-lg sm:text-xl font-serif font-black text-white">
                Subscribe to {creator.name} for ${creator.monthlyPrice.toFixed(2)} / month
              </h3>
              <p className="text-xs sm:text-sm text-[#9da3af] leading-relaxed">
                Unlock full feed access to all 48+ photos & 4K uncompressed video sets, direct 1-on-1 private messaging, and weekly exclusive drops.
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[11px] text-[#d4af37] pt-1">
                <span>✓ All 48+ full photos & 4K videos</span>
                <span>✓ 1-on-1 private chat</span>
                <span>✓ Cancel anytime</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 w-full md:w-auto flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowSubscribeModal(true)}
                className="w-full sm:w-auto px-9 py-3.5 rounded-full gold-button text-xs sm:text-sm font-bold shadow-gold-md hover:scale-105 transition-all text-center tracking-wide cursor-pointer"
              >
                Subscribe Now — ${creator.monthlyPrice.toFixed(2)}/mo
              </button>
              <span className="text-[10px] text-[#717182]">Instant unlock • Secure encryption</span>
            </div>
          </div>
        </section>

        {/* ========================================================
            2-COLUMN CONTENT LAYOUT (Full Locked Feed & Sidebars)
        ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Feed & Tabs */}
          <div className="lg:col-span-8 space-y-6">
            {/* Feed Navigation Tabs */}
            <div className="flex overflow-x-auto border-b border-[#1c1c28] gap-4 sm:gap-6 pb-px scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab('posts')}
                className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all ${
                  activeTab === 'posts'
                    ? 'border-[#d4af37] text-white'
                    : 'border-transparent text-[#7c7c8e] hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" />
                All Posts ({posts.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('paid')}
                className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all ${
                  activeTab === 'paid'
                    ? 'border-[#d4af37] text-[#f5d77f]'
                    : 'border-transparent text-[#7c7c8e] hover:text-white'
                }`}
              >
                <DollarSign className="w-4 h-4 text-[#d4af37]" />
                Paid PPV Content ({posts.filter(p => p.visibility === 'PURCHASE_ONLY').length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('subscription')}
                className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all ${
                  activeTab === 'subscription'
                    ? 'border-[#d4af37] text-white'
                    : 'border-transparent text-[#7c7c8e] hover:text-white'
                }`}
              >
                <Crown className="w-4 h-4 text-[#f5d77f]" />
                Subscriber-Only ({posts.filter(p => p.visibility === 'SUBSCRIBER_ONLY').length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('photos')}
                className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all ${
                  activeTab === 'photos'
                    ? 'border-[#d4af37] text-white'
                    : 'border-transparent text-[#7c7c8e] hover:text-white'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                Photos
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('videos')}
                className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all ${
                  activeTab === 'videos'
                    ? 'border-[#d4af37] text-white'
                    : 'border-transparent text-[#7c7c8e] hover:text-white'
                }`}
              >
                <Video className="w-4 h-4" />
                Videos
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('about')}
                className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all ${
                  activeTab === 'about'
                    ? 'border-[#d4af37] text-white'
                    : 'border-transparent text-[#7c7c8e] hover:text-white'
                }`}
              >
                <Info className="w-4 h-4" />
                About
              </button>
            </div>

            {/* Posts Stream */}
            {activeTab === 'about' ? (
              <div className="p-6 rounded-2xl bg-[#101016] border border-[#22222e] space-y-4">
                <h3 className="text-base font-serif font-bold text-white">About {creator.name}</h3>
                <p className="text-sm text-[#9da3af] leading-relaxed">{creator.bio}</p>
                <div className="pt-4 border-t border-[#1c1c28] flex items-center gap-4 text-xs text-[#717182]">
                  <Calendar className="w-4 h-4" />
                  <span>Joined The Mirage Creator Network in 2026</span>
                </div>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-[#101016] border border-[#22222e] space-y-3">
                <Layers className="w-10 h-10 mx-auto text-[#4d4d5e]" />
                <h4 className="text-sm font-bold text-white">No content in this category yet</h4>
                <p className="text-xs text-[#7c7c90]">Check back soon for new uploads from {creator.name}.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    className="rounded-2xl bg-[#101016] border border-[#20202a] overflow-hidden shadow-xl"
                  >
                    {/* Post Top Bar with Badges */}
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={creator.avatar}
                          alt={creator.name}
                          className="w-10 h-10 rounded-full object-cover border border-[#d4af37]/40"
                        />
                        <div>
                          <div className="text-sm font-bold text-white flex items-center gap-1">
                            {creator.name}
                            <CheckCircle2 className="w-3.5 h-3.5 fill-[#d4af37] text-black" />
                          </div>
                          <span className="text-[11px] text-[#717182]">{post.date}</span>
                        </div>
                      </div>

                      {/* Content Category Badges */}
                      <div>
                        {post.visibility === 'PURCHASE_ONLY' ? (
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1e1a12] border border-[#d4af37]/40 text-[#f5d77f] text-xs font-bold">
                            <DollarSign className="w-3 h-3 text-[#f5d77f]" />
                            <span>${post.price.toFixed(2)} Pay-Per-View</span>
                          </div>
                        ) : post.visibility === 'SUBSCRIBER_ONLY' ? (
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181824] border border-[#3b3b50] text-[#9da3af] text-xs font-semibold">
                            <Crown className="w-3 h-3 text-[#d4af37]" />
                            <span>Subscriber-Only</span>
                          </div>
                        ) : (
                          <div className="px-3 py-1 rounded-full bg-[#122014] border border-green-500/40 text-green-400 text-xs font-semibold">
                            Free Preview
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Post Media Area (Locked or Unlocked) */}
                    <div className="relative aspect-video w-full bg-[#0a0a0e] overflow-hidden flex items-center justify-center">
                      <img
                        src={post.isLocked && post.thumbnailUrl ? post.thumbnailUrl : post.mediaUrl}
                        alt={post.title || 'Content Media'}
                        className={`w-full h-full object-cover transition-all ${
                          post.isLocked ? 'blur-2xl scale-110 opacity-30 pointer-events-none' : ''
                        }`}
                      />

                      {/* Video Play Overlay if Unlocked */}
                      {!post.isLocked && post.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group cursor-pointer">
                          <div className="w-16 h-16 rounded-full bg-black/60 border border-[#d4af37] text-[#f5d77f] flex items-center justify-center shadow-gold-sm hover:scale-110 transition-transform">
                            <Play className="w-7 h-7 fill-[#f5d77f] ml-1" />
                          </div>
                        </div>
                      )}

                      {/* Locked Paywall Overlay */}
                      {post.isLocked && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-[#1b1b24] border border-[#d4af37]/40 flex items-center justify-center text-[#f5d77f] shadow-gold-sm">
                            <Lock className="w-5 h-5" />
                          </div>

                          {post.visibility === 'PURCHASE_ONLY' ? (
                            <>
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">
                                  Individual Paid {post.type === 'video' ? 'Video' : 'Photo Set'}
                                </span>
                                <h4 className="text-base sm:text-lg font-serif font-bold text-white mt-0.5">
                                  {post.title || 'Exclusive Personal Media'}
                                </h4>
                                <p className="text-xs text-[#8c8c9e] max-w-sm mt-1">
                                  One-time purchase unlocks permanent high-res viewing in your personal library.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setSelectedPurchasePost(post)}
                                className="px-6 py-2.5 rounded-full gold-button text-xs font-bold shadow-gold-sm flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer"
                              >
                                <CreditCard className="w-4 h-4" />
                                Unlock for ${post.price.toFixed(2)}
                              </button>
                            </>
                          ) : (
                            <>
                              <div>
                                <h4 className="text-base font-serif font-bold text-white">
                                  Subscriber-Only Exclusive
                                </h4>
                                <p className="text-xs text-[#8c8c9e] max-w-sm mt-1">
                                  Subscribe to {creator.name} to unlock full access to this post and all exclusive subscriber media.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setShowSubscribeModal(true)}
                                className="px-6 py-2.5 rounded-full gold-button text-xs font-bold shadow-gold-sm cursor-pointer"
                              >
                                Subscribe for ${creator.monthlyPrice.toFixed(2)}/mo
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Caption & Title */}
                    <div className="p-4 space-y-2">
                      {post.title && (
                        <h4 className="text-sm font-serif font-bold text-white">{post.title}</h4>
                      )}
                      <p className="text-xs sm:text-sm text-[#cbd5e1] leading-relaxed">{post.caption}</p>

                      <div className="flex items-center justify-between pt-3 border-t border-[#1c1c28] text-xs text-[#717182]">
                        <button
                          type="button"
                          onClick={() => {
                            setPosts(prev =>
                              prev.map(p =>
                                p.id === post.id ? { ...p, likes: p.likes + 1 } : p
                              )
                            );
                          }}
                          className="flex items-center gap-1.5 hover:text-red-400 transition-colors"
                        >
                          <Heart className="w-4 h-4 text-red-400" />
                          <span>{post.likes}</span>
                        </button>
                        <span className="text-[11px] text-[#555566]">Exclusive on The Mirage</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Creator Info & Custom Request Card */}
          <div className="lg:col-span-4 space-y-6">
            {/* Subscription Box */}
            <div className="p-5 rounded-2xl bg-[#111118] border border-[#282836] space-y-4">
              <h3 className="text-sm font-serif font-bold text-white flex items-center gap-2">
                <Crown className="w-4 h-4 text-[#f5d77f]" />
                Subscription Plan
              </h3>
              <div className="text-2xl font-bold font-serif text-white">
                ${creator.monthlyPrice.toFixed(2)}
                <span className="text-xs text-[#7c7c90] font-normal font-sans"> / month</span>
              </div>
              <ul className="text-xs text-[#9fa3af] space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#f5d77f]" />
                  Full access to all exclusive subscriber posts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#f5d77f]" />
                  Direct 1-on-1 private messaging
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#f5d77f]" />
                  Custom personalised content requests
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#f5d77f]" />
                  Cancel subscription anytime
                </li>
              </ul>
              <button
                type="button"
                onClick={() => (isSubscribed ? router.push('/dashboard') : setShowSubscribeModal(true))}
                className="w-full py-3 rounded-xl gold-button text-xs font-bold shadow-gold-sm cursor-pointer"
              >
                {isSubscribed ? 'Manage Subscription' : `Subscribe for $${creator.monthlyPrice.toFixed(2)}`}
              </button>
            </div>

            {/* Custom Content Request CTA Box */}
            <div className="p-5 rounded-2xl bg-[#13131c] border border-[#d4af37]/30 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#f5d77f]" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Personalised Content
                </h4>
              </div>
              <p className="text-xs text-[#8e8ea0] leading-relaxed">
                Want a custom photo set, personalised video shoutout, or unique private commission from {creator.name}?
              </p>
              <Link
                href={`/chat?creator=${encodeURIComponent(cleanHandle)}&requestCustom=true`}
                className="block text-center py-2.5 rounded-xl bg-[#1d1d28] hover:bg-[#252536] text-[#f5d77f] border border-[#d4af37]/30 text-xs font-semibold transition-colors"
              >
                Request Custom Content
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreatorProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#08080a] flex items-center justify-center text-[#d4af37]">
          Loading Profile...
        </div>
      }
    >
      <CreatorProfileContent />
    </Suspense>
  );
}
