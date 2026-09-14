"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function SharePage() {
  const [url, setUrl] = useState("");
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const svgRef = useRef<string>("");

  useEffect(() => {
    // NEXT_PUBLIC_APP_URL est la source de verite (a definir sur l'hebergeur
    // avec l'URL publique reelle) ; on retombe sur l'origine du navigateur
    // si elle n'est pas encore configuree.
    const publicUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    setUrl(publicUrl);
    QRCode.toDataURL(publicUrl, { width: 480, margin: 2, color: { dark: "#12151A", light: "#EEF0EC" } }).then(
      setDataUrl
    );
    QRCode.toString(publicUrl, { type: "svg", margin: 2 }).then((svg) => {
      svgRef.current = svg;
    });
  }, []);

  function downloadPng() {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "niches-qrcode.png";
    a.click();
  }

  function downloadSvg() {
    if (!svgRef.current) return;
    const blob = new Blob([svgRef.current], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "niches-qrcode.svg";
    a.click();
  }

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl font-semibold text-paper mb-2">Partager l'app</h1>
      <p className="text-mute text-sm mb-6">
        Scanne ce code pour ouvrir l'application sur un telephone, ou partage le lien directement.
      </p>

      <Card className="flex flex-col items-center gap-4">
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dataUrl} alt="QR code de l'application" className="w-56 h-56" />
        ) : (
          <div className="w-56 h-56 bg-line animate-pulse rounded-tag" />
        )}
        <p className="font-mono text-sm text-paper break-all text-center">{url}</p>
        <div className="flex gap-2">
          <Button onClick={downloadPng}>Telecharger en PNG</Button>
          <Button variant="ghost" onClick={downloadSvg}>
            Telecharger en SVG
          </Button>
        </div>
      </Card>

      {url.includes("localhost") && (
        <p className="text-clay text-xs mt-4">
          Cette URL pointe vers localhost : elle ne fonctionnera que sur cet ordinateur. Une fois
          l'app deployee, defini NEXT_PUBLIC_APP_URL avec l'URL publique pour que ce QR code
          pointe au bon endroit.
        </p>
      )}
    </div>
  );
}
