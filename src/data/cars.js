// src/data/cars.js
import alphard from '../assets/cars/alphard-old.jpg';
import alphardHev from '../assets/cars/alphard-hev.jpg';
import pajero from '../assets/cars/pajero.jpg';
import avanza from '../assets/cars/avanza.png';
import hiace from '../assets/cars/hiace.jpg';
import hiaceP from '../assets/cars/hiace-premio.jpg';
import fortuner from '../assets/cars/fortuner.jpg';
import innova from '../assets/cars/innova-zenix.jpg';

export const cars = [
  {
    id: 'avanza',
    name: 'Toyota Avanza',
    category: 'MPV',
    seats: 7,
    image: avanza,
    pricePerDay: 350000,
    priceWithDriver: 500000,
    description: 'MPV keluarga yang nyaman dan ekonomis. Cocok untuk perjalanan keluarga dalam kota maupun luar kota.',
    features: ['AC Double Blower', '7 Penumpang', 'BBM Bensin', 'Bagasi Luas'],
    popular: true,
    tag: 'Terlaris'
  },
  {
    id: 'innova-zenix',
    name: 'Toyota Innova Zenix',
    category: 'MPV Premium',
    seats: 7,
    image: innova,
    pricePerDay: 600000,
    priceWithDriver: 750000,
    description: 'MPV premium generasi terbaru dengan teknologi hybrid. Perpaduan kenyamanan dan efisiensi bahan bakar.',
    features: ['Hybrid Technology', '7 Penumpang', 'Panoramic Roof', 'ADAS Safety'],
    popular: true,
    tag: 'Terbaru'
  },
  {
    id: 'fortuner',
    name: 'Toyota Fortuner',
    category: 'SUV',
    seats: 7,
    image: fortuner,
    pricePerDay: 750000,
    priceWithDriver: 950000,
    description: 'SUV tangguh dengan penampilan gagah. Siap menemani perjalanan di berbagai medan jalan.',
    features: ['4x4 AWD', '7 Penumpang', 'Terrain Select', 'Apple CarPlay'],
    popular: false,
    tag: null
  },
  {
    id: 'pajero',
    name: 'Mitsubishi Pajero Sport',
    category: 'SUV',
    seats: 7,
    image: pajero,
    pricePerDay: 750000,
    priceWithDriver: 950000,
    description: 'SUV premium Mitsubishi dengan desain sporty. Sempurna untuk petualangan maupun perjalanan bisnis.',
    features: ['Super Select 4WD', '7 Penumpang', 'Mi-Pilot', 'Sunroof'],
    popular: false,
    tag: null
  },
  {
    id: 'alphard',
    name: 'Toyota Alphard',
    category: 'Luxury MPV',
    seats: 7,
    image: alphard,
    pricePerDay: 1500000,
    priceWithDriver: 1800000,
    description: 'Luxury MPV premium pilihan para eksekutif. Kabin mewah dengan kursi captain seat yang sangat nyaman.',
    features: ['Captain Seat', 'Rear Entertainment', 'Power Door', 'Sunroof'],
    popular: true,
    tag: 'Premium'
  },
  {
    id: 'alphard-hev',
    name: 'Toyota Alphard HEV',
    category: 'Luxury Hybrid',
    seats: 7,
    image: alphardHev,
    pricePerDay: 2000000,
    priceWithDriver: 2400000,
    description: 'Alphard Hybrid terbaru - puncak kemewahan dengan teknologi electrified. Perjalanan paling prestisius.',
    features: ['Hybrid Engine', 'Lounge Seat', 'TNGA Platform', 'JBL Premium Audio'],
    popular: false,
    tag: 'Eksklusif'
  },
  {
    id: 'hiace',
    name: 'Toyota Hiace',
    category: 'Minibus',
    seats: 12,
    image: hiace,
    pricePerDay: 700000,
    priceWithDriver: 900000,
    description: 'Minibus andalan untuk rombongan. Kapasitas besar dan kabin lega, ideal untuk perjalanan wisata grup.',
    features: ['12 Penumpang', 'AC Powerful', 'Bagasi Besar', 'Sopir Berpengalaman'],
    popular: false,
    tag: null
  },
  {
    id: 'hiace-premio',
    name: 'Toyota Hiace Premio',
    category: 'Luxury Minibus',
    seats: 10,
    image: hiaceP,
    pricePerDay: 1000000,
    priceWithDriver: 1300000,
    description: 'Hiace Premium untuk perjalanan rombongan VIP. Kursi premium dengan legroom ekstra dan AC double blower.',
    features: ['10 Penumpang VIP', 'Kursi Recline', 'LCD Entertainment', 'Double AC'],
    popular: false,
    tag: 'VIP'
  }
];

export const formatPrice = (price) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};
