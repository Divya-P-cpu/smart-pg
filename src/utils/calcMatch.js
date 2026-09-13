import { FL } from './constants';

function normalizeText(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function asNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function hasAmenity(amenities, requiredAmenity) {
  const required = normalizeText(requiredAmenity);
  if (!required) return false;

  return amenities.some((amenity) => {
    const available = normalizeText(amenity);
    if (!available) return false;
    if (required === 'wi fi' || required === 'wifi') {
      return available.includes('wi fi') || available.includes('wifi') || available.includes('internet');
    }
    if (required === 'hot water' || required === 'geyser') {
      return available.includes('geyser') || available.includes('hot water');
    }
    if (required === 'food') {
      return available.includes('food') || available.includes('meal');
    }
    return available.includes(required) || required.includes(available);
  });
}

function genderMatches(pgGender, userGender) {
  const pg = normalizeText(pgGender);
  const requested = normalizeText(userGender);
  if (!requested) return true;
  if (!pg) return false;
  if (pg.includes('unisex') || pg.includes('co ed')) return true;
  if (requested.includes('female')) return pg.includes('female') || pg.includes('women') || pg.includes('womens');
  if (requested.includes('male')) return (pg.includes('male') || pg.includes('men') || pg.includes('mens')) && !pg.includes('female') && !pg.includes('women');
  return pg.includes(requested);
}

function getDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return null;
  }
  const earthRadiusKm = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((earthRadiusKm * c).toFixed(1));
}

function countAvailableBeds(pg) {
  const directCount = asNumber(pg.available_bed_count, 0);
  if (directCount > 0) return directCount;

  if (!Array.isArray(pg.rooms)) return 0;

  return pg.rooms.reduce((total, room) => {
    const beds = Array.isArray(room.beds) ? room.beds : [];
    return total + beds.filter((bed) => {
      const status = normalizeText(bed.status || bed.current_status);
      return status === 'available';
    }).length;
  }, 0);
}

function makeFactor(key, label, score, detail, matched) {
  return {
    key,
    label,
    score: Math.max(0, Math.min(100, Math.round(score))),
    detail,
    matched
  };
}

function weightedAverage(factors, weights) {
  let weightedTotal = 0;
  let weightTotal = 0;

  factors.forEach((item) => {
    const weight = weights[item.key] || 1;
    weightedTotal += item.score * weight;
    weightTotal += weight;
  });

  return weightTotal ? Math.round(weightedTotal / weightTotal) : 0;
}

function locationScore(baseScore, distance) {
  if (typeof distance !== 'number') return baseScore;
  if (distance <= 1) return Math.min(100, baseScore + 8);
  if (distance <= 2.5) return Math.min(98, baseScore + 3);
  if (distance <= 5) return Math.max(45, baseScore - 7);
  if (distance <= 9) return Math.max(30, baseScore - 18);
  return Math.max(18, baseScore - 32);
}

function budgetScore(rent, minBudget, maxBudget) {
  if (!rent || !maxBudget) return rent ? 74 : 35;
  if (minBudget && rent < minBudget) {
    const belowRatio = Math.min(1, (minBudget - rent) / Math.max(minBudget, 1));
    return 76 + (1 - belowRatio) * 10;
  }
  if (rent <= maxBudget) {
    const range = Math.max(maxBudget - minBudget, maxBudget || 1);
    const comfort = Math.max(0, Math.min(1, (maxBudget - rent) / range));
    return 84 + comfort * 14;
  }
  const overRatio = (rent - maxBudget) / Math.max(maxBudget, 1);
  if (overRatio <= 0.1) return 62 + (0.1 - overRatio) * 80;
  if (overRatio <= 0.25) return 48;
  return 28;
}

function availabilityScore(availableBeds, people, matchingRooms) {
  if (availableBeds <= 0) return 0;
  if (availableBeds < people) return 55;
  const surplus = availableBeds - people;
  const roomBonus = Math.min(6, Math.max(0, matchingRooms - 1) * 2);
  return Math.min(100, 82 + Math.min(12, surplus * 4) + roomBonus);
}

