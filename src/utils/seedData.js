import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase/config'

const staticCars = [
  {
    name: 'Toyota Avanza',
    category: 'MPV',
    seats: 7,
    imageUrl: '',
    pricePerDay: 350000,
    priceWithDriver: 500000,
    description: 'MPV keluarga yang nyaman dan ekonomis. Cocok untuk perjalanan keluarga dalam kota maupun luar kota.',
    features: ['AC Double Blower', '7 Penumpang', 'BBM Bensin', 'Bagasi Luas'],
    popular: true,
    tag: 'Terlaris'
  },
  {
    name: 'Toyota Innova Zenix',
    category: 'MPV Premium',
    seats: 7,
    imageUrl: '',
    pricePerDay: 600000,
    priceWithDriver: 750000,
    description: 'MPV premium generasi terbaru dengan teknologi hybrid. Perpaduan kenyamanan dan efisiensi bahan bakar.',
    features: ['Hybrid Technology', '7 Penumpang', 'Panoramic Roof', 'ADAS Safety'],
    popular: true,
    tag: 'Terbaru'
  },
  {
    name: 'Toyota Fortuner',
    category: 'SUV',
    seats: 7,
    imageUrl: '',
    pricePerDay: 750000,
    priceWithDriver: 950000,
    description: 'SUV tangguh dengan penampilan gagah. Siap menemani perjalanan di berbagai medan jalan.',
    features: ['4x4 AWD', '7 Penumpang', 'Terrain Select', 'Apple CarPlay'],
    popular: false,
    tag: ''
  },
  {
    name: 'Mitsubishi Pajero Sport',
    category: 'SUV',
    seats: 7,
    imageUrl: '',
    pricePerDay: 750000,
    priceWithDriver: 950000,
    description: 'SUV premium Mitsubishi dengan desain sporty. Sempurna untuk petualangan maupun perjalanan bisnis.',
    features: ['Super Select 4WD', '7 Penumpang', 'Mi-Pilot', 'Sunroof'],
    popular: false,
    tag: ''
  },
  {
    name: 'Toyota Alphard',
    category: 'Luxury MPV',
    seats: 7,
    imageUrl: '',
    pricePerDay: 1500000,
    priceWithDriver: 1800000,
    description: 'Luxury MPV premium pilihan para eksekutif. Kabin mewah dengan kursi captain seat yang sangat nyaman.',
    features: ['Captain Seat', 'Rear Entertainment', 'Power Door', 'Sunroof'],
    popular: true,
    tag: 'Premium'
  },
  {
    name: 'Toyota Alphard HEV',
    category: 'Luxury Hybrid',
    seats: 7,
    imageUrl: '',
    pricePerDay: 2000000,
    priceWithDriver: 2400000,
    description: 'Alphard Hybrid terbaru - puncak kemewahan dengan teknologi electrified. Perjalanan paling prestisius.',
    features: ['Hybrid Engine', 'Lounge Seat', 'TNGA Platform', 'JBL Premium Audio'],
    popular: false,
    tag: 'Eksklusif'
  },
  {
    name: 'Toyota Hiace',
    category: 'Minibus',
    seats: 12,
    imageUrl: '',
    pricePerDay: 700000,
    priceWithDriver: 900000,
    description: 'Minibus andalan untuk rombongan. Kapasitas besar dan kabin lega, ideal untuk perjalanan wisata grup.',
    features: ['12 Penumpang', 'AC Powerful', 'Bagasi Besar', 'Sopir Berpengalaman'],
    popular: false,
    tag: ''
  },
  {
    name: 'Toyota Hiace Premio',
    category: 'Luxury Minibus',
    seats: 10,
    imageUrl: '',
    pricePerDay: 1000000,
    priceWithDriver: 1300000,
    description: 'Hiace Premium untuk perjalanan rombongan VIP. Kursi premium dengan legroom ekstra dan AC double blower.',
    features: ['10 Penumpang VIP', 'Kursi Recline', 'LCD Entertainment', 'Double AC'],
    popular: false,
    tag: 'VIP'
  }
]

export const seedCarsToFirebase = async () => {
  try {
    // Hapus semua data armada yang ada di Firebase
    const existingCars = await getDocs(query(collection(db, 'cars'), orderBy('createdAt', 'desc')))
    const deletePromises = existingCars.docs.map(d => deleteDoc(doc(db, 'cars', d.id)))
    await Promise.all(deletePromises)
    console.log('Deleted existing cars')

    // Tambah semua data armada baru
    for (const car of staticCars) {
      await addDoc(collection(db, 'cars'), {
        ...car,
        createdAt: new Date()
      })
      console.log('Added:', car.name)
    }

    console.log('All cars seeded successfully!')
    return { success: true, count: staticCars.length }
  } catch (error) {
    console.error('Error seeding cars:', error)
    return { success: false, error: error.message }
  }
}

export const getStaticCars = () => staticCars