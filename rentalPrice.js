// shorten, unuseful x, get functions apart,
// shorten, unuseful x, get functions apart,
// shorten, unuseful x, get functions apart,

const Car_Classes = {
  COMPACT: 'Compact',
  ELECTRIC: 'Electric',
  CABRIO: 'Cabrio',
  RACER: 'Racer',
};

const Age_Limits = {
  MIN_AGE: 18,
  COMPACT_MAX_AGE: 21,
  RACER_YOUNG_MAX_AGE: 25,
};

const License_Years = {
  MIN_LICENSE_YEAR: 1,
  SURCHARGE_2_YEARS: 2,
  SURCHARGE_3_YEARS: 3,
};

const Seasons = {
  LOW: 'Low',
  HIGH: 'High',
  LOW_MONTHS: [0, 1, 2, 10], // nov(10)-march(2)
  HIGH_START_MONTH: 3, // arpril
  HIGH_END_MONTH: 9, // oktober
};

const Pricing = {
  HIGH_SEASON_MULTIPLIER: 1.15,
  RACER_YOUNG_MULTIPLIER: 1.5,
  LONG_RENTAL_DISCOUNT: 0.9,
  LICENSE_2_YEARS_MULTIPLIER: 1.3,
  LICENSE_3_YEARS_HIGH_SEASON_ADD: 15,
};

const calculateDays = (pickupDate, dropoffDate) => {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const firstDate = new Date(pickupDate);
  const secondDate = new Date(dropoffDate);
  return Math.round(Math.abs(firstDate - secondDate) / oneDay);
};

const getSeason = (pickupDate, dropoffDate) => {
  const pickup = new Date(pickupDate);
  const dropoff = new Date(dropoffDate);
  const pickupMonth = pickup.getMonth();
  const dropoffMonth = dropoff.getMonth();

  const isLowSeason =
    Seasons.LOW_MONTHS.includes(pickupMonth) ||
    Seasons.LOW_MONTHS.includes(dropoffMonth);

  return isLowSeason ? Seasons.LOW : Seasons.HIGH;
};

const getLicenseYears = (licenseDate) => {
  const today = new Date();
  const license = new Date(licenseDate);
  return Math.floor((today - license) / (365.25 * 24 * 60 * 60 * 1000));
};

const validateAge = (age, carClass) => {
  if (age < Age_Limits.MIN_AGE) {
    return `Driver too young (${age}) - cannot quote the price`;
  }
  if (age <= Age_Limits.COMPACT_MAX_AGE && carClass !== Car_Classes.COMPACT) {
    return `Drivers ${Age_Limits.COMPACT_MAX_AGE} yo or less can only rent ${Car_Classes.COMPACT} vehicles`;
  }
  return null;
};

//  Individuals holding a driver's license for less than a year are
//      ineligible to rent.
const validateLicense = (isLicense, licenseDate) => {
  if (!isLicense) {
    return "No driver's license provided";
  }
  const years = getLicenseYears(licenseDate);
  if (years < License_Years.MIN_LICENSE_YEAR) {
    return "Too recent driver's license - ineligible to rent a car";
  }
  return null;
};

const calculatePrice = (
  pickupDate,
  dropoffDate,
  type,
  age,
  isLicense,
  licenseDate
) => {
  const carClass = getCarClass(type);
  const days = calculateDays(pickupDate, dropoffDate);
  const season = getSeason(pickupDate, dropoffDate);

  // Validatsions
  const ageError = validateAge(age, carClass);
  if (ageError) return ageError;

  const licenseError = validateLicense(isLicense, licenseDate);
  if (licenseError) return licenseError;

  let dailyPrice = age;
  let totalPrice = dailyPrice * days;

  // Base mods
  if (
    carClass === Car_Classes.RACER &&
    age <= Age_Limits.RACER_YOUNG_MAX_AGE &&
    season === Seasons.HIGH
  ) {
    totalPrice *= Pricing.RACER_YOUNG_MULTIPLIER;
  }
  if (season === Seasons.HIGH) {
    totalPrice *= Pricing.HIGH_SEASON_MULTIPLIER;
  }
  if (days > 10 && season === Seasons.LOW) {
    totalPrice *= Pricing.LONG_RENTAL_DISCOUNT;
  }

  // Driving experience
  //  If the driver's license has been held for less than
  //    two years, the rental price is increased by 30%.
  //    three years, then an additional 15 euros will be added to the daily rental price during high season.
  const licenseYears = getLicenseYears(licenseDate);
  if (licenseYears < License_Years.SURCHARGE_2_YEARS) {
    totalPrice *= Pricing.LICENSE_2_YEARS_MULTIPLIER;
  }
  if (
    licenseYears < License_Years.SURCHARGE_3_YEARS &&
    season === Seasons.HIGH
  ) {
    totalPrice += Pricing.LICENSE_3_YEARS_HIGH_SEASON_ADD * days;
  }

  const minPrice = age * days;
  return Math.max(totalPrice, minPrice);
};

const getCarClass = (type) => {
  return Car_Classes[type] || 'Unknown';
};

exports.price = calculatePrice;
exports.getSeason = getSeason; // for tests
