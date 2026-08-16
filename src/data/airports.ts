export interface Airport {
  code: string;
  city: string;
  name: string;
  lat: number;
  lon: number;
}

export const AIRPORTS: Airport[] = [
  { code: "BLR", city: "Bengaluru", name: "Kempegowda International", lat: 13.1986, lon: 77.7066 },
  { code: "JAI", city: "Jaipur", name: "Jaipur International", lat: 26.8242, lon: 75.8122 },
  { code: "DEL", city: "Delhi", name: "Indira Gandhi International", lat: 28.5562, lon: 77.1 },
  { code: "BOM", city: "Mumbai", name: "Chhatrapati Shivaji Maharaj International", lat: 19.0896, lon: 72.8656 },
  { code: "GOI", city: "Goa", name: "Manohar International", lat: 15.3808, lon: 73.8314 },
  { code: "COK", city: "Kochi", name: "Cochin International", lat: 10.152, lon: 76.4019 },
  { code: "HYD", city: "Hyderabad", name: "Rajiv Gandhi International", lat: 17.2403, lon: 78.4294 },
  { code: "CCU", city: "Kolkata", name: "Netaji Subhas Chandra Bose International", lat: 22.6547, lon: 88.4467 },
  { code: "PNQ", city: "Pune", name: "Pune Airport", lat: 18.5822, lon: 73.9197 },
  { code: "IXC", city: "Chandigarh", name: "Chandigarh Airport", lat: 30.6735, lon: 76.7885 },
  { code: "ATQ", city: "Amritsar", name: "Sri Guru Ram Dass Jee International", lat: 31.7096, lon: 74.7973 },
  { code: "GAU", city: "Guwahati", name: "Lokpriya Gopinath Bordoloi International", lat: 26.1061, lon: 91.5859 },
];

export function findAirport(code: string): Airport {
  const airport = AIRPORTS.find((a) => a.code === code);
  if (!airport) throw new Error(`Unknown airport code: ${code}`);
  return airport;
}
