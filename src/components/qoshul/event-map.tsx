import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import type { QoshulEvent } from '@/lib/qoshul/data';
import { directionsUrl } from '@/lib/qoshul/rules';

const icon = (label: string) => L.divIcon({ className: 'map-pin', html: `<span>${label}</span>`, iconSize: [34, 34], iconAnchor: [17, 34], popupAnchor: [0, -30] });

function Recenter({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap();
  useEffect(() => { map.setView([lat, lng], zoom); }, [lat, lng, zoom, map]);
  return null;
}

export default function EventMap({ events, center, me, zoom = 13, onPick }: { events: QoshulEvent[]; center: { lat: number; lng: number }; me?: { lat: number; lng: number } | null; zoom?: number; onPick?: (p: { lat: number; lng: number }) => void }) {
  return (
    <MapContainer center={[center.lat, center.lng]} zoom={zoom} className="event-map" scrollWheelZoom={false}>
      <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Recenter lat={center.lat} lng={center.lng} zoom={zoom} />
      {onPick && <PickHandler onPick={onPick} />}
      {me && <CircleMarker center={[me.lat, me.lng]} radius={9} pathOptions={{ color: '#16a34a', fillColor: '#16a34a', fillOpacity: 0.6 }} />}
      {events.map(e => (
        <Marker key={e.id} position={[e.lat, e.lng]} icon={icon(e.category.slice(0, 2))}>
          <Popup>
            <strong>{e.title}</strong><br />{e.location}<br />{e.date}, {e.time} · {e.distance} km<br />
            <a href={directionsUrl(e.lat, e.lng)} target="_blank" rel="noopener noreferrer">Google Maps-də yol göstər</a><br />
            <a href={`https://waze.com/ul?ll=${e.lat},${e.lng}&navigate=yes`} target="_blank" rel="noopener noreferrer">Waze ilə get</a>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

function PickHandler({ onPick }: { onPick: (p: { lat: number; lng: number }) => void }) {
  const map = useMap();
  useEffect(() => { const h = (ev: L.LeafletMouseEvent) => onPick({ lat: ev.latlng.lat, lng: ev.latlng.lng }); map.on('click', h); return () => { map.off('click', h); }; }, [map, onPick]);
  return null;
}
