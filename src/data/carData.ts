export interface SupercarModel {
  id: string;
  name: string;
  subtitle: string;
  badge: string;
  basePrice: number;
  engine: string;
  power: string;
  torque: string;
  acceleration: string;
  topSpeed: string;
  weight: string;
  downforce: string;
  primaryImage: string;
  scissorDoorsImage: string;
  interiorImage: string;
  engineImage: string;
  description: string;
  doorsType: string;
  accentColor: string;
}

export const SUPERCAR_MODELS: SupercarModel[] = [
  {
    id: 'svj',
    name: 'Spettacolo SVJ',
    subtitle: '6.5L Naturally Aspirated V12',
    badge: 'Flagship Superveloce',
    basePrice: 517770,
    engine: '6,498 cc 60° V12 NA',
    power: '770 CV (759 HP) @ 8,500 RPM',
    torque: '720 Nm @ 6,750 RPM',
    acceleration: '2.8 sec (0-100 km/h)',
    topSpeed: '> 352 km/h (219 mph)',
    weight: '1,525 kg (Dry)',
    downforce: '490 kg @ 300 km/h',
    primaryImage: '/src/assets/images/aventador_svj_frame27_1790265181205.jpg',
    scissorDoorsImage: '/src/assets/images/supercar_scissor_doors_1790264565645.jpg',
    interiorImage: '/src/assets/images/supercar_cockpit_interior_1790264577730.jpg',
    engineImage: '/src/assets/images/supercar_v12_engine_1790264590707.jpg',
    description: 'The pinnacle of naturally aspirated Italian engineering with patented ALA 2.0 active aerodynamics, upward-opening scissor doors, and an intoxicating 8,500 RPM soundtrack.',
    doorsType: 'Bespoke Scissor Kinematics (Upward)',
    accentColor: '#ff5500',
  },
  {
    id: 'sto',
    name: 'Spettacolo STO',
    subtitle: '5.2L High-Revving V10',
    badge: 'Super Trofeo Omologata',
    basePrice: 334500,
    engine: '5,204 cc 90° V10 NA',
    power: '640 CV (631 HP) @ 8,000 RPM',
    torque: '565 Nm @ 6,500 RPM',
    acceleration: '3.0 sec (0-100 km/h)',
    topSpeed: '310 km/h (193 mph)',
    weight: '1,339 kg (Dry)',
    downforce: '420 kg @ 280 km/h',
    primaryImage: '/src/assets/images/supercar_sto_blue_1790265138339.jpg',
    scissorDoorsImage: '/src/assets/images/supercar_sto_blue_1790265138339.jpg',
    interiorImage: '/src/assets/images/supercar_cockpit_interior_1790264577730.jpg',
    engineImage: '/src/assets/images/supercar_v12_engine_1790264590707.jpg',
    description: 'Track-homologated road racer featuring an integrated roof snorkel, aerodynamic shark fin, lightweight carbon Cofango hood, and rear-wheel drive agility.',
    doorsType: 'Lightweight Carbon Conventional',
    accentColor: '#0284c7',
  },
];

export const PAINT_COLORS = [
  { name: 'Arancio Atlas', hex: '#f95700', price: 0, tag: 'Signature Video' },
  { name: 'Giallo Orion', hex: '#f59e0b', price: 0, tag: 'Iconic Pearl' },
  { name: 'Verde Mantis', hex: '#22c55e', price: 4200, tag: 'Sportivo' },
  { name: 'Blu Laufey', hex: '#0284c7', price: 6800, tag: 'Corsa' },
  { name: 'Rosso Mars', hex: '#ef4444', price: 4200, tag: 'Racing' },
  { name: 'Nero Nemesis', hex: '#18181b', price: 9500, tag: 'Satin Matte' },
  { name: 'Grigio Telesto', hex: '#64748b', price: 8200, tag: 'Gloss Grey' },
  { name: 'Bianco Monocerus', hex: '#f8fafc', price: 3800, tag: 'Pure Pearl' },
];

export const CALIPER_COLORS = [
  { name: 'Arancio Borealis', hex: '#f97316', price: 0 },
  { name: 'Giallo Hyper', hex: '#eab308', price: 1200 },
  { name: 'Rosso Corsa', hex: '#dc2626', price: 1200 },
  { name: 'Nero Gloss', hex: '#09090b', price: 800 },
  { name: 'Verde Scandal', hex: '#84cc16', price: 1600 },
];
