import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { FoodListing } from '../types';

interface InteractiveMapProps {
  listings: FoodListing[];
  selectedListing?: FoodListing | null;
  onSelectListing: (listing: FoodListing) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  listings,
  selectedListing,
  onSelectListing,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create Leaflet map centered at Metropolis / Manhattan
    const map = L.map(mapContainerRef.current, {
      center: [40.7300, -73.9950],
      zoom: 13,
      zoomControl: true,
      attributionControl: false,
    });

    // Clean OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    markersGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers when listings change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    const getPinColor = (category: string) => {
      switch (category) {
        case 'cooked_meals':
          return '#e11d48'; // Rose
        case 'bakery_pastries':
          return '#d97706'; // Amber
        case 'fresh_produce':
          return '#059669'; // Emerald
        case 'dairy_chilled':
          return '#2563eb'; // Blue
        case 'packaged_pantry':
          return '#7c3aed'; // Purple
        default:
          return '#0d9488'; // Teal
      }
    };

    const getCategoryEmoji = (category: string) => {
      switch (category) {
        case 'cooked_meals':
          return '🍲';
        case 'bakery_pastries':
          return '🥖';
        case 'fresh_produce':
          return '🍎';
        case 'dairy_chilled':
          return '🥛';
        case 'packaged_pantry':
          return '🥫';
        case 'beverages':
          return '🧃';
        default:
          return '🥗';
      }
    };

    listings.forEach((listing) => {
      const color = getPinColor(listing.category);
      const emoji = getCategoryEmoji(listing.category);
      const isSelected = selectedListing?.id === listing.id;

      // Custom HTML Marker Icon
      const customIcon = L.divIcon({
        className: 'custom-food-marker',
        html: `
          <div style="
            background: ${isSelected ? '#0f172a' : color};
            color: white;
            border: 2px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            border-radius: 9999px;
            width: ${isSelected ? '38px' : '32px'};
            height: ${isSelected ? '38px' : '32px'};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${isSelected ? '18px' : '15px'};
            cursor: pointer;
            transition: all 0.2s ease;
          ">
            ${emoji}
          </div>
        `,
        iconSize: isSelected ? [38, 38] : [32, 32],
        iconAnchor: isSelected ? [19, 19] : [16, 16],
      });

      const marker = L.marker([listing.latitude, listing.longitude], {
        icon: customIcon,
      });

      const popupContent = `
        <div style="font-family: inherit; font-size: 12px; max-width: 200px; padding: 2px;">
          <p style="font-size: 10px; font-weight: 700; color: ${color}; text-transform: uppercase; margin-bottom: 2px;">
            ${listing.category.replace('_', ' ')}
          </p>
          <strong style="color: #0f172a; font-size: 13px; display: block; line-height: 1.2; margin-bottom: 4px;">
            ${listing.title}
          </strong>
          <p style="color: #475569; margin-bottom: 4px;">
            <strong>${listing.quantity} ${listing.unit}</strong> (~${listing.estimated_meals} meals)
          </p>
          <p style="color: #64748b; font-size: 11px; margin-bottom: 6px;">
            📍 ${listing.donor?.org_name || listing.pickup_address}
          </p>
          <button id="claim-btn-${listing.id}" style="
            background: #059669;
            color: white;
            font-weight: 600;
            padding: 4px 10px;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            width: 100%;
          ">
            View / Request
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`claim-btn-${listing.id}`);
        if (btn) {
          btn.onclick = () => onSelectListing(listing);
        }
      });

      marker.on('click', () => {
        onSelectListing(listing);
      });

      markersGroup.addLayer(marker);
    });

    // Pan to selected listing if any
    if (selectedListing) {
      map.setView([selectedListing.latitude, selectedListing.longitude], 14, {
        animate: true,
      });
    }
  }, [listings, selectedListing, onSelectListing]);

  return (
    <div className="relative w-full h-[400px] md:h-[520px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm z-10">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200/80 shadow-md text-[11px] text-slate-700 space-y-1">
        <p className="font-bold text-[10px] text-slate-500 uppercase tracking-wider">Map Legend</p>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">🍲 Cooked Meals</span>
          <span className="flex items-center gap-1">🥖 Bakery</span>
          <span className="flex items-center gap-1">🍎 Produce</span>
          <span className="flex items-center gap-1">🥛 Dairy</span>
        </div>
      </div>
    </div>
  );
};
