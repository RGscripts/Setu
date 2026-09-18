import { Circle, GoogleMap, OverlayView, useJsApiLoader } from "@react-google-maps/api";
import { classificationMeta, type District } from "../../data/mockDistricts";

type Props = {
  districts: District[];
  selectedId: string;
  onSelect: (district: District) => void;
};

const center = { lat: 26.1, lng: 80.9 };
const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  gestureHandling: "cooperative",
  styles: [
    { featureType: "poi", stylers: [{ visibility: "off" }] },
    { featureType: "transit", stylers: [{ visibility: "off" }] },
    { featureType: "administrative", elementType: "labels", stylers: [{ visibility: "simplified" }] }
  ]
};

export function ReconciledMap({ districts, selectedId, onSelect }: Props) {
  const { isLoaded, loadError } = useJsApiLoader({ googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "" });

  if (loadError) return <MapFallback message="Map key could not load. Check VITE_GOOGLE_MAPS_API_KEY." />;
  if (!isLoaded) return <MapFallback message="Loading map..." />;

  return (
    <GoogleMap
      mapContainerClassName="h-[320px] w-full rounded-md"
      center={center}
      zoom={7}
      options={mapOptions}
      onLoad={(map) => fitDistrictBounds(map, districts)}
    >
      {districts.map((district) => {
        const meta = classificationMeta[district.classification];
        return (
          <Circle
            key={district.id}
            center={{ lat: district.lat, lng: district.lng }}
            radius={52000}
            onClick={() => onSelect(district)}
            options={{
              fillColor: meta.color,
              fillOpacity: selectedId === district.id ? 0.66 : 0.46,
              strokeColor: meta.color,
              strokeOpacity: 0.95,
              strokeWeight: selectedId === district.id ? 4 : 2,
              clickable: true
            }}
          />
        );
      })}
      {districts.map((district) => {
        const meta = classificationMeta[district.classification];
        return (
          <OverlayView key={`${district.id}-label`} position={{ lat: district.lat, lng: district.lng }} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
            <button
              type="button"
              onClick={() => onSelect(district)}
              className="-translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-slate-900 shadow-md ring-1 ring-slate-300 transition hover:bg-slate-50 hover:ring-slate-900"
              title={`${district.name}: ${meta.shortLabel}`}
            >
              {district.name}
            </button>
          </OverlayView>
        );
      })}
    </GoogleMap>
  );
}

function fitDistrictBounds(map: google.maps.Map, districts: District[]) {
  const bounds = new google.maps.LatLngBounds();
  districts.forEach((district) => bounds.extend({ lat: district.lat, lng: district.lng }));
  map.fitBounds(bounds, 72);
}

function MapFallback({ message }: { message: string }) {
  return <div className="flex h-[320px] items-center justify-center rounded-md border border-[var(--color-border)] bg-slate-50 text-sm text-[var(--color-text-muted)]">{message}</div>;
}
