import type { ReactNode } from "react";
import { useCommunityLink } from "@/lib/community";

type CommunityJoinButtonProps = { className: string; children: ReactNode };

export default function CommunityJoinButton({ className, children }: CommunityJoinButtonProps) {
  const { url, enabled, loading, error } = useCommunityLink();

  if (loading) return null;
  if (error) return <p role="alert" className="text-sm text-red-700">Community invitation unavailable: {error}</p>;
  if (!enabled) return null;

  return <a href={url} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>;
}
