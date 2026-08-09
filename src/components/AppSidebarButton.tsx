import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface VariantStyle {
  activeClass: string;
  hoverClass: string;
  iconActiveClass: string;
  iconHoverClass: string;
}

const variantStyles: Record<string, VariantStyle> = {
  home: {
    activeClass: 'bg-cyan-50/80 text-cyan-600 border-cyan-500/30 shadow-[inset_3px_0_0_#0891b2] border',
    hoverClass: 'text-slate-500 hover:text-cyan-600 hover:bg-cyan-50/40 hover:border-cyan-500/15 hover:shadow-[inset_3px_0_0_#0891b2]/30',
    iconActiveClass: 'bg-cyan-600/10 border border-cyan-500/25 text-cyan-600',
    iconHoverClass: 'group-hover:bg-cyan-600/5 group-hover:border-cyan-500/20 group-hover:text-cyan-600',
  },
  archive: {
    activeClass: 'bg-blue-50/80 text-blue-600 border-blue-500/30 shadow-[inset_3px_0_0_#2563eb] border',
    hoverClass: 'text-slate-500 hover:text-blue-600 hover:bg-blue-50/40 hover:border-blue-500/15 hover:shadow-[inset_3px_0_0_#2563eb]/30',
    iconActiveClass: 'bg-blue-600/10 border border-blue-500/25 text-blue-600',
    iconHoverClass: 'group-hover:bg-blue-600/5 group-hover:border-blue-500/20 group-hover:text-blue-600',
  },
  foreign: {
    activeClass: 'bg-indigo-50/80 text-indigo-600 border-indigo-500/30 shadow-[inset_3px_0_0_#4f46e5] border',
    hoverClass: 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/40 hover:border-indigo-500/15 hover:shadow-[inset_3px_0_0_#4f46e5]/30',
    iconActiveClass: 'bg-indigo-600/10 border border-indigo-500/25 text-indigo-600',
    iconHoverClass: 'group-hover:bg-indigo-600/5 group-hover:border-indigo-500/20 group-hover:text-indigo-600',
  },
  domestic: {
    activeClass: 'bg-emerald-50/80 text-emerald-600 border-emerald-500/30 shadow-[inset_3px_0_0_#059669] border',
    hoverClass: 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50/40 hover:border-emerald-500/15 hover:shadow-[inset_3px_0_0_#059669]/30',
    iconActiveClass: 'bg-emerald-600/10 border border-emerald-500/25 text-emerald-600',
    iconHoverClass: 'group-hover:bg-emerald-600/5 group-hover:border-emerald-500/20 group-hover:text-emerald-600',
  },
  veterinary: {
    activeClass: 'bg-fuchsia-50/80 text-fuchsia-600 border-fuchsia-200 shadow-[inset_3px_0_0_#c026d3] border',
    hoverClass: 'text-slate-500 hover:text-fuchsia-600 hover:bg-fuchsia-50/40 hover:border-fuchsia-500/15 hover:shadow-[inset_3px_0_0_#c026d3]/30',
    iconActiveClass: 'bg-fuchsia-600/10 border border-fuchsia-500/25 text-fuchsia-600',
    iconHoverClass: 'group-hover:bg-fuchsia-600/5 group-hover:border-fuchsia-500/20 group-hover:text-fuchsia-600',
  },
  packaging: {
    activeClass: 'bg-amber-50/80 text-amber-600 border-amber-500/30 shadow-[inset_3px_0_0_#d97706] border',
    hoverClass: 'text-slate-500 hover:text-amber-600 hover:bg-amber-50/40 hover:border-amber-500/15 hover:shadow-[inset_3px_0_0_#d97706]/30',
    iconActiveClass: 'bg-amber-600/10 border border-amber-500/25 text-amber-600',
    iconHoverClass: 'group-hover:bg-amber-600/5 group-hover:border-amber-500/20 group-hover:text-amber-600',
  },
  sample: {
    activeClass: 'bg-violet-50/80 text-violet-600 border-violet-500/30 shadow-[inset_3px_0_0_#7c3aed] border',
    hoverClass: 'text-slate-500 hover:text-violet-600 hover:bg-violet-50/40 hover:border-violet-500/15 hover:shadow-[inset_3px_0_0_#7c3aed]/30',
    iconActiveClass: 'bg-violet-600/10 border border-violet-500/25 text-violet-600',
    iconHoverClass: 'group-hover:bg-violet-600/5 group-hover:border-violet-500/20 group-hover:text-violet-600',
  },
  blacklist: {
    activeClass: 'bg-rose-50/80 text-rose-600 border-rose-500/30 shadow-[inset_3px_0_0_#e11d48] border',
    hoverClass: 'text-slate-500 hover:text-rose-600 hover:bg-rose-50/40 hover:border-rose-500/15 hover:shadow-[inset_3px_0_0_#e11d48]/30',
    iconActiveClass: 'bg-rose-600/10 border border-rose-500/25 text-rose-600',
    iconHoverClass: 'group-hover:bg-rose-600/5 group-hover:border-rose-500/20 group-hover:text-rose-600',
  },
  'supplier-audit': {
    activeClass: 'bg-teal-50/80 text-teal-600 border-teal-500/30 shadow-[inset_3px_0_0_#0d9488] border',
    hoverClass: 'text-slate-500 hover:text-teal-600 hover:bg-teal-50/40 hover:border-teal-500/15 hover:shadow-[inset_3px_0_0_#0d9488]/30',
    iconActiveClass: 'bg-teal-600/10 border border-teal-500/25 text-teal-600',
    iconHoverClass: 'group-hover:bg-teal-600/5 group-hover:border-teal-500/20 group-hover:text-teal-600',
  },
  'audit-trail': {
    activeClass: 'bg-slate-100 text-slate-700 border-slate-300 shadow-[inset_3px_0_0_#475569] border',
    hoverClass: 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/40 hover:border-slate-300/15 hover:shadow-[inset_3px_0_0_#475569]/30',
    iconActiveClass: 'bg-slate-700/10 border border-slate-500/25 text-slate-700',
    iconHoverClass: 'group-hover:bg-slate-700/5 group-hover:border-slate-500/20 group-hover:text-slate-700',
  },
  materials: {
    activeClass: 'bg-fuchsia-50/80 text-fuchsia-600 border-fuchsia-500/30 shadow-[inset_3px_0_0_#c026d3] border',
    hoverClass: 'text-slate-500 hover:text-fuchsia-600 hover:bg-fuchsia-50/40 hover:border-fuchsia-500/15 hover:shadow-[inset_3px_0_0_#c026d3]/30',
    iconActiveClass: 'bg-fuchsia-600/10 border border-fuchsia-500/25 text-fuchsia-600',
    iconHoverClass: 'group-hover:bg-fuchsia-600/5 group-hover:border-fuchsia-500/20 group-hover:text-fuchsia-600',
  },
  'business-partners': {
    activeClass: 'bg-blue-50/80 text-blue-600 border-blue-500/30 shadow-[inset_3px_0_0_#2563eb] border',
    hoverClass: 'text-slate-500 hover:text-blue-600 hover:bg-blue-50/40 hover:border-blue-500/15 hover:shadow-[inset_3px_0_0_#2563eb]/30',
    iconActiveClass: 'bg-blue-600/10 border border-blue-500/25 text-blue-600',
    iconHoverClass: 'group-hover:bg-blue-600/5 group-hover:border-blue-500/20 group-hover:text-blue-600',
  },
};

interface AppSidebarButtonProps {
  icon: LucideIcon;
  label: string;
  sub?: string;
  active: boolean;
  onClick: () => void;
  variant?: string;
}

export function AppSidebarButton({
  icon: Icon,
  label,
  sub,
  active,
  onClick,
  variant = 'home',
}: AppSidebarButtonProps) {
  const currentStyle = variantStyles[variant] || variantStyles.home;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`
        w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 text-right group border
        ${active
          ? currentStyle.activeClass
          : `bg-transparent border-transparent ${currentStyle.hoverClass}`
        }
      `}
    >
      <div className={`
        w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-mono text-xs font-black transition-all duration-300
        ${active
          ? currentStyle.iconActiveClass
          : `bg-slate-900/5 border border-slate-900/10 text-slate-400 ${currentStyle.iconHoverClass}`
        }
      `}>
        <Icon className="w-4 h-4" aria-hidden="true" />
      </div>
      <div className="flex flex-col overflow-hidden text-right">
        <span className="font-semibold leading-tight truncate text-inherit">{label}</span>
        {sub && <span className="text-[10px] opacity-60 truncate font-mono uppercase tracking-wider">{sub}</span>}
      </div>
    </button>
  );
}
