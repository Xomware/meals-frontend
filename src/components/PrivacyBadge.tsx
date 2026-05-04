import { Privacy } from '@/types';

interface Props {
  privacy: Privacy;
  showFriendsHint?: boolean;
}

const STYLES: Record<Privacy, string> = {
  public: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  friends: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  private: 'bg-zinc-800 text-zinc-300 border-zinc-700',
};

const LABELS: Record<Privacy, string> = {
  public: 'Public',
  friends: 'Friends',
  private: 'Private',
};

export function PrivacyBadge({ privacy, showFriendsHint }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${STYLES[privacy]}`}
    >
      {LABELS[privacy]}
      {showFriendsHint && privacy === 'friends' && (
        <span className="font-normal normal-case tracking-normal text-amber-200/70">
          (friends feature coming)
        </span>
      )}
    </span>
  );
}
