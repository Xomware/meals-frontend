'use client';
import { IconRating } from './IconRating';

interface Props {
  value: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
  label?: string;
}

/**
 * Star-shaped rating — thin wrapper around IconRating for callers that
 * don't care about the new themed-axis system (CookForm, /cooks/view).
 */
export function RatingStars(props: Props) {
  return <IconRating {...props} icon="⭐" />;
}
