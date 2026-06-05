"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  APIProvider,
  Map,
  Marker,
  useMapsLibrary,
  type MapMouseEvent,
} from "@vis.gl/react-google-maps";

interface Props {
  apiKey: string;
  onAddressChange: (address: string, lat: number, lng: number) => void;
  initialValue?: string;
}

const DEFAULT_CENTER = { lat: -33.4489, lng: -70.6693 }; // Santiago
const MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#09090b" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#71717a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#09090b" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#27272a" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#020617" }] },
];

// ── Sub-componente que usa las libs de Maps (debe estar dentro de APIProvider) ──
function PickerInner({
  onAddressChange,
  initialValue = "",
}: Pick<Props, "onAddressChange" | "initialValue">) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
  const [status, setStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [addressValue, setAddressValue] = useState(initialValue);

  const placesLib = useMapsLibrary("places");
  const geocodingLib = useMapsLibrary("geocoding");

  // Inicializar Places Autocomplete cuando la lib esté cargada
  useEffect(() => {
    if (!placesLib || !inputRef.current) return;

    const ac = new placesLib.Autocomplete(inputRef.current, { types: ["address"] });
    ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      const loc = place.geometry?.location;
      if (loc && place.formatted_address) {
        const lat = loc.lat();
        const lng = loc.lng();
        setPin({ lat, lng });
        setStatus("valid");
        setAddressValue(place.formatted_address);
        onAddressChange(place.formatted_address, lat, lng);
      } else {
        setStatus("invalid");
      }
    });
  }, [placesLib, onAddressChange]);

  // Click en el mapa → geocodificación inversa
  async function handleMapClick(e: MapMouseEvent) {
    const latLng = e.detail.latLng;
    if (!latLng || !geocodingLib) return;
    const { lat, lng } = latLng;

    setPin({ lat, lng });
    try {
      const geocoder = new geocodingLib.Geocoder();
      const result = await geocoder.geocode({ location: { lat, lng } });
      const addr = result.results[0]?.formatted_address ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setAddressValue(addr);
      setStatus("valid");
      onAddressChange(addr, lat, lng);
      if (inputRef.current) inputRef.current.value = addr;
    } catch {
      setStatus("invalid");
    }
  }

  // Validar dirección escrita manualmente al perder el foco
  async function handleBlur() {
    const val = inputRef.current?.value?.trim() ?? "";
    if (!val || !geocodingLib) return;
    setStatus("idle");
    try {
      const geocoder = new geocodingLib.Geocoder();
      const result = await geocoder.geocode({ address: val });
      const loc = result.results[0]?.geometry.location;
      if (loc) {
        const lat = loc.lat();
        const lng = loc.lng();
        const formatted = result.results[0].formatted_address;
        setPin({ lat, lng });
        setAddressValue(formatted);
        setStatus("valid");
        onAddressChange(formatted, lat, lng);
      } else {
        setStatus("invalid");
      }
    } catch {
      setStatus("invalid");
    }
  }

  return (
    <div className="space-y-2">
      {/* Input de dirección con autocomplete */}
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <input
          ref={inputRef}
          name="direccion"
          required
          placeholder="Escribe o haz clic en el mapa"
          defaultValue={initialValue}
          onBlur={handleBlur}
          className={`w-full bg-zinc-950/80 border rounded-xl pl-9 pr-9 py-3 text-sm text-white outline-none transition-all focus:ring-2 ${
            status === "valid"
              ? "border-emerald-500/50 focus:ring-emerald-500/20"
              : status === "invalid"
              ? "border-rose-500/50 focus:ring-rose-500/20"
              : "border-white/[0.04] focus:ring-amber-500/30 focus:border-amber-500/50"
          }`}
        />
        {status === "valid" && (
          <CheckCircle2 className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
        )}
        {status === "invalid" && (
          <AlertCircle className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-400" />
        )}
      </div>

      {status === "invalid" && (
        <p className="text-xs text-rose-400 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> Dirección no encontrada. Intenta ser más específico.
        </p>
      )}

      {/* Mini mapa interactivo */}
      <div className="h-48 w-full overflow-hidden rounded-xl border border-white/[0.04]">
        <Map
          defaultCenter={DEFAULT_CENTER}
          center={pin ?? undefined}
          defaultZoom={11}
          zoom={pin ? 15 : undefined}
          gestureHandling="greedy"
          disableDefaultUI
          onClick={handleMapClick}
          className="h-full w-full"
          styles={MAP_STYLES}
        >
          {pin && <Marker position={pin} />}
        </Map>
      </div>

      <p className="text-[11px] text-zinc-500 text-center">
        {pin ? "Pin fijado. Puedes ajustarlo haciendo clic en otro punto." : "Haz clic en el mapa o escribe una dirección para fijar el pin."}
      </p>
    </div>
  );
}

// ── Componente público — envuelve en APIProvider ──────────────────────────────
export function AddressPickerMap({ apiKey, onAddressChange, initialValue = "" }: Props) {
  if (!apiKey) {
    return (
      <input
        name="direccion"
        required
        placeholder="Av. Providencia 1234, Santiago"
        defaultValue={initialValue}
        className="w-full bg-zinc-950/80 border border-white/[0.04] rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 outline-none"
      />
    );
  }

  return (
    <APIProvider apiKey={apiKey} libraries={["places", "geocoding"]}>
      <PickerInner onAddressChange={onAddressChange} initialValue={initialValue} />
    </APIProvider>
  );
}
