"use client";

import { useState } from "react";
import { BarChart3, Filter, Download, Bell, X } from "lucide-react";

const tips = [
  { icon: BarChart3, text: "View key metrics at a glance" },
  { icon: Filter, text: "Use filters to narrow down data" },
  { icon: Download, text: "Export reports for your records" },
  { icon: Bell, text: "Stay updated with real-time notifications" },
];

export default function OnboardingGuide() {
  const [visible, setVisible] = useState(
    () => !localStorage.getItem("dashboard-tour-done")
  );

  const dismiss = () => {
    localStorage.setItem("dashboard-tour-done", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-card border border-border/50 rounded-2xl shadow-2xl p-6">
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X size={16} />
      </button>

      <h2 className="text-lg font-semibold mb-4">Welcome to your Dashboard 🎉</h2>

      <ul className="space-y-3 mb-6">
        {tips.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-3 text-sm text-muted-foreground">
            <Icon size={18} className="text-primary shrink-0" />
            <span>{text}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={dismiss}
        className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
      >
        Got it!
      </button>

      <button
        onClick={dismiss}
        className="block mx-auto mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        Dismiss
      </button>
    </div>
  );
}
