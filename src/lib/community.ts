import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type CommunityLinkSettings = { url: string; enabled: boolean };
type CommunityLinkState = CommunityLinkSettings & { loading: boolean; error: string };

export function useCommunityLink(): CommunityLinkState {
  const [settings, setSettings] = useState<CommunityLinkState>({
    url: "",
    enabled: false,
    loading: true,
    error: "",
  });

  useEffect(() => {
    let active = true;
    api<CommunityLinkSettings>("/community-link")
      .then((result) => {
        if (active) setSettings({ ...result, loading: false, error: "" });
      })
      .catch((cause: unknown) => {
        if (active) setSettings({
          url: "",
          enabled: false,
          loading: false,
          error: cause instanceof Error ? cause.message : "Community link could not be loaded.",
        });
      });
    return () => { active = false; };
  }, []);

  return settings;
}
