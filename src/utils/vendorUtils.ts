import { Vendor, Scores } from '../types';

export const extractCountry = (addressStr: string | null | undefined): string => {
  if (!addressStr) return 'نامشخص';
  const text = addressStr.toLowerCase();
  
  if (text.includes('china') || text.includes('چین')) return 'چین (China)';
  if (text.includes('india') || text.includes('هند')) return 'هند (India)';
  if (text.includes('germany') || text.includes('آلمان')) return 'آلمان (Germany)';
  if (text.includes('iran') || text.includes('tehran') || text.includes('ایران')) return 'ایران (Iran)';
  if (text.includes('italy') || text.includes('ایتالیا')) return 'ایتالیا (Italy)';
  if (text.includes('spain') || text.includes('اسپانیا')) return 'اسپانیا (Spain)';
  if (text.includes('france') || text.includes('فرانسه')) return 'فرانسه (France)';
  if (text.includes('uk') || text.includes('united kingdom') || text.includes('انگلیس')) return 'انگلستان (UK)';
  if (text.includes('usa') || text.includes('united states') || text.includes('آمریکا')) return 'آمریکا (USA)';
  if (text.includes('switzerland') || text.includes('سوئیس')) return 'سوئیس (Switzerland)';
  if (text.includes('japan') || text.includes('ژاپن')) return 'ژاپن (Japan)';
  if (text.includes('korea') || text.includes('کره')) return 'کره جنوبی (South Korea)';
  if (text.includes('turkey') || text.includes('ترکیه')) return 'ترکیه (Turkey)';
  if (text.includes('uae') || text.includes('emirates') || text.includes('امارات')) return 'امارات (UAE)';
  if (text.includes('taiwan') || text.includes('تایوان')) return 'تایوان (Taiwan)';
  if (text.includes('saudi') || text.includes('عربستان')) return 'عربستان (Saudi Arabia)';
  if (text.includes('austria') || text.includes('اتریش')) return 'اتریش (Austria)';
  if (text.includes('thailand') || text.includes('تایلند')) return 'تایلند (Thailand)';
  if (text.includes('ireland') || text.includes('ایرلند')) return 'ایرلند (Ireland)';

  return 'نامشخص';
};

export const getDisplayCountry = (vendor: Vendor): string => {
  if (vendor.country && vendor.country !== 'نامشخص' && vendor.country !== 'مشخص نشده') {
    return vendor.country;
  }
  const extracted = extractCountry(vendor.contactInfo);
  if (extracted !== 'نامشخص') {
    return extracted;
  }
  return vendor.contactInfo || 'نامشخص';
};

export let CALCULATION_WEIGHTS = {
  commercial: 0.2,
  qa: 0.4,
  planning: 0.1,
  finance: 0.3
};

export const setCalculationWeights = (newWeights: any) => {
  if (newWeights) {
    CALCULATION_WEIGHTS = { ...CALCULATION_WEIGHTS, ...newWeights };
  }
};

export function calculateOverallScore(scores: Scores | null, forceCalculate: boolean = false) {
  if (!scores) return null;
  const values = [scores.commercial || 0, scores.qa || 0, scores.planning || 0, scores.finance || 0];
  const hasAnyScore = values.some(v => v > 0);
  const isFullyScored = values.every(v => v > 0);
  
  if (!hasAnyScore) return 0;
  if (!isFullyScored && !forceCalculate) return null;
  
  return Math.round(
    ((scores.commercial || 0) * CALCULATION_WEIGHTS.commercial) +
    ((scores.qa || 0) * CALCULATION_WEIGHTS.qa) +
    ((scores.planning || 0) * CALCULATION_WEIGHTS.planning) +
    ((scores.finance || 0) * CALCULATION_WEIGHTS.finance)
  );
}
