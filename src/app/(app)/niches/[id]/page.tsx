"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { NicheForm, NicheFormValues } from "@/components/NicheForm";
import { Button } from "@/components/ui/Button";

export default function EditNichePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [initial, setInitial] = useState<Partial<NicheFormValues> | null>(null);
  const [status, setStatus] = useState<"ACTIVE" | "PAUSED">("ACTIVE");

  useEffect(() => {
    fetch(`/api/niches/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setInitial(data);
        setStatus(data.status);
      });
  }, [params.id]);

  async function handleSubmit(values: NicheFormValues) {
    const res = await fetch(`/api/niches/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) throw new Error("Erreur lors de la mise a jour.");
    router.push("/dashboard");
    router.refresh();
  }

  if (!initial) return <p className="text-mute">Chargement...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold text-paper">Modifier la niche</h1>
        <Button
          variant="ghost"
          onClick={async () => {
            const newStatus = status === "ACTIVE" ? "PAUSED" : "ACTIVE";
            await fetch(`/api/niches/${params.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: newStatus }),
            });
            setStatus(newStatus);
            router.refresh();
          }}
        >
          {status === "ACTIVE" ? "Mettre en pause" : "Activer"}
        </Button>
      </div>
      <NicheForm initial={initial} submitLabel="Enregistrer" onSubmit={handleSubmit} />
    </div>
  );
}
