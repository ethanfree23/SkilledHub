import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { colors, radii } from '../theme';

export type MapMarker = {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  pinColor?: string;
};

function regionForMarkers(markers: MapMarker[]): Region {
  if (markers.length === 0) {
    return { latitude: 31.0, longitude: -100.0, latitudeDelta: 8, longitudeDelta: 8 };
  }
  if (markers.length === 1) {
    return {
      latitude: markers[0].latitude,
      longitude: markers[0].longitude,
      latitudeDelta: 0.15,
      longitudeDelta: 0.15,
    };
  }
  let minLat = markers[0].latitude;
  let maxLat = markers[0].latitude;
  let minLng = markers[0].longitude;
  let maxLng = markers[0].longitude;
  for (const m of markers) {
    minLat = Math.min(minLat, m.latitude);
    maxLat = Math.max(maxLat, m.latitude);
    minLng = Math.min(minLng, m.longitude);
    maxLng = Math.max(maxLng, m.longitude);
  }
  const midLat = (minLat + maxLat) / 2;
  const midLng = (minLng + maxLng) / 2;
  const latDelta = Math.max((maxLat - minLat) * 1.4, 0.08);
  const lngDelta = Math.max((maxLng - minLng) * 1.4, 0.08);
  return { latitude: midLat, longitude: midLng, latitudeDelta: latDelta, longitudeDelta: lngDelta };
}

function regionForRadius(centerLat: number, centerLng: number, miles: number): Region {
  const latDelta = miles / 69;
  const lngDelta = miles / (Math.max(0.2, Math.cos((centerLat * Math.PI) / 180)) * 69);
  return {
    latitude: centerLat,
    longitude: centerLng,
    latitudeDelta: Math.max(0.2, latDelta * 2),
    longitudeDelta: Math.max(0.2, lngDelta * 2),
  };
}

type Props = {
  markers: MapMarker[];
  height?: number;
  emptyHint?: string;
  initialCenter?: { latitude: number; longitude: number } | null;
};

export function MapJobsPreview({ markers, height = 200, emptyHint, initialCenter }: Props) {
  const computedRegion = useMemo(() => {
    if (initialCenter) {
      return regionForRadius(initialCenter.latitude, initialCenter.longitude, 30);
    }
    return regionForMarkers(markers);
  }, [initialCenter, markers]);
  const [region, setRegion] = useState<Region>(computedRegion);

  useEffect(() => {
    setRegion(computedRegion);
  }, [computedRegion]);

  if (markers.length === 0) {
    return (
      <View style={[styles.fallback, { minHeight: height }]}>
        <Text style={styles.hint}>{emptyHint || 'No map pins — add addresses or open jobs with coordinates.'}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.wrap, { height }]}>
      <MapView style={StyleSheet.absoluteFill} region={region}>
        {markers.map((m) => (
          <Marker
            key={m.id}
            coordinate={{ latitude: m.latitude, longitude: m.longitude }}
            title={m.title}
            description={m.description}
            pinColor={m.pinColor}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  fallback: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgElevated,
    justifyContent: 'center',
    padding: 16,
    marginBottom: 12,
  },
  hint: { color: colors.muted, fontSize: 14, textAlign: 'center' },
});
