"use client";

const FINANCE_URL = "https://finance-copilot-wine.vercel.app";

export default function CamFinanceLink() {
  async function handleClick() {
    const win = window.open("", "_blank");
    try {
      const res = await fetch("/api/admin/sso-handoff", { method: "POST" });
      const data = await res.json();
      if (data.success && win) {
        win.location.href = `${FINANCE_URL}/api/sso-login?token=${encodeURIComponent(data.token)}`;
      } else if (win) {
        win.location.href = FINANCE_URL;
      }
    } catch {
      if (win) win.location.href = FINANCE_URL;
    }
  }

  return (
    <button onClick={handleClick} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
      CAMfinance
    </button>
  );
}
