// Demo data for the Road vertical. Source: transport-SaaS supabase/seed/demo.sql (read-only).
// Fictional companies and addresses only.

export type DeliveryStatus = 'submitted' | 'pending' | 'error';

export interface RoadDelivery {
  id: string;
  recipient: string;
  city: string;
  weightKg: number | null;
  cost: number | null;
  status: DeliveryStatus;
  daysAgo: number;
  error?: string;
}

export const ROAD_DELIVERIES: RoadDelivery[] = [
  { id: 'DA-13001', recipient: 'ΑΦΟΙ ΔΟΚΙΜΟΠΟΥΛΟΙ Α.Ε.', city: 'Πειραιάς', weightKg: 86.5, cost: 38, status: 'submitted', daysAgo: 13 },
  { id: 'DA-12001', recipient: 'ΤΕΧΝΟΔΟΜΗ ΜΑΡΟΥΣΙ Α.Ε.', city: 'Μαρούσι', weightKg: 44.2, cost: 32, status: 'submitted', daysAgo: 12 },
  { id: 'DA-11002', recipient: 'ΑΧΑΡΝΑΙ ΜΕΤΑΛΛΙΚΑ', city: 'Αχαρνές', weightKg: 980, cost: 95, status: 'submitted', daysAgo: 11 },
  { id: 'DA-10001', recipient: 'LOGISTICS ΑΣΠΡΟΠΥΡΓΟΥ Α.Ε.', city: 'Ασπρόπυργος', weightKg: 145.6, cost: 78, status: 'submitted', daysAgo: 10 },
  { id: 'DA-09001', recipient: 'ΝΕΑ ΙΩΝΙΑ ΕΝΔΥΣΗ Ο.Ε.', city: 'Νέα Ιωνία', weightKg: 38.4, cost: 41, status: 'error', daysAgo: 9, error: 'Το ΑΦΜ παραλήπτη δεν βρέθηκε στο μητρώο της ΑΑΔΕ.' },
  { id: 'DA-08002', recipient: 'ΨΥΓΕΙΑ ΚΑΛΛΙΘΕΑΣ Ο.Ε.', city: 'Καλλιθέα', weightKg: 268, cost: 112, status: 'submitted', daysAgo: 8 },
  { id: 'DA-07001', recipient: 'ΡΑΦΗΝΑ ΙΧΘΥΟΠΩΛΕΙΑ', city: 'Ραφήνα', weightKg: null, cost: null, status: 'pending', daysAgo: 7 },
  { id: 'DA-06002', recipient: 'ΠΕΡΙΣΤΕΡΙ ΧΑΡΤΙΚΑ Ε.Π.Ε.', city: 'Περιστέρι', weightKg: 63.75, cost: 29, status: 'error', daysAgo: 6, error: 'Λήξη χρόνου αναμονής από την ΑΑΔΕ. Δοκιμάστε νέα υποβολή.' },
  { id: 'DA-05002', recipient: 'LOGISTICS ΑΣΠΡΟΠΥΡΓΟΥ Α.Ε.', city: 'Ασπρόπυργος', weightKg: 512, cost: 96, status: 'submitted', daysAgo: 5 },
  { id: 'DA-04002', recipient: 'ΚΟΡΩΠΙ ΑΓΡΟΤΙΚΑ', city: 'Κορωπί', weightKg: 245, cost: 52, status: 'submitted', daysAgo: 4 },
  { id: 'DA-02001', recipient: '—', city: 'Αιγάλεω', weightKg: 12, cost: null, status: 'pending', daysAgo: 2 },
  { id: 'DA-01002', recipient: 'ΤΕΧΝΟΔΟΜΗ ΜΑΡΟΥΣΙ Α.Ε.', city: 'Μαρούσι', weightKg: 29.6, cost: 30, status: 'error', daysAgo: 1, error: 'Μη έγκυρα διαπιστευτήρια myDATA. Ελέγξτε τις ρυθμίσεις.' },
  { id: 'DA-00001', recipient: 'ΑΧΑΡΝΑΙ ΜΕΤΑΛΛΙΚΑ', city: 'Αχαρνές', weightKg: 967.4, cost: 84, status: 'submitted', daysAgo: 0 },
];

export interface RoadRoute {
  name: string;
  date: string;
  stops: string[];
  km: number | null;
  minutes: number | null;
  optimized: boolean;
}

export const ROAD_ROUTES: RoadRoute[] = [
  { name: 'Δυτικά προάστια', date: '28/10/2026', stops: ['Περιστέρι', 'Ασπρόπυργος', 'Ελευσίνα'], km: 58.4, minutes: 84, optimized: true },
  { name: 'Νότια παραλιακή', date: '31/10/2026', stops: ['Πειραιάς', 'Καλλιθέα', 'Γλυφάδα'], km: 41.2, minutes: 63, optimized: true },
  { name: 'Κέντρο & Πειραιάς', date: '01/11/2026', stops: ['Πειραιάς', 'Καλλιθέα', 'Νέα Ιωνία', 'Περιστέρι'], km: 33.8, minutes: 52, optimized: true },
  { name: 'Βόρεια προάστια', date: '01/11/2026', stops: ['Μαρούσι', 'Αχαρνές', 'Νέα Ιωνία', 'Χαλάνδρι'], km: null, minutes: null, optimized: false },
  { name: 'Ανατολική Αττική', date: '02/11/2026', stops: ['Κορωπί', 'Ραφήνα', 'Γλυφάδα'], km: null, minutes: null, optimized: false },
  { name: 'Θριάσιο & Ελευσίνα', date: '02/11/2026', stops: ['Ασπρόπυργος', 'Ελευσίνα', 'Περιστέρι'], km: null, minutes: null, optimized: false },
];

export interface RoadVehicle {
  plate: string;
  capacityKg: number;
  loadKg: number;
  driver: string;
  whatsapp: string | null;
}

export const ROAD_FLEET: RoadVehicle[] = [
  { plate: 'ΙΖΧ 4512', capacityKg: 1200, loadKg: 860, driver: 'Γιώργος Παπαδάκης', whatsapp: '+306900000101' },
  { plate: 'ΙΚΡ 8830', capacityKg: 1500, loadKg: 1120, driver: 'Νίκος Βλαχόπουλος', whatsapp: '+306900000102' },
  { plate: 'ΙΝΤ 2047', capacityKg: 2200, loadKg: 1650, driver: 'Δημήτρης Σταματίου', whatsapp: '+306900000103' },
  { plate: 'ΙΟΒ 6691', capacityKg: 900, loadKg: 410, driver: 'Κώστας Ανδρεάδης', whatsapp: null },
];

// Indicative kg CO2e per km per vehicle class (transport-SaaS RoadCarbon). Source still to be confirmed.
export const ROAD_CO2_PER_KM = { van: 0.21, truck7: 0.55, truck18: 0.8 } as const;
