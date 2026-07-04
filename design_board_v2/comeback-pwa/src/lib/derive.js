// Derived-value helpers — pure, used by the onboarding screens.

export function calcAge(dob) {
  const { d, m, y } = dob || {};
  if (!d || !m || !y || String(y).length !== 4) return null;
  const birth = new Date(+y, +m - 1, +d);
  if (isNaN(birth)) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const md = now.getMonth() - birth.getMonth();
  if (md < 0 || (md === 0 && now.getDate() < birth.getDate())) age--;
  return age > 0 && age < 120 ? age : null;
}

export function calcBMI(heightCm, weightKg) {
  const h = parseFloat(heightCm), w = parseFloat(weightKg);
  if (!h || !w) return null;
  const m = h / 100;
  const bmi = w / (m * m);
  if (!isFinite(bmi) || bmi < 8 || bmi > 90) return null;
  return Math.round(bmi * 10) / 10;
}

// Returns { label, tone } where tone ∈ green | amber | red
export function bmiBand(bmi) {
  if (bmi == null) return null;
  if (bmi < 18.5) return { label: 'Underweight', tone: 'amber' };
  if (bmi < 25)   return { label: 'Healthy', tone: 'green' };
  if (bmi < 30)   return { label: 'Overweight', tone: 'amber' };
  return { label: 'Obese', tone: 'red' };
}

// Field-level validators -> error string | null
export const limits = {
  heightCm: [100, 230],
  weightKg: [30, 250],
};
export function validateNum(field, value) {
  if (value === '' || value == null) return null; // empty handled by required logic
  const n = parseFloat(value);
  const [lo, hi] = limits[field] || [];
  if (lo == null) return null;
  if (isNaN(n) || n < lo || n > hi) return `Enter a value between ${lo} and ${hi}`;
  return null;
}
