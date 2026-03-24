import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Nominatim API responses have varied structures, but we focus on these
export interface NominatimAddress {
  house_number?: string;
  road?: string;
  suburb?: string;
  quarter?: string;
  neighbourhood?: string;
  city_district?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  village?: string;
  town?: string;
}

export interface NominatimResponse {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: NominatimAddress;
  boundingbox: string[];
}

export interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

/**
 * Maps Nominatim address fields to our project's address schema
 */
const mapAddressToLocal = (address: NominatimAddress, displayName: string) => {
  // Province selection: state or city
  const province = address.state || address.city || "";
  
  // District selection: county or city_district
  const district = address.city_district || address.town || "";
  
  // Ward selection: suburb, village, or quarter
  const ward = address.suburb || address.village || address.quarter || address.neighbourhood || "";
  
  // Street selection: road + house_number
  const street = address.road ? (address.house_number ? `${address.house_number} ${address.road}` : address.road) : "";

  return {
    province,
    district,
    ward,
    street,
    fullAddress: displayName,
  };
};

/**
 * Hook to resolve address from coordinates (Reverse Geocoding)
 */
export const useReverseGeocode = (lat: number | undefined, lon: number | undefined) => {
  return useQuery({
    queryKey: ["geocoding", "reverse", lat, lon],
    queryFn: async () => {
      if (lat === undefined || lon === undefined) return null;
      
      const response = await axios.get<NominatimResponse>(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1&accept-language=vi`
      );
      
      const data = response.data;
      return mapAddressToLocal(data.address, data.display_name);
    },
    enabled: !!lat && !!lon,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

/**
 * Hook to search locations by query string (Forward Geocoding)
 */
export const useSearchLocation = (query: string) => {
  return useQuery({
    queryKey: ["geocoding", "search", query],
    queryFn: async () => {
      if (!query || query.length < 3) return [];
      
      const response = await axios.get<SearchResult[]>(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=vi`
      );
      
      return response.data;
    },
    enabled: query.length >= 3,
  });
};
