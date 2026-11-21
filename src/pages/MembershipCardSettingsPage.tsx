import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { ImageUp, RotateCcw, Save } from "lucide-react";
import QRCode from "qrcode";
import MembershipCardFace from "@/components/devqueens/MembershipCardFace";
import { EmptyState, PageHeading } from "@/components/platform/PlatformShell";
import { api } from "@/lib/api";
import { MEMBERSHIP_CARD_COLORS, type MembershipCardMember, type MembershipCardSettings } from "@/lib/membershipCard";

interface PreviewMember extends MembershipCardMember {
  _id: string;
  profileUrl: string;
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="form-label">
      {label}
      <span className="mt-1 flex items-center gap-2">
        <span aria-hidden="true" className="h-6 w-6 rounded border border-stone-200" style={{ backgroundColor: value }} />
        <select value={value} onChange={(event) => onChange(event.target.value)} className="form-input">
          {MEMBERSHIP_CARD_COLORS.map((color) => (
            <option key={color.value} value={color.value}>{color.label}</option>
          ))}
        </select>
      </span>
    </label>
  );
}

export default function MembershipCardSettingsPage() {
  const [settings, setSettings] = useState<MembershipCardSettings | null>(null);
  const [members, setMembers] = useState<PreviewMember[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [membersError, setMembersError] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const selectedMember = members.find((member) => member._id === selectedMemberId) ?? members[0];

  useEffect(() => {
    let active = true;
    api<{ settings: MembershipCardSettings }>("/admin/membership-card-settings")
      .then((result) => { if (active) setSettings(result.settings); })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Membership card settings could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    api<{ members: PreviewMember[] }>("/admin/members")
      .then((result) => {
        if (!active) return;
        const previewMembers = result.members.filter((member) => Boolean(member.profileUrl));
        setMembers(previewMembers);
        setSelectedMemberId(previewMembers[0]?._id ?? "");
      })
      .catch((cause) => {
        if (active) setMembersError(cause instanceof Error ? cause.message : "Member preview data could not be loaded.");
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    if (!selectedMember?.profileUrl) {
      setQrDataUrl("");
      return () => { active = false; };
    }
    QRCode.toDataURL(selectedMember.profileUrl, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 320,
      color: { dark: "#29213F", light: "#FFFFFF" },
    })
      .then((value) => { if (active) setQrDataUrl(value); })
      .catch((cause) => {
        if (active) setMembersError(cause instanceof Error ? cause.message : "The member profile QR code could not be generated.");
      });
    return () => { active = false; };
  }, [selectedMember?.profileUrl]);

  const update = <Key extends keyof MembershipCardSettings>(key: Key, value: MembershipCardSettings[Key]) => {
    setSettings((current) => current ? { ...current, [key]: value } : current);
    setNotice("");
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!settings) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await api<{ settings: MembershipCardSettings }>("/admin/membership-card-settings", {
        method: "PUT",
        body: settings,
      });
      setSettings(result.settings);
      setNotice("Membership card settings saved.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Membership card settings could not be saved.");
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    if (!window.confirm("Reset all membership card branding to the official DevQueens defaults?")) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await api<{ settings: MembershipCardSettings }>("/admin/membership-card-settings", { method: "DELETE" });
      setSettings(result.settings);
      setNotice("Membership card settings restored to defaults.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Membership card settings could not be reset.");
    } finally {
      setBusy(false);
    }
  };

  const uploadLogo = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !settings) return;
    const body = new FormData();
    body.append("image", file);
    setUploadingLogo(true);
    setError("");
    setNotice("");
    try {
      const result = await api<{ url: string }>("/admin/upload", { method: "POST", body });
      update("logoUrl", result.url);
      setNotice("Logo uploaded. Save changes to publish it on membership cards.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The logo could not be uploaded.");
    } finally {
      setUploadingLogo(false);
    }
  };

  if (loading) return <p role="status" className="text-sm text-stone-500">Loading membership card settings…</p>;

  return (
    <>
      <PageHeading
        eyebrow="Platform branding"
        title="Membership Card Settings"
        description="Edit the shared card design. Member identity, status, ID, photo and verification link remain tied to each member record."
      />
      {error && <p role="alert" className="notice-error mb-4">{error}</p>}
      {notice && <p role="status" className="notice-success mb-4">{notice}</p>}
      {!settings ? (
        <div>
          <EmptyState title="Card settings unavailable" message="The settings could not be loaded. Try refreshing, or restore the default settings." />
          <button type="button" disabled={busy} onClick={() => void reset()} className="btn-outline-brand mt-4 disabled:opacity-60">
            <RotateCcw size={15} /> Reset to Default
          </button>
        </div>
      ) : (
        <div className="grid items-start gap-6 2xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,.85fr)]">
          <form onSubmit={save} className="space-y-5 rounded-xl border border-orange-100 bg-white p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="form-label">Card organization name
                <input required minLength={2} maxLength={64} value={settings.organizationName} onChange={(event) => update("organizationName", event.target.value)} className="form-input" />
              </label>
              <label className="form-label">Brand subtitle
                <input required maxLength={96} value={settings.brandSubtitle} onChange={(event) => update("brandSubtitle", event.target.value)} className="form-input" />
              </label>
              <label className="form-label">Main slogan
                <input required maxLength={48} value={settings.slogan} onChange={(event) => update("slogan", event.target.value)} className="form-input" />
              </label>
              <label className="form-label">Supporting description
                <input required maxLength={160} value={settings.supportingDescription} onChange={(event) => update("supportingDescription", event.target.value)} className="form-input" />
              </label>
              <ColorField label="Card background" value={settings.backgroundColor} onChange={(value) => update("backgroundColor", value)} />
              <ColorField label="Secondary surface" value={settings.secondaryColor} onChange={(value) => update("secondaryColor", value)} />
              <ColorField label="Accent color" value={settings.accentColor} onChange={(value) => update("accentColor", value)} />
              <ColorField label="Highlight color" value={settings.highlightColor} onChange={(value) => update("highlightColor", value)} />
              <label className="form-label">Member category label
                <input required maxLength={56} value={settings.memberCategoryLabel} onChange={(event) => update("memberCategoryLabel", event.target.value)} className="form-input" />
              </label>
              <label className="form-label">Default member role / title
                <input required maxLength={80} value={settings.defaultMemberRole} onChange={(event) => update("defaultMemberRole", event.target.value)} className="form-input" />
              </label>
              <label className="form-label">QR code caption
                <input required maxLength={56} value={settings.qrCaption} onChange={(event) => update("qrCaption", event.target.value)} className="form-input" />
              </label>
              <label className="form-label">Card footer message
                <input required maxLength={120} value={settings.footerMessage} onChange={(event) => update("footerMessage", event.target.value)} className="form-input" />
              </label>
              <label className="form-label sm:col-span-2">Logo URL or same-site image path
                <input maxLength={2048} value={settings.logoUrl} onChange={(event) => update("logoUrl", event.target.value)} className="form-input" placeholder="https://… or /logo.png" />
                <span className="mt-1 block text-xs font-normal text-stone-500">Use an HTTPS URL or upload an image. The server accepts only safe HTTPS URLs and same-site paths.</span>
              </label>
              <label className="form-label sm:col-span-2">Upload logo
                <span className="mt-1 flex flex-wrap items-center gap-3">
                  <input type="file" accept="image/*" onChange={(event) => void uploadLogo(event)} className="form-input min-w-0 flex-1 text-xs" />
                  <span className="inline-flex items-center gap-1 text-xs text-stone-500"><ImageUp size={14} /> {uploadingLogo ? "Uploading…" : "Up to 5 MB"}</span>
                </span>
              </label>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-stone-100 pt-4">
              <button type="submit" disabled={busy || uploadingLogo} className="btn-brand disabled:opacity-60">
                <Save size={15} /> {busy ? "Saving…" : "Save Changes"}
              </button>
              <button type="button" disabled={busy || uploadingLogo} onClick={() => void reset()} className="btn-outline-brand disabled:opacity-60">
                <RotateCcw size={15} /> Reset to Default
              </button>
            </div>
          </form>

          <section className="rounded-xl border border-orange-100 bg-white p-5">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold">Live card preview</h2>
                <p className="mt-1 text-xs leading-5 text-stone-500">Preview uses a real member record. Only shared branding is saved here.</p>
              </div>
              {members.length > 0 && (
                <label className="form-label min-w-44">Preview member
                  <select value={selectedMember?._id ?? ""} onChange={(event) => setSelectedMemberId(event.target.value)} className="form-input">
                    {members.map((member) => <option key={member._id} value={member._id}>{member.name} · {member.memberId ?? "No ID"}</option>)}
                  </select>
                </label>
              )}
            </div>
            {membersError && <p role="alert" className="notice-error mb-4">{membersError}</p>}
            {selectedMember ? (
              <MembershipCardFace member={selectedMember} settings={settings} qrDataUrl={qrDataUrl} />
            ) : (
              <EmptyState title="No member available to preview" message="Card branding can still be saved. Add a member to preview personalized details and its QR code." />
            )}
          </section>
        </div>
      )}
    </>
  );
}
