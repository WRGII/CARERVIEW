import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, AlertTriangle } from 'lucide-react';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { deleteOwnAccount } from '../../lib/caregiver';
import { supabase } from '../../lib/supabaseClient';

export default function DeleteAccount() {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteClick = () => {
    setError(null);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteOwnAccount();

      if (!result.ok) {
        if (result.error === 'TEAM_OWNER_HAS_MEMBERS') {
          const memberText = result.activeMemberCount === 1 ? 'member' : 'members';
          setError(
            `You cannot delete your account while you have ${result.activeMemberCount} active team ${memberText}. Please remove all team members from "${result.teamName}" before deleting your account.`
          );
          setIsDeleting(false);
          return;
        }

        setError(result.message || 'Account deletion failed. Please try again.');
        setIsDeleting(false);
        return;
      }

      await supabase.auth.signOut();

      window.location.href = '/?deleted=true';
    } catch (err: any) {
      console.error('Delete account error:', err);
      setError(err?.message || 'An unexpected error occurred. Please try again.');
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setError(null);
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 pt-8 border-t border-gray-200">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Danger Zone
            </h3>
            <p className="text-sm text-red-800 mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>

            <div className="bg-white border border-red-200 rounded-md p-4 mb-4">
              <p className="text-sm font-medium text-slate-700 mb-2">
                The following data will be permanently deleted:
              </p>
              <ul className="space-y-1 text-sm text-gray-700">
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></span>
                  All observations and associated data
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></span>
                  Your subscription will be cancelled
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></span>
                  Team data and memberships (if applicable)
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></span>
                  Your profile and account information
                </li>
              </ul>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-300 rounded-md p-3 mb-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Your Account?"
        message="This action cannot be undone. All observations and data will be permanently deleted. Your subscription will be cancelled, and you will receive a confirmation email."
        confirmLabel="Yes, Delete My Account"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}
