import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState, useCallback, useEffect } from 'react';
import { Search, MapPin, Navigation } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSearchLocation } from '../hooks/useGeocoding';

// FIX: Leaflet marker icon issue in Webpack/Vite
// @ts-expect-error - Leaflet internal icon handling
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationMapProps {
  initialCenter?: [number, number]; // [lat, lng]
  onLocationSelect?: (coords: [number, number]) => void;
  markers?: { position: [number, number]; label: string }[];
  isPicker?: boolean;
  className?: string;
}

function LocationPicker({ onSelect }: { onSelect: (coords: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      onSelect([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

// Sub-component to handle map centering/zooming
function MapViewHandler({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 16);
  }, [center, map]);
  return null;
}

export default function LocationMap({
  initialCenter = [21.0125, 105.5255], // Default FPTU Hanoi
  onLocationSelect,
  markers = [],
  isPicker = false,
  className = "h-[400px] w-full rounded-2xl overflow-hidden border border-slate-100 shadow-sm"
}: LocationMapProps) {
  const [pickedLocation, setPickedLocation] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(initialCenter);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: searchResults } = useSearchLocation(searchQuery);

  const handlePick = useCallback((coords: [number, number]) => {
    if (isPicker) {
      setPickedLocation(coords);
      onLocationSelect?.(coords);
    }
  }, [isPicker, onLocationSelect]);

  const handleSearchResultClick = (lat: string, lon: string) => {
     const coords: [number, number] = [parseFloat(lat), parseFloat(lon)];
     setMapCenter(coords);
     handlePick(coords);
     setSearchQuery("");
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Search Bar UI Overlay */}
      {isPicker && (
        <div className="absolute top-4 right-4 z-[1001] w-full max-w-[320px]">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={16} />
              <Input 
                placeholder="Tìm địa điểm (ví dụ: Kim Mã, Hà Nội)..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 w-full pl-10 pr-4 bg-white border-slate-200 rounded-2xl text-sm font-bold shadow-xl focus:ring-4 focus:ring-teal-500/10 transition-all border-none ring-1 ring-slate-100"
              />
              
              {/* Search Results Dropdown */}
              {searchQuery.length >= 3 && searchResults && searchResults.length > 0 && (
                <div className="absolute top-14 left-0 right-0 bg-white border border-slate-100 rounded-2xl p-2 shadow-2xl max-h-[300px] overflow-y-auto z-10 animate-in fade-in slide-in-from-top-2 duration-300">
                   {searchResults.map((result) => (
                     <button
                        key={result.place_id}
                        onClick={() => handleSearchResultClick(result.lat, result.lon)}
                        className="w-full text-left p-3 hover:bg-slate-50 rounded-xl flex items-start gap-3 transition-colors group/item"
                     >
                        <MapPin size={14} className="mt-1 text-slate-400 group-hover/item:text-teal-500 transition-colors shrink-0" />
                        <span className="text-xs font-bold text-slate-700 leading-tight">{result.display_name}</span>
                     </button>
                   ))}
                </div>
              )}
           </div>
        </div>
      )}

      {/* Button to show current focus location or pan back */}
      <button 
        onClick={() => setMapCenter(initialCenter)}
        className="absolute bottom-6 right-6 z-[1000] h-10 w-10 bg-white rounded-xl shadow-lg border border-slate-100 flex items-center justify-center text-slate-400 hover:text-teal-500 hover:scale-105 transition-all active:scale-95"
      >
        <Navigation size={18} />
      </button>

      <MapContainer 
        center={mapCenter} 
        zoom={15} 
        scrollWheelZoom={true} 
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapViewHandler center={mapCenter} />
        
        {markers.map((marker, idx) => (
          <Marker key={idx} position={marker.position}>
            <Popup>
              <span className="font-bold text-slate-800">{marker.label}</span>
            </Popup>
          </Marker>
        ))}

        {pickedLocation && (
          <Marker position={pickedLocation}>
            <Popup>Vị trí đã chọn</Popup>
          </Marker>
        )}

        {isPicker && <LocationPicker onSelect={handlePick} />}
      </MapContainer>
    </div>
  );
}
