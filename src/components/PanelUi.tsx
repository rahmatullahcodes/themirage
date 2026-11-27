'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, AlertTriangle, Loader2, Upload, User, Image as ImageIcon } from 'lucide-react';
import { getAuthHeaders } from '@/lib/clientAuth';

export type ActionTone = 'neutral' | 'gold' | 'green' | 'amber' | 'danger';

const TONE_CLASSES: Record<ActionTone, string> = {
  neutral: 'bg-[#181824] hover:bg-[#222234] text-[#cbd5e1] hover:text-white border-[#2f2f40]',
  gold: 'bg-[#1f1a10] hover:bg-[#2b2314] text-[#f5d77f] border-[#d4af37]/40',
  green: 'bg-green-950/50 hover:bg-green-950/80 text-green-400 border-green-500/35',
  amber: 'bg-yellow-950/50 hover:bg-yellow-950/80 text-yellow-400 border-yellow-500/35',
  danger: 'bg-[#251515] hover:bg-[#351b1b] text-red-400 border-red-500/35',
};

interface ActionIconBtnProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
  tone?: ActionTone;
  disabled?: boolean;
  href?: string;
  external?: boolean;
}

/** Consistent professional icon button used in action columns and card footers. */
export function ActionIconBtn({
  icon: Icon,
  label,
  onClick,
  tone = 'neutral',
  disabled = false,
  href,
  external = false,
}: ActionIconBtnProps) {
  const classes = `p-2 rounded-lg border transition-colors inline-flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed ${TONE_CLASSES[tone]}`;

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          title={label}
          aria-label={label}
          className={classes}
        >
          <Icon className="w-3.5 h-3.5" />
        </a>
      );
    }
    return (
      <Link href={href} title={label} aria-label={label} className={classes}>
        <Icon className="w-3.5 h-3.5" />
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={classes}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}

interface PanelModalProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  maxWidthClass?: string;
  children: React.ReactNode;
}

/** Accessible dark-gold luxury modal for View, Edit, and Receipt workflows. */
export function PanelModal({
  open,
  title,
  subtitle,
  onClose,
  maxWidthClass = 'max-w-lg',
  children,
}: PanelModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full ${maxWidthClass} bg-[#0e0e14] border border-[#d4af37]/45 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] cursor-default`}
      >
        <div className="p-4 sm:p-5 border-b border-[#1c1c28] flex items-center justify-between gap-3 bg-[#12121a]">
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-serif font-bold text-white truncate">{title}</h3>
            {subtitle && <p className="text-xs text-[#8c8c9e] truncate mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-[#1c1c26] hover:bg-[#252536] flex items-center justify-center text-[#8e8e9e] hover:text-white transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">{children}</div>
      </div>
    </div>
  );
}

interface ConfirmActionModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  confirmTone?: 'danger' | 'gold';
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/** Confirmation dialog for destructive deletes, refunds, and cancellations. */
export function ConfirmActionModal({
  open,
  title,
  description,
  confirmLabel = 'Delete',
  confirmTone = 'danger',
  busy = false,
  onConfirm,
  onClose,
}: ConfirmActionModalProps) {
  return (
    <PanelModal open={open} title={title} onClose={onClose} maxWidthClass="max-w-md">
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
            confirmTone === 'danger'
              ? 'bg-red-950/50 border-red-500/40 text-red-400'
              : 'bg-[#d4af37]/15 border-[#d4af37]/40 text-[#f5d77f]'
          }`}
        >
          <AlertTriangle className="w-5 h-5" />
        </div>
        <p className="text-xs text-[#cbd5e1] leading-relaxed">{description}</p>
      </div>

      <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#1c1c28]">
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className="px-4 py-2 rounded-xl bg-[#181824] hover:bg-[#222234] text-xs font-semibold text-[#cbd5e1] border border-[#2c2c3c]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
            confirmTone === 'danger'
              ? 'bg-red-600 hover:bg-red-500 text-white'
              : 'gold-button shadow-gold-sm'
          }`}
        >
          {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {confirmLabel}
        </button>
      </div>
    </PanelModal>
  );
}

