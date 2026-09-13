export function getMinimumRent(pg) {
  if (pg?.min_rent === null || pg?.min_rent === undefined) {
    return null;
  }

  return Number(pg.min_rent);
}

export function formatRent(pg) {
  const rent = getMinimumRent(pg);

  if (rent === null || Number.isNaN(rent)) {
    return "Rent not available";
  }

  return `₹${rent.toLocaleString("en-IN")}/month`;
}

export function getLocation(pg) {
  const parts = [pg?.area, pg?.city].filter(Boolean);

  return parts.length > 0
    ? parts.join(", ")
    : "Location not available";
}

export function getAmenities(pg) {
  return Array.isArray(pg?.amenities) ? pg.amenities : [];
}

export function getGenderPolicy(pg) {
  return pg?.gender_policy || "Not specified";
}