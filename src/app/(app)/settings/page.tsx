"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, TextField } from "@/components/ui/Input";

type Settings = {
  packagingFee: number;
  platformFeePercent: number;
  miscFee: number;
  notifyApp: boolean;
  notifyEmail: boolean;
  notifyTelegram: boolean;
  notifyDiscord: boolean;
  notifyEmailTo: string | null;
  telegramChatId: string | null;
  discordWebhookUrl: string | null;
  webhookToken: string;
  email: string;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saved, setSaved] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setSettings);
  }, []);

  async function save() {
    if (!settings) return;
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function regenerateToken() {
    if (!confirm("Regenerer le jeton ? L'ancien cessera de fonctionner immediatement.")) return;
    const res = await fetch("/api/account/regenerate-token", { method: "POST" });
    const body = await res.json();
    setSettings((s) => (s ? { ...s, webhookToken: body.webhookToken } : s));
  }

  if (!settings) return <p className="text-mute">Chargement...</p>;

  const webhookUrl = `${origin}/api/webhooks/watcher`;

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-paper mb-6">Reglages</h1>

      <Card className="mb-6">
        <h2 className="font-display text-base font-semibold text-paper mb-1">Mon compte</h2>
        <p className="text-mute text-sm mb-4">{settings.email}</p>

        <Label>Jeton d'ingestion personnel (webhook / bookmarklet)</Label>
        <div className="flex gap-2 mb-2">
          <TextField readOnly value={settings.webhookToken} className="font-mono text-xs" />
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigator.clipboard.writeText(settings.webhookToken)}
          >
            Copier
          </Button>
        </div>
        <p className="text-mute text-xs mb-2">
          URL du webhook : <span className="font-mono">{webhookUrl}</span> — a appeler avec le
          header <span className="font-mono">x-watcher-token</span>. Ne le partage avec personne :
          il donne acces a la creation d'opportunites sur ton compte.
        </p>
        <Button type="button" variant="danger" onClick={regenerateToken}>
          Regenerer le jeton
        </Button>
      </Card>

      <Card className="mb-6">
        <h2 className="font-display text-base font-semibold text-paper mb-4">
          Frais utilises dans les calculs
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Emballage (€)</Label>
            <TextField
              type="number"
              step="0.1"
              value={settings.packagingFee}
              onChange={(e) =>
                setSettings({ ...settings, packagingFee: parseFloat(e.target.value) || 0 })
              }
            />
          </div>
          <div>
            <Label>Commission / frais (%)</Label>
            <TextField
              type="number"
              step="1"
              value={settings.platformFeePercent}
              onChange={(e) =>
                setSettings({ ...settings, platformFeePercent: parseFloat(e.target.value) || 0 })
              }
            />
          </div>
          <div>
            <Label>Frais divers (€)</Label>
            <TextField
              type="number"
              step="0.1"
              value={settings.miscFee}
              onChange={(e) =>
                setSettings({ ...settings, miscFee: parseFloat(e.target.value) || 0 })
              }
            />
          </div>
        </div>
      </Card>

      <Card className="mb-6">
        <h2 className="font-display text-base font-semibold text-paper mb-4">Notifications</h2>
        <div className="space-y-4">
          <div>
            <Toggle
              label="Notification dans l'application"
              checked={settings.notifyApp}
              onChange={(v) => setSettings({ ...settings, notifyApp: v })}
            />
          </div>
          <div>
            <Toggle
              label="Email"
              checked={settings.notifyEmail}
              onChange={(v) => setSettings({ ...settings, notifyEmail: v })}
            />
            {settings.notifyEmail && (
              <TextField
                className="mt-2"
                type="email"
                placeholder={settings.email}
                value={settings.notifyEmailTo ?? ""}
                onChange={(e) => setSettings({ ...settings, notifyEmailTo: e.target.value })}
              />
            )}
          </div>
          <div>
            <Toggle
              label="Telegram"
              checked={settings.notifyTelegram}
              onChange={(v) => setSettings({ ...settings, notifyTelegram: v })}
            />
            {settings.notifyTelegram && (
              <TextField
                className="mt-2"
                placeholder="chat_id Telegram"
                value={settings.telegramChatId ?? ""}
                onChange={(e) => setSettings({ ...settings, telegramChatId: e.target.value })}
              />
            )}
          </div>
          <div>
            <Toggle
              label="Discord"
              checked={settings.notifyDiscord}
              onChange={(v) => setSettings({ ...settings, notifyDiscord: v })}
            />
            {settings.notifyDiscord && (
              <TextField
                className="mt-2"
                placeholder="URL du webhook Discord"
                value={settings.discordWebhookUrl ?? ""}
                onChange={(e) => setSettings({ ...settings, discordWebhookUrl: e.target.value })}
              />
            )}
          </div>
        </div>
        <p className="text-mute text-xs mt-4">
          Email et Telegram necessitent aussi la configuration du serveur (SMTP_* / TELEGRAM_BOT_TOKEN
          dans les variables d'environnement) — voir le README.
        </p>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={save}>Enregistrer</Button>
        {saved && <span className="text-sage text-sm">Enregistre.</span>}
      </div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-paper text-sm">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-amber"
      />
    </label>
  );
}