const VIDEO_EXT_REGEX = /\.(mp4|mov|m4v|webm|ogg)(\?|#|$)/i;

export function isVideoMediaUrl(url?: string | null): boolean {
  return Boolean(url && VIDEO_EXT_REGEX.test(url.trim()));
}

interface MediaThumbProps {
  src?: string | null;
  fallbackSrc?: string | null;
  mediaType?: string;
  alt: string;
  className?: string;
}

/** Renders an image or silent first-frame video preview when media is a video URL. */
export function MediaThumb({
  src,
  fallbackSrc,
  mediaType,
  alt,
  className = 'w-full h-full object-cover',
}: MediaThumbProps) {
  const primary = (src || '').trim();
  const secondary = (fallbackSrc || '').trim();
  const resolved = primary || secondary;

  if (!resolved) {
    return <div className={`bg-[#14141e] ${className}`} aria-label={alt} />;
  }

  const useVideoTag =
    isVideoMediaUrl(resolved) ||
    (mediaType?.toUpperCase() === 'VIDEO' && !primary && Boolean(secondary));

  if (useVideoTag) {
    const videoSrc = resolved.includes('#') ? resolved : `${resolved}#t=0.1`;
    return (
      <video
        src={videoSrc}
        muted
        playsInline
        preload="metadata"
        aria-label={alt}
        className={className}
      />
    );
  }

  return <img src={resolved} alt={alt} className={className} />;
}

interface ImageAssetInputProps {
  label: string;
  variant: 'avatar' | 'banner';
  value: string;
  onChange: (nextUrl: string) => void;
  onUploaded?: (uploadedUrl: string) => Promise<void> | void;
  onError?: (message: string) => void;
  placeholder?: string;
}

/** Shared Profile Photo (Avatar) & Cover Pic (Banner) uploader + URL + live preview widget across all panels. */
export function ImageAssetInput({
  label,
  variant,
  value,
  onChange,
  onUploaded,
  onError,
  placeholder = '/api/uploads/... or https://...',
}: ImageAssetInputProps) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data?.success || !data?.url) {
        onError?.(data?.message || 'Image upload failed (max 100MB, JPG/PNG/WEBP/GIF).');
        return;
      }
      onChange(data.url);
      if (onUploaded) {
        await onUploaded(data.url);
      }
    } catch {
      onError?.('Network error while uploading image.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2 text-xs">
      <div className="flex items-center justify-between">
        <label className="font-semibold text-[#9da3af]">{label}</label>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[11px] text-[#8e8e9e] hover:text-red-400 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {variant === 'avatar' ? (
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#161622] border border-[#2b2b3c]">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-[#101018] border border-[#d4af37]/50 flex items-center justify-center flex-shrink-0">
            {value ? (
              <img src={value} alt={label} className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-[#d4af37]" />
            )}
          </div>
          <div className="flex-1 min-w-0 text-[11px] text-[#94a3b8]">
            {value ? 'Preview ready — upload new photo or edit URL below' : 'No profile photo selected yet'}
          </div>
        </div>
      ) : (
        <div className="relative h-20 rounded-xl overflow-hidden bg-[#161622] border border-[#2b2b3c] flex items-center justify-center">
          {value ? (
            <img src={value} alt={label} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] text-[#7c7c90]">
              <ImageIcon className="w-4 h-4 text-[#d4af37]/60" />
              <span>No cover banner selected yet</span>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <label className="cursor-pointer px-3 py-2 rounded-xl bg-[#1b1b28] hover:bg-[#242436] border border-[#d4af37]/40 text-xs font-bold text-[#f5d77f] flex items-center gap-1.5 flex-shrink-0 transition-colors">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = '';
              if (f) handleFile(f);
            }}
          />
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          <span>{uploading ? 'Uploading...' : 'Upload'}</span>
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-xs text-white focus:outline-none focus:border-[#d4af37]"
        />
      </div>
    </div>
  );
}
