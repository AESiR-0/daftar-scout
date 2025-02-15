import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import "leaflet/dist/leaflet.css";

// Fix marker icon issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
});

function ChangeView({ coordinates }: { coordinates: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    if (coordinates) {
      map.setView(coordinates, 13);
    }
  }, [coordinates, map]);

  return null;
}

export default function MapComponent({ 
  coordinates,
  height = "400px"
}: { 
  coordinates: [number, number] | null,
  height?: string
}) {
  const defaultPosition: [number, number] = [20.5937, 78.9629]; // Center of India

  return (
    <MapContainer
      center={coordinates || defaultPosition}
      zoom={coordinates ? 13 : 4}
      style={{ height, width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {coordinates && (
        <>
          <Marker position={coordinates} />
          <ChangeView coordinates={coordinates} />
        </>
      )}
    </MapContainer>
  );
} 