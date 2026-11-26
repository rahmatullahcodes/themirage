'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { X, AlertTriangle, Loader2 } from 'lucide-react';

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
