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
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
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

  if (!settings) return <p className="text-mute">Chargement...</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-paper mb-6">Reglages</h1>

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
        <div className="space-y-3">
          <Toggle
            label="Notification dans l'application"
            checked={settings.notifyApp}
            onChange={(v) => setSettings({ ...settings, notifyApp: v })}
          />
          <Toggle
            label="Email"
            checked={settings.notifyEmail}
            onChange={(v) => setSettings({ ...settings, notifyEmail: v })}
          />
          <Toggle
            label="Telegram"
            checked={settings.notifyTelegram}
            onChange={(v) => setSettings({ ...settings, notifyTelegram: v })}
          />
          <Toggle
            label="Discord"
            checked={settings.notifyDiscord}
            onChange={(v) => setSettings({ ...settings, notifyDiscord: v })}
          />
        </div>
        <p className="text-mute text-xs mt-4">
          Email, Telegram et Discord necessitent les variables d'environnement correspondantes
          (voir le fichier .env.example et le README).
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
