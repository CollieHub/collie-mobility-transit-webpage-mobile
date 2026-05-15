// Auto-generated: Stop name -> Geo coordinates mapping
// Source: KML "Recorridos 2025" from Google Maps
// Manually cross-referenced with Excel timetable stop names

export interface StopGeo {
  lat: number | null;
  lng: number | null;
}

export const stopGeoIndex: Record<string, StopGeo> = {
  "B° BOSCH": {
    "lat": -34.1389207,
    "lng": -59.0073585
  },
  "Centro T RAWSON": {
    "lat": -34.1074141,
    "lng": -59.0275728
  },
  "PLAZA ITALIA": {
    "lat": -34.1008954,
    "lng": -59.0185858
  },
  "ESTACION": {
    "lat": -34.0977137,
    "lng": -59.0376357
  },
  "HOSPITAL": {
    "lat": -34.0838231,
    "lng": -59.0340123
  },
  "PUERTO PANAL": {
    "lat": -34.0706931,
    "lng": -59.1480057
  },
  "LIMA": {
    "lat": -34.0423737,
    "lng": -59.1948845
  },
  "QUIRNO y PASO": {
    "lat": null,
    "lng": null
  },
  "AVELL y RIVADA": {
    "lat": -34.0961002,
    "lng": -59.0259819
  },
  "ESCALADA": {
    "lat": -34.1543972,
    "lng": -59.1165937
  },
  "YPF Lavalle 2400": {
    "lat": -34.1181134,
    "lng": -59.0198643
  },
  "ESPAÑA y LINTRIDIS": {
    "lat": -34.104223,
    "lng": -59.0652599
  },
  "EL CASCO": {
    "lat": -34.1261701,
    "lng": -59.0855158
  },
  "LOS CEIBOS": {
    "lat": -34.129464,
    "lng": -59.0568031
  },
  "BURGAR": {
    "lat": null,
    "lng": null
  },
  "PINTO y C6": {
    "lat": -34.11242,
    "lng": -59.0418738
  },
  "PACHECO Y J.LIMA": {
    "lat": -34.1116001,
    "lng": -59.0126717
  },
  "J.LIMA y LAPRIDA": {
    "lat": -34.1100959,
    "lng": -59.0138022
  },
  "S.MART y BELGRANO": {
    "lat": -34.0954964,
    "lng": -59.0225441
  },
  "T.NK": {
    "lat": -34.119333,
    "lng": -59.0163141
  },
  "TERMINAL NK": {
    "lat": -34.119333,
    "lng": -59.0163141
  },
  "AVELL Y RIVADA": {
    "lat": -34.0961002,
    "lng": -59.0259819
  },
  "AVELLANEDA Y RIVADAVIA": {
    "lat": -34.0961002,
    "lng": -59.0259819
  },
  "ALEM Y DORREGO": {
    "lat": -34.1081244,
    "lng": -59.0182063
  },
  "J.LIMA Y DORREGO": {
    "lat": -34.1070668,
    "lng": -59.0162552
  },
  "BOLÍVAR Y AVELL": {
    "lat": -34.0953046,
    "lng": -59.0264905
  },
  "PAGOLA y G.PAZ": {
    "lat": -34.0941359,
    "lng": -59.0261527
  },
  "CEMENTERIO": {
    "lat": null,
    "lng": null
  },
  "B.ESPAÑA": {
    "lat": -34.0998619,
    "lng": -59.0568556
  },
  "VIAL": {
    "lat": null,
    "lng": null
  },
  "BROWN y AMEGHINO": {
    "lat": -34.1000171,
    "lng": -59.0229905
  },
  "RIVAD y BROWN": {
    "lat": -34.0961822,
    "lng": -59.0259658
  },
  "VILLA NEGRI": {
    "lat": -34.1230822,
    "lng": -59.0562085
  },
  "B.METEOR": {
    "lat": -34.0798358,
    "lng": -59.0483331
  },
  "CGT RAWSON": {
    "lat": -34.1074141,
    "lng": -59.0275728
  },
  "TALA y FP": {
    "lat": null,
    "lng": null
  },
  "MALVICINO": {
    "lat": -34.1183958,
    "lng": -59.0359356
  },
  "CGC": {
    "lat": -34.145322,
    "lng": -59.0341642
  }
};

// Fuzzy lookup for Excel stop names
export function findStopGeo(excelName: string): StopGeo | null {
  const normalized = excelName.trim().toUpperCase();
  
  // Direct match
  for (const [key, val] of Object.entries(stopGeoIndex)) {
    if (key.toUpperCase() === normalized) return val;
  }
  
  // Partial match
  for (const [key, val] of Object.entries(stopGeoIndex)) {
    if (normalized.includes(key.toUpperCase()) || key.toUpperCase().includes(normalized)) {
      return val;
    }
  }
  
  return null;
}
