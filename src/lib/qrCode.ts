import QRCode from "qrcode";

export const QR_COLORS = [
  { name: "Noir", hex: "#000000" },
  { name: "Vert", hex: "#16a34a" },
  { name: "Rouge", hex: "#dc2626" },
  { name: "Bleu", hex: "#2563eb" },
  { name: "Jaune", hex: "#eab308" },
  { name: "Rose", hex: "#db2777" },
];

export async function generateBrandedQr(url: string, darkColor: string): Promise<string> {
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

export function slugifyForFilename(label: string): string {
  return (
    label
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "vehicule"
  );
}
