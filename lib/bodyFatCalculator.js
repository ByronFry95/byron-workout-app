/**
 * Calculate body fat percentage using the Navy Body Fat Formula (Standard)
 * For men: BF% = 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
 * For women: BF% = 495 / (1.29579 - 0.35004 * log10(waist + hip - neck) + 0.22100 * log10(height)) - 450
 * 
 * @param {number} height - Height in cm
 * @param {number} waist - Waist circumference in cm
 * @param {number} neck - Neck circumference in cm
 * @param {number} hip - Hip circumference in cm (optional, for women)
 * @param {string} gender - 'male' or 'female'
 * @returns {number} Body fat percentage
 */
export function calculateBodyFatNavy(height, waist, neck, hip = 0, gender = 'male') {
  // Convert to inches if needed (formula works with inches)
  // Actually, formula works with cm for measurements
  
  if (gender.toLowerCase() === 'male') {
    // Male formula
    const log10Value = Math.log10(waist - neck)
    const heightLog = Math.log10(height)
    const bodyDensity = 1.0324 - 0.19077 * log10Value + 0.15456 * heightLog
    const bodyFat = 495 / bodyDensity - 450
    return Math.round(bodyFat * 10) / 10 // Round to 1 decimal place
  } else {
    // Female formula
    const log10Value = Math.log10(waist + hip - neck)
    const heightLog = Math.log10(height)
    const bodyDensity = 1.29579 - 0.35004 * log10Value + 0.22100 * heightLog
    const bodyFat = 495 / bodyDensity - 450
    return Math.round(bodyFat * 10) / 10
  }
}

/**
 * Get body fat category based on percentage
 */
export function getBodyFatCategory(bodyFatPercentage, gender = 'male') {
  if (gender.toLowerCase() === 'male') {
    if (bodyFatPercentage < 6) return 'Essential Fat'
    if (bodyFatPercentage < 13) return 'Athletes'
    if (bodyFatPercentage < 17) return 'Fitness'
    if (bodyFatPercentage < 24) return 'Average'
    return 'Obese'
  } else {
    if (bodyFatPercentage < 13) return 'Essential Fat'
    if (bodyFatPercentage < 20) return 'Athletes'
    if (bodyFatPercentage < 24) return 'Fitness'
    if (bodyFatPercentage < 31) return 'Average'
    return 'Obese'
  }
}
