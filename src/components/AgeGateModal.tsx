'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';

export default function AgeGateModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already verified age
    const ageVerified = localStorage.getItem('mirage_age_verified');
    if (!ageVerified) {
      setIsOpen(true);
    }

    // Allow reopening via event or footer click
    const handleReopen = () => setIsOpen(true);
    window.addEventListener('open_age_gate', handleReopen);
    return () => window.removeEventListener('open_age_gate', handleReopen);
  }, []);

  const handleConfirmAge = () => {
    localStorage.setItem('mirage_age_verified', 'true');
    setIsOpen(false);
  };

  const handleDeclineAge = () => {
    // Redirect out or block access
    window.location.href = 'https://www.google.com';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-md p-8 bg-[#0f0f15] border border-[#d4af37]/30 rounded-2xl shadow-2xl shadow-black text-center">
        {/* Official Brand Logo */}
        <div className="mb-4">
          <img
            src="/assets/the_mirage_logo.png"
            alt="The Mirage"
            className="h-11 w-auto mx-auto object-contain"
          />
        </div>

        {/* Golden 18+ Badge */}
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#d4af37] via-[#f5d77f] to-[#aa820a] p-0.5 shadow-gold-sm">
          <div className="w-full h-full bg-[#0a0a0e] rounded-[14px] flex items-center justify-center">
            <span className="text-xl font-bold font-serif text-[#f5d77f]">18+</span>
          </div>
        </div>

        <h3 className="text-2xl font-serif font-bold text-white mb-2 tracking-wide">
          Age Verification
        </h3>

        <p className="text-sm text-[#94a3b8] mb-6 leading-relaxed">
          The Mirage contains creator content that is restricted to adults aged 18 and older. Please confirm that you are of legal age in your jurisdiction.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleConfirmAge}
            className="flex-1 py-3 px-6 rounded-xl gold-button text-sm font-semibold flex items-center justify-center gap-2 shadow-gold-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            I am 18 or older
          </button>
          <button
            onClick={handleDeclineAge}
            className="flex-1 py-3 px-6 rounded-xl bg-[#171722] hover:bg-[#20202e] text-[#94a3b8] hover:text-white border border-[#2a2a3a] text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <XCircle className="w-4 h-4" />
            Exit (Under 18)
          </button>
        </div>

        <p className="mt-5 text-[11px] text-[#555566]">
          By entering, you accept our Terms of Service and Content Guidelines.
        </p>
      </div>
    </div>
  );
}

