import { getPGs } from "./api";

export async function fetchPGs(params = {}) {
  const query = {
    city: params.city || "",
    area: params.area || "",
    ...(params.min_budget !== "" && params.min_budget != null ? { min_budget: params.min_budget } : {}),
    ...(params.max_budget !== "" && params.max_budget != null ? { max_budget: params.max_budget } : {}),
    gender: params.gender || "",
    amenity: params.amenity || [],
    sharing: params.sharing || "",
    beds_required: params.beds_required || 1,
    page: params.page || 1,
    page_size: params.page_size || 10,
  };

  return await getPGs(query);
}
