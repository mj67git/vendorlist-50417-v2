import React from 'react';
import { Grade, Status, Scores } from '../types';

interface GradeBadgeProps {
  grade: Grade;
  status: Status;
  scores?: Scores | null;
}

export function GradeBadge({ grade, status, scores }: GradeBadgeProps) {
  let mode = 'new';
  let label = 'جدید';

  const isFullyScored = scores && scores.commercial > 0 && scores.qa > 0 && scores.planning > 0 && scores.finance > 0;
  const hasSomeScores = scores && (scores.commercial > 0 || scores.qa > 0 || scores.planning > 0 || scores.finance > 0);

  if (status === 'rejected' || grade === 'rejected' || grade === 'black list') {
    mode = 'rejected';
    label = 'لیست سیاه';
  } else if (status === 'new' || grade === null) {
    if (hasSomeScores && !isFullyScored) {
      mode = 'conditional';
      label = 'در حال ارزیابی';
    } else {
      mode = 'new';
      label = 'جدید';
    }
  } else {
    // Has a grade
    if (grade === 'A') {
      mode = 'gradeA';
      label = 'Grade A';
    } else if (grade === 'B') {
      mode = 'gradeB';
      label = 'Grade B';
    } else {
      mode = 'gradeC';
      label = 'Grade C';
    }
  }

  const palettes = {
    gradeA: { bg: 'bg-emerald-600/10 border-emerald-600/25 text-emerald-800', dot: 'bg-emerald-600' },
    gradeB: { bg: 'bg-[#0071E3]/10 border-[#0071E3]/25 text-[#0071E3]', dot: 'bg-[#0071E3]' },
    gradeC: { bg: 'bg-amber-600/10 border-amber-600/25 text-[#78350f]', dot: 'bg-amber-600' },
    conditional: { bg: 'bg-amber-600/10 border-amber-600/25 text-[#78350f]', dot: 'bg-amber-600' },
    rejected: { bg: 'bg-red-600/10 border-red-600/25 text-[#7f1d1d]', dot: 'bg-red-600' },
    new: { bg: 'bg-cyan-600/10 border-cyan-600/25 text-[#0c4a6e]', dot: 'bg-cyan-600' },
  };

  const p = palettes[mode as keyof typeof palettes];

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${p.bg} text-xs font-semibold tracking-wide`}>
      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${p.dot}`} />
      {label}
    </div>
  );
}
