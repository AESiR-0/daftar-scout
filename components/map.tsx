import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";

// Custom Leaflet marker icon using online URLs
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapComponentProps {
  coordinates: [number, number] | null;
}

export default function MapComponent({ coordinates }: MapComponentProps) {
  return (
    typeof window !== "undefined" ? (
      <MapContainer
        center={coordinates || [20, 0]}
        zoom={coordinates ? 12 : 2}
        style={{ height: "100%", width: "100%", zIndex: 2 }}
        key={coordinates ? coordinates.join(",") : "default"}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {coordinates && (
          <Marker position={coordinates} icon={customIcon} />
        )}
      </MapContainer>
    ) : (
      <div className="w-full h-[400px] bg-muted flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading map...</p>
      </div>
    )
  );
} 