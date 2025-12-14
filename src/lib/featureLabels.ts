// src/lib/featureLabels.ts
// Human-readable display names for MEPS variable codes
// PRESENTATION-LAYER ONLY — do NOT use to rename actual data keys

export const FEATURE_LABELS: Record<string, string> = {
  // Behavior Features
  PHYEXE53: "Exercise Frequency",
  OFTSMK53: "Smoking Frequency",

  // Mental Health Features
  RTHLTH53: "Self-Rated Physical Health",
  MNHLTH53: "Self-Rated Mental Health",
  K6SUM42: "Distress Score (K6)",
  PHQ242: "Depression Score (PHQ-2)",

  // Functional Limitation Features
  WLKLIM53: "Walking Limitation",
  ACTLIM53: "Activity Limitation",
  SOCLIM53: "Social Limitation",
  COGLIM53: "Cognitive Limitation",
  LIMIT_CT: "Limitation Count",

  // Chronic Condition Features
  DIABDX_M18: "Diabetes Diagnosis",
  HIBPDX: "Hypertension Diagnosis",
  CHDDX: "Heart Disease Diagnosis",
  ASTHDX: "Asthma Diagnosis",
  ARTHDX: "Arthritis Diagnosis",
  CHRONIC_CT: "Chronic Condition Count",

  // Label-Defining Variables (descriptive only)
  TOTEXP23: "Total Expenditure",
  ERTOT23: "ER Visits",
  IPDIS23: "Inpatient Discharges",
  TOTEXP22: "Prior-Year Expenditure",
  ERTOT22: "Prior-Year ER Visits",
  OBTOT23: "Outpatient Visits",
  RXTOT23: "Rx Fills",

  // Demographics / SES
  AGE: "Age",
  SEX: "Sex",
  RACETHX: "Race / Ethnicity",
  POVCAT23: "Income Category",
  INSURC23: "Insurance Coverage",
  DUPERSID: "Member ID",
};

/**
 * Returns a human-readable label for a MEPS variable code.
 * Falls back to the original code if no mapping exists.
 */
export function getFeatureLabel(code: string): string {
  return FEATURE_LABELS[code] ?? code;
}

/**
 * Returns display text with both human label and MEPS code for tooltips.
 * Example: "Exercise Frequency (PHYEXE53)"
 */
export function getFeatureLabelWithCode(code: string): string {
  const label = FEATURE_LABELS[code];
  if (label) {
    return `${label} (${code})`;
  }
  return code;
}
