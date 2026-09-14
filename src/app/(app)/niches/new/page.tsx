"use client";

import { useRouter } from "next/navigation";
import { NicheForm, NicheFormValues } from "@/components/NicheForm";

export default function NewNichePage() {
  const router = useRouter();

  async function handleSubmit(values: NicheFormValues) {
    const res = await fetch("/api/niches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error ? "Verifie les champs du formulaire." : "Erreur serveur.");
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-paper mb-6">
        Nouvelle niche
      </h1>
      <NicheForm submitLabel="Creer la niche" onSubmit={handleSubmit} />
    </div>
  );
}