export function calcMatch(pg, u = {}) {
  const reasons = [];
  const warnings = [];
  const pgName = pg.pg_name || pg.name || 'This PG';
  const factors = [];

  const dynamicDistance = getDistance(pg.latitude, pg.longitude, u.lat, u.lng) ?? pg.distance ?? null;
  if (dynamicDistance !== null) {
    pg.distance = dynamicDistance;
  }

  const requestedArea = normalizeText(u.area).split(' hyderabad')[0].split(' bangalore')[0].trim();
  const pgArea = normalizeText(pg.area);
  const requestedCity = normalizeText(u.city);
  const pgCity = normalizeText(pg.city);

  if (requestedArea) {
    if (pgArea.includes(requestedArea)) {
      const score = locationScore(90, pg.distance);
      factors.push(makeFactor('location', 'Location', score, `Area matches your preference: ${pg.area}${typeof pg.distance === 'number' ? ` · ${pg.distance} km from your selected hub` : ''}`, true));
      reasons.push(`${pgName} is in your selected area: ${pg.area}`);
    } else if (requestedCity && pgCity.includes(requestedCity)) {
      const score = locationScore(62, pg.distance);
      factors.push(makeFactor('location', 'Location', score, `Same city, but area is ${pg.area || 'not specified'}${typeof pg.distance === 'number' ? ` · ${pg.distance} km away` : ''}`, false));
      warnings.push(`Area differs from your preference (${u.area})`);
    } else {
      const score = locationScore(25, pg.distance);
      factors.push(makeFactor('location', 'Location', score, `Located in ${pg.area || 'another area'}${typeof pg.distance === 'number' ? ` · ${pg.distance} km away` : ''}`, false));
      warnings.push(`Not in your preferred area (${u.area})`);
    }
  } else {
    factors.push(makeFactor('location', 'Location', locationScore(pg.area ? 75 : 45, pg.distance), pg.area ? `Located in ${pg.area}${typeof pg.distance === 'number' ? ` · ${pg.distance} km from your selected hub` : ''}` : 'Area data is not available', Boolean(pg.area)));
  }

  const rentVal = asNumber(pg.rent || pg.selected_rent || pg.min_rent, 0);
  const budgetMin = asNumber(u.budgetMin, 0);
  const budgetMax = asNumber(u.budgetMax, 0);

  if (rentVal > 0 && budgetMax > 0) {
    const score = budgetScore(rentVal, budgetMin, budgetMax);
    const aboveBudgetLimit = Math.round(budgetMax * 1.1);
    if (rentVal >= budgetMin && rentVal <= budgetMax) {
      factors.push(makeFactor('budget', 'Budget', score, `Rent ₹${rentVal.toLocaleString('en-IN')} is within your ₹${budgetMax.toLocaleString('en-IN')} budget`, true));
      reasons.push(`Rent fits your budget: ₹${rentVal.toLocaleString('en-IN')}/month`);
    } else if (rentVal <= aboveBudgetLimit) {
      factors.push(makeFactor('budget', 'Budget', score, `Rent ₹${rentVal.toLocaleString('en-IN')} is slightly above your budget`, false));
      warnings.push(`Slightly above your max budget of ₹${budgetMax.toLocaleString('en-IN')}`);
    } else {
      factors.push(makeFactor('budget', 'Budget', score, `Rent ₹${rentVal.toLocaleString('en-IN')} is above your budget`, false));
      warnings.push(`Above your max budget of ₹${budgetMax.toLocaleString('en-IN')}`);
    }
  } else if (rentVal > 0) {
    factors.push(makeFactor('budget', 'Budget', 75, `Monthly rent is ₹${rentVal.toLocaleString('en-IN')}`, true));
    reasons.push(`Monthly rent: ₹${rentVal.toLocaleString('en-IN')}`);
  } else {
    factors.push(makeFactor('budget', 'Budget', 35, 'Rent data is not available', false));
    warnings.push('Rent data is missing for this PG');
  }

  const requestedSharing = asNumber(u.sharing, 0);
  const rawSharingStr = String(pg.selected_sharing || pg.sharing || pg.capacity || "");
  const digits = rawSharingStr.match(/\d+/)?.[0];
  const pgSharingNumber = digits ? parseInt(digits, 10) : asNumber(pg.sharing, 0);
  const pgSharingLabel = pg.selected_sharing || (pgSharingNumber ? `${pgSharingNumber} Sharing` : '');

  if (requestedSharing && pgSharingNumber) {
    if (requestedSharing === pgSharingNumber) {
      factors.push(makeFactor('sharing', 'Sharing', 100, `${requestedSharing} sharing matches your selection`, true));
      reasons.push(`Matches your preferred ${requestedSharing} sharing room`);
    } else {
      factors.push(makeFactor('sharing', 'Sharing', 20, `This listing is ${pgSharingLabel || `${pgSharingNumber} sharing`}`, false));
      warnings.push(`Does not match preferred ${requestedSharing} sharing`);
    }
  } else {
    factors.push(makeFactor('sharing', 'Sharing', pgSharingNumber ? 88 : 60, pgSharingLabel ? `Available as ${pgSharingLabel}` : 'Sharing type is not listed', Boolean(pgSharingNumber)));
  }

  if (u.gender) {
    if (genderMatches(pg.gender_policy, u.gender)) {
      factors.push(makeFactor('gender', 'Gender', 100, `${pg.gender_policy || 'PG'} eligibility matches ${u.gender}`, true));
      reasons.push(`${pg.gender_policy || 'Gender policy'} matches ${u.gender}`);
    } else {
      factors.push(makeFactor('gender', 'Gender', 0, `${pg.gender_policy || 'PG policy'} does not match ${u.gender}`, false));
      warnings.push(`${pg.gender_policy || 'Gender policy'} does not match ${u.gender}`);
    }
  } else {
    factors.push(makeFactor('gender', 'Gender', 80, pg.gender_policy ? `${pg.gender_policy} listing` : 'No gender preference selected', true));
  }

  const availableBeds = countAvailableBeds(pg);
  const people = Math.max(1, asNumber(u.people, 1));
  const matchingRoomCount = asNumber(pg.matching_room_count || pg.rooms?.length, 0);

  if (availableBeds >= people) {
    factors.push(makeFactor('roomBed', 'Room/Bed', availabilityScore(availableBeds, people, matchingRoomCount), `${availableBeds} bed${availableBeds === 1 ? '' : 's'} available${matchingRoomCount ? ` in ${matchingRoomCount} matching room${matchingRoomCount === 1 ? '' : 's'}` : ''}`, true));
    reasons.push(`${availableBeds} bed${availableBeds === 1 ? '' : 's'} available for your requirement`);
  } else if (availableBeds > 0) {
    factors.push(makeFactor('roomBed', 'Room/Bed', availabilityScore(availableBeds, people, matchingRoomCount), `Only ${availableBeds} bed${availableBeds === 1 ? '' : 's'} currently available`, false));
    warnings.push(`Only ${availableBeds} bed${availableBeds === 1 ? '' : 's'} available`);
  } else {
    factors.push(makeFactor('roomBed', 'Room/Bed', 0, 'No available bed found for this requirement', false));
    warnings.push('No available bed found for this match');
  }

  const moveInLabel = u.moveIn ? `for ${u.moveIn}` : 'currently';
  if (availableBeds > 0) {
    factors.push(makeFactor('moveIn', 'Move-in', Math.min(96, availabilityScore(availableBeds, people, matchingRoomCount) + 4), `Beds are available ${moveInLabel}`, true));
    if (u.moveIn) reasons.push(`Move-in looks possible on ${u.moveIn}`);
  } else {
    factors.push(makeFactor('moveIn', 'Move-in', 20, `No available bed ${moveInLabel}`, false));
    if (u.moveIn) warnings.push(`Move-in availability is not confirmed for ${u.moveIn}`);
  }

  const facilitiesList = pg.facilities || pg.amenities || [];
  const requiredFacilities = Array.isArray(u.facilities) ? u.facilities.filter(Boolean) : [];
  const matchedFacilities = requiredFacilities.filter((facility) => hasAmenity(facilitiesList, facility));
  const missingFacilities = requiredFacilities.filter((facility) => !hasAmenity(facilitiesList, facility));

  if (requiredFacilities.length > 0) {
    const amenityScore = (matchedFacilities.length / requiredFacilities.length) * 100;
    const matchedText = matchedFacilities.slice(0, 3).map((facility) => FL[facility] || facility).join(', ');
    const missingText = missingFacilities.slice(0, 2).map((facility) => FL[facility] || facility).join(', ');

    factors.push(makeFactor(
      'amenities',
      'Amenities',
      amenityScore,
      matchedFacilities.length
        ? `${matchedFacilities.length}/${requiredFacilities.length} preferred amenities matched${matchedText ? `: ${matchedText}` : ''}`
        : 'None of your preferred amenities are listed',
      matchedFacilities.length === requiredFacilities.length
    ));

    if (matchedText) reasons.push(`Matched amenities: ${matchedText}`);
    if (missingText) warnings.push(`Missing preferred amenities: ${missingText}`);
  } else {
    const visibleAmenities = facilitiesList.slice(0, 3).map((facility) => FL[facility] || facility).join(', ');
    factors.push(makeFactor('amenities', 'Amenities', facilitiesList.length ? 78 : 45, visibleAmenities ? `Listed amenities include ${visibleAmenities}` : 'No amenities listed', facilitiesList.length > 0));
    if (visibleAmenities) reasons.push(`Amenities available: ${visibleAmenities}`);
  }

  if (typeof pg.distance === 'number') {
    if (pg.distance <= 1.5) {
      reasons.push(`Short commute: ${pg.distance} km from your selected hub`);
    } else if (pg.distance <= 4.0) {
      reasons.push(`${pg.distance} km commute from your selected hub`);
    }
  }

  if (pg.verified) {
    reasons.push('Verified property with security');
  }
  if (pg.rating && pg.rating >= 4.0) {
    reasons.push(`Highly rated: ${pg.rating} stars`);
  }

  const weights = {
    location: 1.35,
    budget: 1.25,
    sharing: 1.2,
    gender: 1.15,
    roomBed: 1.35,
    amenities: 1,
    moveIn: 0.7
  };
  const percentage = Math.max(1, Math.min(99, weightedAverage(factors, weights)));

  const fallbackReasons = factors
    .filter((item) => item.score >= 70)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.detail);

  const fallbackWarnings = factors
    .filter((item) => item.score < 70)
    .sort((a, b) => a.score - b.score)
    .map((item) => item.detail);

  return {
    score: percentage,
    reasons: Array.from(new Set([...reasons, ...fallbackReasons])).slice(0, 5),
    warnings: Array.from(new Set([...warnings, ...fallbackWarnings])).slice(0, 5),
    compatibility: {
      percentage,
      factors
    }
  };
}
