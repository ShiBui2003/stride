// Renders a neon accent dot at the user's current GPS position on the map
'use client';

import { useEffect, useRef } from 'react';

interface UserLocationDotProps {
  map: google.maps.Map;
  position: google.maps.LatLngLiteral;
}

export function UserLocationDot({ map, position }: UserLocationDotProps): null {
  const dotRef = useRef<google.maps.Marker | null>(null);
  const ringRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    const latLng = new google.maps.LatLng(position.lat, position.lng);

    if (!dotRef.current) {
      // Outer pulse ring — larger, semi-transparent neon
      ringRef.current = new google.maps.Marker({
        map,
        position: latLng,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 18,
          fillColor: '#C8FF00',
          fillOpacity: 0.15,
          strokeColor: '#C8FF00',
          strokeOpacity: 0.4,
          strokeWeight: 1.5,
        },
        zIndex: 98,
        clickable: false,
      });
      // Inner solid dot
      dotRef.current = new google.maps.Marker({
        map,
        position: latLng,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#C8FF00',
          fillOpacity: 1,
          strokeColor: '#0A0A0A',
          strokeWeight: 3,
        },
        zIndex: 99,
        clickable: false,
        title: 'Your location',
      });
    } else {
      dotRef.current.setPosition(latLng);
      ringRef.current?.setPosition(latLng);
    }
  }, [map, position]);

  // Remove markers when component unmounts
  useEffect(() => {
    return () => {
      dotRef.current?.setMap(null);
      ringRef.current?.setMap(null);
      dotRef.current = null;
      ringRef.current = null;
    };
  }, []);

  return null;
}
