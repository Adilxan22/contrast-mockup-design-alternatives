"use client";

interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div role="tablist" className="flex gap-6 border-b border-border font-body">
      {tabs.map((t) => {
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(t.id)}
            className={`-mb-px cursor-pointer border-b-2 py-3 text-base transition-colors duration-150 ease-standard ${
              isActive
                ? "border-foreground text-foreground"
                : "border-transparent text-foreground-muted hover:text-foreground-secondary"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
