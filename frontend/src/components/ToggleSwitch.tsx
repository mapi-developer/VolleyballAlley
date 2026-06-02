"use client";

interface ToggleSwitchProps {
  label: string;
  description?: string;
  isOn: boolean;
  onToggle: () => void;
}

export default function ToggleSwitch({ label, description, isOn, onToggle }: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-app-active last:border-0 transition-colors">
      <div className="flex flex-col pr-4">
        <span className="text-sm font-medium text-app-text-primary transition-colors">{label}</span>
        {description && <span className="text-xs text-app-text-secondary mt-0.5 transition-colors">{description}</span>}
      </div>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          isOn ? 'bg-app-accent' : 'bg-app-active'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            isOn ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}