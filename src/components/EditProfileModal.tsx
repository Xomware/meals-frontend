'use client';
import { useEffect, useRef, useState } from 'react';
import Modal from './Modal';
import {
  EditProfileFields,
  ProfileVisibility,
  UserProfile,
} from '@/lib/users';

interface Props {
  open: boolean;
  profile: UserProfile;
  onClose: () => void;
  onSave: (fields: EditProfileFields) => Promise<UserProfile>;
  onUploadAvatar: (file: File) => Promise<UserProfile>;
}

const ACCEPTED_TYPES = 'image/png,image/jpeg,image/webp';
const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5 MB
const DISPLAY_NAME_MIN = 1;
const DISPLAY_NAME_MAX = 50;

const inputCls =
  'w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-coral-400/40 focus:border-coral-400 transition disabled:opacity-50';
const labelCls =
  'block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5';

export default function EditProfileModal({
  open,
  profile,
  onClose,
  onSave,
  onUploadAvatar,
}: Props) {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [visibility, setVisibility] = useState<ProfileVisibility>(
    profile.profileVisibility,
  );
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form whenever a new profile is loaded into the modal (e.g. user
  // opens it, edits, closes, opens again).
  useEffect(() => {
    if (!open) return;
    setDisplayName(profile.displayName);
    setVisibility(profile.profileVisibility);
    setPendingFile(null);
    setPreviewUrl(null);
    setError(null);
  }, [open, profile.displayName, profile.profileVisibility]);

  // Manage object URL lifecycle so we don't leak blobs.
  useEffect(() => {
    if (!pendingFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(pendingFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingFile]);

  const trimmedName = displayName.trim();
  const nameValid =
    trimmedName.length >= DISPLAY_NAME_MIN &&
    trimmedName.length <= DISPLAY_NAME_MAX;

  const dirty =
    trimmedName !== profile.displayName ||
    visibility !== profile.profileVisibility ||
    !!pendingFile;

  const handleFile = (file: File | null) => {
    setError(null);
    if (!file) {
      setPendingFile(null);
      return;
    }
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('Avatar must be a PNG, JPEG, or WebP.');
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setError('Avatar must be 5 MB or smaller.');
      return;
    }
    setPendingFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameValid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      // Avatar first so the final edit reflects the new URL atomically.
      if (pendingFile) {
        await onUploadAvatar(pendingFile);
      }

      const fields: EditProfileFields = {};
      if (trimmedName !== profile.displayName) fields.displayName = trimmedName;
      if (visibility !== profile.profileVisibility)
        fields.profileVisibility = visibility;

      if (Object.keys(fields).length > 0) {
        await onSave(fields);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  const avatarShown = previewUrl ?? profile.avatarUrl ?? null;

  return (
    <Modal open={open} onClose={onClose} title="Edit profile">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <span className={labelCls}>Avatar</span>
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full overflow-hidden border border-zinc-700 bg-zinc-800 grid place-items-center">
              {avatarShown ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarShown}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span
                  className="text-xl font-black uppercase text-white bg-gradient-to-br from-coral-500 to-flame-500 h-full w-full grid place-items-center"
                  aria-hidden="true"
                >
                  {profile.preferredUsername.charAt(0)}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-coral-500/50 text-zinc-100 px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition focus:outline-none focus:ring-2 focus:ring-coral-400/40"
              >
                {avatarShown ? 'Change' : 'Upload'}
              </button>
              {pendingFile && (
                <button
                  type="button"
                  onClick={() => handleFile(null)}
                  className="text-xs text-zinc-400 hover:text-coral-300 transition"
                >
                  Cancel selection
                </button>
              )}
              <p className="text-[11px] text-zinc-500">
                PNG, JPEG, or WebP. Max 5 MB.
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES}
              className="sr-only"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="displayName" className={labelCls}>
            Display name
          </label>
          <input
            id="displayName"
            className={inputCls}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            maxLength={DISPLAY_NAME_MAX}
            required
            aria-invalid={!nameValid}
          />
          <p className="mt-1 text-[11px] text-zinc-500">
            {trimmedName.length}/{DISPLAY_NAME_MAX} characters
          </p>
        </div>

        <div>
          <span className={labelCls}>Profile visibility</span>
          <div
            role="radiogroup"
            aria-label="Profile visibility"
            className="flex bg-zinc-900 rounded-lg p-0.5 border border-zinc-800 w-fit"
          >
            <VisibilityOption
              value="public"
              current={visibility}
              onChange={setVisibility}
              label="Public"
            />
            <VisibilityOption
              value="private"
              current={visibility}
              onChange={setVisibility}
              label="Private"
            />
          </div>
          <p className="mt-1.5 text-[11px] text-zinc-500">
            {visibility === 'public'
              ? 'Anyone can find you by handle and see your profile.'
              : 'Your profile is only visible to you.'}
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="text-xs text-coral-300 bg-coral-900/30 border border-coral-800 rounded-md px-3 py-2"
          >
            {error}
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !nameValid || !dirty}
            className="flex-1 bg-gradient-to-r from-coral-500 to-coral-400 hover:from-coral-400 hover:to-coral-300 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold uppercase tracking-wider py-2.5 px-4 rounded-lg transition shadow-lg shadow-coral-500/20 focus:outline-none focus:ring-2 focus:ring-coral-400/50"
          >
            {submitting ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function VisibilityOption({
  value,
  current,
  onChange,
  label,
}: {
  value: ProfileVisibility;
  current: ProfileVisibility;
  onChange: (v: ProfileVisibility) => void;
  label: string;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={() => onChange(value)}
      className={`px-4 py-1.5 rounded-md text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-coral-400/40 ${
        active
          ? 'bg-zinc-800 text-white'
          : 'text-zinc-500 hover:text-zinc-200'
      }`}
    >
      {label}
    </button>
  );
}
