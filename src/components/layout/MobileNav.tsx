import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      closeButtonRef.current?.focus();
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleLinkClick = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation menu"
      onClick={handleBackdropClick}
    >
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300"
        aria-hidden="true"
      />

      <div
        ref={navRef}
        className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-out"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <span className="text-lg font-semibold text-slate-800">Menu</span>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-primary focus:ring-offset-2"
              aria-label="Close menu"
            >
              <X className="w-6 h-6 text-slate-600" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-6 px-4">
            <div className="space-y-2">
              <Link
                to="/about"
                onClick={handleLinkClick}
                className="flex items-center w-full px-4 py-3.5 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-primary focus:ring-offset-2"
              >
                About
              </Link>

              <Link
                to="/why"
                onClick={handleLinkClick}
                className="flex items-center w-full px-4 py-3.5 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-primary focus:ring-offset-2"
              >
                Why you need CarerView
              </Link>

              <Link
                to="/pricing"
                onClick={handleLinkClick}
                className="flex items-center w-full px-4 py-3.5 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-primary focus:ring-offset-2"
              >
                Pricing
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200">
              <Link
                to={{ pathname: "/", hash: "#get-started" }}
                onClick={handleLinkClick}
                className="flex items-center justify-center w-full px-6 py-3.5 text-base font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-primary focus:ring-offset-2"
              >
                Sign In
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
