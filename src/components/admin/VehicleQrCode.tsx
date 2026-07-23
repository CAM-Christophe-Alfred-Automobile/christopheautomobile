"use client";

import { useState } from "react";
import QRCode from "qrcode";

const COLORS = [
  { name: "Noir", hex: "#000000" },
  { name: "Vert", hex: "#16a34a" },
  { name: "Rouge", hex: "#dc2626" },
  { name: "Bleu", hex: "#2563eb" },
  { name: "Jaune", hex: "#eab308" },
  { name: "Rose", hex: "#db2777" },
];

async function generateBrandedQr(url: string, darkColor: string): Promise<string> {
  const size = 512;
  const canvas = document.createElement("canvas");
  await QRCode.toCanvas(canvas, url, {
    width: size,
    margin: 2,
    errorCorrectionLevel: "H",
    color: { dark: `${darkColor}ff`, light: "#ffffff00" },
  });

  const ctx = canvas.getContext("2d");
  if (ctx) {
    const logo = new Image();
    logo.src = "/apple-touch-icon.png";
    await new Promise<void>((resolve) => {
      logo.onload = () => resolve();
      logo.onerror = () => resolve();
    });
    if (logo.complete && logo.naturalWidth > 0) {
      const logoSize = size * 0.22;
      const x = (canvas.width - logoSize) / 2;
      const y = (canvas.height - logoSize) / 2;
      ctx.drawImage(logo, x, y, logoSize, logoSize);
    }
  }

  return canvas.toDataURL("image/png");
}

export default function VehicleQrCode({ vehicleId }: { vehicleId: string }) {
  const [open, setOpen] = useState(false);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [publicUrl, setPublicUrl] = useState("");
  const [color, setColor] = useState(COLORS[0].hex);

  async function generate(hex: string, url: string) {
    const png = await generateBrandedQr(url, hex);
    setDataUrl(png);
  }

  async function handleOpen() {
    const url = `${window.location.origin}/vehicule/${vehicleId}`;
    setPublicUrl(url);
    await generate(color, url);
    setOpen(true);
  }

  async function handleColorChange(hex: string) {
    setColor(hex);
    await generate(hex, publicUrl);
  }

  return (
    <>
      <button onClick={handleOpen} className="text-xs text-gray-500 hover:text-amber-400 cursor-pointer">
        📱 QR code
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3 max-w-xs w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">Scanné, ce QR code ouvre la fiche de suivi de ce véhicule.</p>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-300 cursor-pointer text-sm flex-shrink-0 ml-2"
              >
                ✕
              </button>
            </div>
            {dataUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={dataUrl}
                alt="QR code du véhicule"
                className="w-full rounded-lg p-3"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, #e5e5e5 25%, transparent 25%), linear-gradient(-45deg, #e5e5e5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e5e5 75%), linear-gradient(-45deg, transparent 75%, #e5e5e5 75%)",
                  backgroundSize: "16px 16px",
                  backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                  backgroundColor: "#fff",
                }}
              />
            )}
            <div className="flex items-center justify-center gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => handleColorChange(c.hex)}
                  title={c.name}
                  className={`w-6 h-6 rounded-full cursor-pointer border-2 ${
                    color === c.hex ? "border-white" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
            <p className="text-[11px] text-gray-500 break-all">{publicUrl}</p>
            {dataUrl && (
              <a
                href={dataUrl}
                download={`qr-vehicule-${vehicleId}.png`}
                className="block text-center text-xs px-3 py-2 rounded bg-amber-500 text-gray-900 font-semibold"
              >
                Télécharger pour impression
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}
