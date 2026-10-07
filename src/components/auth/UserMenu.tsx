import React, { useState, useRef, useEffect } from 'react';
import { LogIn, LogOut, CheckCircle2, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { LoginModal } from '@/components/auth/LoginModal';

interface UserMenuProps {
  className?: string;
}

export const UserMenu: React.FC<UserMenuProps> = ({ className }) => {
  const { user, userProfile, signOut, loading } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [userProfile?.photoURL]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (loading) {
    return (
      <div className="h-8 w-20 bg-zinc-100 dark:bg-zinc-800 rounded-md animate-pulse shrink-0" />
    );
  }

  if (!user) {
    return (
      <div className={className}>
        <button
          type="button"
          onClick={() => setIsLoginModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-zinc-100 dark:text-zinc-900 rounded-md text-xs font-semibold transition-colors shadow-xs shrink-0 cursor-pointer"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Sign In</span>
        </button>
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />
      </div>
    );
  }

  const initial = (userProfile?.displayName || userProfile?.email || 'U')[0].toUpperCase();

  return (
    <div className={`relative shrink-0 ${className || ''}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsDropdownOpen((prev) => !prev)}
        className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-xs font-medium text-zinc-900 dark:text-zinc-100 transition-colors cursor-pointer"
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
      >
        {!imageError && userProfile?.photoURL ? (
          <img
            src={userProfile.photoURL}
            alt={userProfile.displayName || 'User'}
            onError={() => setImageError(true)}
            className="w-6 h-6 rounded-md object-cover border border-zinc-300 dark:border-zinc-600"
          />
        ) : (
          <div className="w-6 h-6 rounded-md bg-zinc-800 dark:bg-zinc-200 text-zinc-100 dark:text-zinc-900 flex items-center justify-center font-bold text-xs">
            {initial}
          </div>
        )}
        <span className="hidden sm:inline max-w-[120px] truncate">
          {userProfile?.displayName || userProfile?.email}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-xl p-3 z-50 text-zinc-900 dark:text-zinc-100 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-start gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            {!imageError && userProfile?.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt={userProfile.displayName || 'User'}
                onError={() => setImageError(true)}
                className="w-9 h-9 rounded-md object-cover border border-zinc-200 dark:border-zinc-700"
              />
            ) : (
              <div className="w-9 h-9 rounded-md bg-zinc-800 dark:bg-zinc-200 text-zinc-100 dark:text-zinc-900 flex items-center justify-center font-bold text-sm shrink-0">
                {initial}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate text-zinc-900 dark:text-zinc-100">
                {userProfile?.displayName || 'Authenticated User'}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                {userProfile?.email}
              </p>
            </div>
          </div>

          {/* Sync Status Badge */}
          <div className="my-2.5 px-2.5 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Synced with NAYRA Unified Cloud</span>
          </div>

          {/* Actions */}
          <div className="pt-1">
            <button
              type="button"
              onClick={async () => {
                setIsDropdownOpen(false);
                await signOut();
              }}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors text-left"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
