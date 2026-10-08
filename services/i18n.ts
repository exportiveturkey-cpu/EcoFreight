export type Language = 'en' | 'el' | 'tr';

export interface Translations {
  dashboard: string;
  shipments: string;
  tracking: string;
  sustainability: string;
  globalNetwork: string;
  docs: string;
  settings: string;
  aiAssistant: string;
  operationalOverview: string;
  realTimeMetrics: string;
  totalShipments: string;
  carbonFootprint: string;
  freightSpend: string;
  avgIntensity: string;
  newShipment: string;
  createShipment: string;
  customer: string;
  origin: string;
  destination: string;
  weight: string;
  volume: string;
  incoterms: string;
  mode: string;
  status: string;
  history: string;
  aiInsights: string;
  offsetting: string;
  search: string;
  cancel: string;
  book: string;
  esgScore: string;
  
  // Navigation & User
  signOut: string;
  switchMode: string;
  daysRemaining: string;
  days: string;
  
  // Demo & Roles
  demoJury: string;
  demoClient: string;
  readOnly: string;
  readOnlyNoticeTitle: string;
  readOnlyNoticeDesc: string;
  demoExpired: string;
  demoExpiredDesc: string;
  renewDemo: string;
  contact: string;
  
  // Login & Demo selector
  quickDemoAccess: string;
  instantAccess: string;
  orCorporate: string;
  juryCardTitle: string;
  juryCardDesc: string;
  startJury: string;
  clientCardTitle: string;
  clientCardDesc: string;
  startClient: string;
  linkCopied: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  signInBtn: string;
  
  // Consignment Table & Modes
  consignment: string;
  originDest: string;
  cargoWeight: string;
  emissions: string;
  freightCost: string;
  inTransit: string;
  delivered: string;
  booked: string;
  sea: string;
  rail: string;
  road: string;
  air: string;
  modalDistribution: string;
  weeklyTrend: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    dashboard: "Dashboard",
    shipments: "Shipments",
    tracking: "Live Tracking",
    sustainability: "Sustainability",
    globalNetwork: "Global Network",
    docs: "System Docs",
    settings: "Settings",
    aiAssistant: "AI Assistant",
    operationalOverview: "Operational Overview",
    realTimeMetrics: "Real-time logistics and sustainability metrics.",
    totalShipments: "Total Shipments",
    carbonFootprint: "Carbon Footprint",
    freightSpend: "Total Freight Spend",
    avgIntensity: "Avg Emission Intensity",
    newShipment: "New Shipment",
    createShipment: "Create Shipment",
    customer: "Customer",
    origin: "Origin",
    destination: "Destination",
    weight: "Weight (Tonnes)",
    volume: "Volume (CBM)",
    incoterms: "Incoterms",
    mode: "Transport Mode",
    status: "Status",
    history: "Shipment History",
    aiInsights: "AI Sustainability Recommendations",
    offsetting: "Carbon Offsetting",
    search: "Search shipments...",
    cancel: "Cancel",
    book: "Book Shipment",
    esgScore: "ESG Score",
    
    signOut: "Sign Out",
    switchMode: "Switch Mode",
    daysRemaining: "days left",
    days: "Days",
    
    demoJury: "NBG Seeds Jury Access",
    demoClient: "Client Preview",
    readOnly: "Read-Only",
    readOnlyNoticeTitle: "Client Preview Mode (Read-Only)",
    readOnlyNoticeDesc: "Creating and deleting shipments is disabled in this preview mode. All 16 sample shipments and AI insights are available for review.",
    demoExpired: "Demo Period Completed",
    demoExpiredDesc: "This demo evaluation session has concluded. For full enterprise integration and active account access, please reach out to the EcoFreight team.",
    renewDemo: "Renew Demo",
    contact: "Contact",
    
    quickDemoAccess: "Instant Demo & Evaluation Access",
    instantAccess: "1-Click Access",
    orCorporate: "or sign in with corporate account",
    juryCardTitle: "NBG Seeds Competition & Jury Access",
    juryCardDesc: "Full evaluation access: Multi-modal route optimization, CBAM intelligence & AI enabled",
    startJury: "Launch as Jury (14 Days Full Access)",
    clientCardTitle: "Potential Client Preview",
    clientCardDesc: "Protected mode: Review 16 shipments, live interactive maps & decarbonization metrics",
    startClient: "Launch Client Preview (3 Days • Read-Only)",
    linkCopied: "Direct access link copied to clipboard!",
    emailPlaceholder: "Email Address",
    passwordPlaceholder: "Password",
    signInBtn: "Sign In Securely",
    
    consignment: "Consignment",
    originDest: "Origin → Destination",
    cargoWeight: "Cargo / Weight",
    emissions: "Emissions",
    freightCost: "Freight Cost",
    inTransit: "In Transit",
    delivered: "Delivered",
    booked: "Booked",
    sea: "Sea",
    rail: "Rail",
    road: "Road",
    air: "Air",
    modalDistribution: "Modal Distribution",
    weeklyTrend: "Weekly Emissions & Spend"
  },
  tr: {
    dashboard: "Panel",
    shipments: "Sevkiyatlar",
    tracking: "Canlı Takip",
    sustainability: "Sürdürülebilirlik",
    globalNetwork: "Küresel Ağ",
    docs: "Sistem Dökümanları",
    settings: "Ayarlar",
    aiAssistant: "AI Asistanı",
    operationalOverview: "Operasyonel Genel Bakış",
    realTimeMetrics: "Gerçek zamanlı lojistik ve sürdürülebilirlik metrikleri.",
    totalShipments: "Toplam Sevkiyat",
    carbonFootprint: "Karbon Ayak İzi",
    freightSpend: "Toplam Harcama",
    avgIntensity: "Ort. Emisyon Yoğunluğu",
    newShipment: "Yeni Sevkiyat",
    createShipment: "Sevkiyat Oluştur",
    customer: "Müşteri",
    origin: "Çıkış Noktası",
    destination: "Varış Noktası",
    weight: "Ağırlık (Ton)",
    volume: "Hacim (CBM)",
    incoterms: "Teslim Şekli",
    mode: "Taşıma Modu",
    status: "Durum",
    history: "Sevkiyat Geçmişi",
    aiInsights: "AI Sürdürülebilirlik Önerileri",
    offsetting: "Karbon Dengeleme",
    search: "Sevkiyat ara...",
    cancel: "İptal",
    book: "Sevkiyatı Rezerve Et",
    esgScore: "ESG Skoru",
    
    signOut: "Çıkış Yap",
    switchMode: "Mod Değiştir",
    daysRemaining: "gün kaldı",
    days: "Gün",
    
    demoJury: "NBG Seeds Jüri Erişimi",
    demoClient: "Müşteri Önizleme",
    readOnly: "Salt Okunur",
    readOnlyNoticeTitle: "Müşteri Önizleme Modu (Salt Okunur)",
    readOnlyNoticeDesc: "Bu önizleme modunda sevkiyat ekleme ve silme işlemleri devre dışıdır. 16 gerçekçi örnek sevkiyat ve AI analizleri incelenebilir.",
    demoExpired: "Demo Süresi Tamamlandı",
    demoExpiredDesc: "Bu demo oturumunun kullanım süresi dolmuştur. Tam yetkili kurumsal entegrasyon ve üyelik için EcoFreight ekibiyle iletişime geçebilirsiniz.",
    renewDemo: "Demoyu Yenile",
    contact: "İletişim",
    
    quickDemoAccess: "Hızlı Demo ve Değerlendirme Girişleri",
    instantAccess: "Şifresiz Tek Tık",
    orCorporate: "veya kurumsal hesapla giriş",
    juryCardTitle: "NBG Seeds Yarışma & Jüri Girişi",
    juryCardDesc: "Tam yetkili değerlendirme: Rota optimizasyonu, CBAM ve AI testleri açık",
    startJury: "Jüri Olarak Başlat (14 Günlük Tam Erişim)",
    clientCardTitle: "Potansiyel Müşteri Önizlemesi",
    clientCardDesc: "Korumalı mod: 16 sevkiyat, harita ve analizleri inceler, veri değiştirilemez",
    startClient: "Müşteri Önizlemesini Başlat (3 Gün • Salt Okunur)",
    linkCopied: "Paylaşım bağlantısı panoya kopyalandı!",
    emailPlaceholder: "E-posta Adresi",
    passwordPlaceholder: "Şifre",
    signInBtn: "Güvenli Giriş Yap",
    
    consignment: "Sevkiyat No",
    originDest: "Çıkış → Varış",
    cargoWeight: "Yük / Ağırlık",
    emissions: "Emisyonlar",
    freightCost: "Navlun Maliyeti",
    inTransit: "Yolda",
    delivered: "Teslim Edildi",
    booked: "Rezerve Edildi",
    sea: "Deniz",
    rail: "Demiryolu",
    road: "Karayolu",
    air: "Havayolu",
    modalDistribution: "Taşıma Türü Dağılımı",
    weeklyTrend: "Haftalık Emisyon ve Harcama Trendi"
  },
  el: {
    dashboard: "Πίνακας Ελέγχου",
    shipments: "Αποστολές",
    tracking: "Ζωντανή Παρακολούθηση",
    sustainability: "Βιωσιμότητα",
    globalNetwork: "Παγκόσμιο Δίκτυο",
    docs: "Τεκμηρίωση Συστήματος",
    settings: "Ρυθμίσεις",
    aiAssistant: "AI Βοηθός",
    operationalOverview: "Επιχειρησιακή Επισκόπηση",
    realTimeMetrics: "Μετρήσεις εφοδιαστικής και βιωσιμότητας σε πραγματικό χρόνο.",
    totalShipments: "Συνολικές Αποστολές",
    carbonFootprint: "Αποτύπωμα Άνθρακα",
    freightSpend: "Συνολική Δαπάνη Φορτίου",
    avgIntensity: "Μέση Ένταση Εκπομπών",
    newShipment: "Νέα Αποστολή",
    createShipment: "Δημιουργία Αποστολής",
    customer: "Πελάτης",
    origin: "Προέλευση",
    destination: "Προορισμός",
    weight: "Βάρος (Τόνοι)",
    volume: "Όγκος (CBM)",
    incoterms: "Incoterms",
    mode: "Τρόπος Μεταφοράς",
    status: "Κατάσταση",
    history: "Ιστορικό Αποστολών",
    aiInsights: "Συστάσεις Βιωσιμότητας AI",
    offsetting: "Αντιστάθμιση Άνθρακα",
    search: "Αναζήτηση αποστολών...",
    cancel: "Ακύρωση",
    book: "Κράτηση Αποστολής",
    esgScore: "Βαθμολογία ESG",
    
    signOut: "Αποσύνδεση",
    switchMode: "Αλλαγή Λειτουργίας",
    daysRemaining: "ημ. απομένουν",
    days: "Ημέρες",
    
    demoJury: "Πρόσβαση Κριτικής Επιτροπής NBG Seeds",
    demoClient: "Προεπισκόπηση Πελάτη",
    readOnly: "Μόνο Ανάγνωση",
    readOnlyNoticeTitle: "Λειτουργία Προεπισκόπησης Πελάτη (Μόνο Ανάγνωση)",
    readOnlyNoticeDesc: "Η δημιουργία και διαγραφή αποστολών είναι απενεργοποιημένη σε αυτήν την προεπισκόπηση. Όλες οι 16 ενδεικτικές αποστολές και οι αναλύσεις AI είναι διαθέσιμες προς αξιολόγηση.",
    demoExpired: "Η Περίοδος Demo Ολοκληρώθηκε",
    demoExpiredDesc: "Αυτή η δοκιμαστική συνεδρία αξιολόγησης έχει λήξει. Για πλήρη εταιρική ενσωμάτωση και πρόσβαση λογαριασμού, επικοινωνήστε με την ομάδα της EcoFreight.",
    renewDemo: "Ανανέωση Demo",
    contact: "Επικοινωνία",
    
    quickDemoAccess: "Άμεση Πρόσβαση Demo & Αξιολόγησης",
    instantAccess: "Πρόσβαση με 1 Κλικ",
    orCorporate: "ή σύνδεση με εταιρικό λογαριασμό",
    juryCardTitle: "Διαγωνισμός NBG Seeds & Είσοδος Κριτών",
    juryCardDesc: "Πλήρης πρόσβαση αξιολόγησης: Πολυτροπική βελτιστοποίηση διαδρομών, πληροφορίες CBAM & AI ενεργά",
    startJury: "Είσοδος ως Κριτής (14 Ημέρες Πλήρης Πρόσβαση)",
    clientCardTitle: "Προεπισκόπηση Υποψήφιου Πελάτη",
    clientCardDesc: "Προστατευμένη λειτουργία: Επισκόπηση 16 αποστολών, διαδραστικοί χάρτες & δείκτες απανθρακοποίησης",
    startClient: "Έναρξη Προεπισκόπησης Πελάτη (3 Ημέρες • Μόνο Ανάγνωση)",
    linkCopied: "Ο σύνδεσμος άμεσης πρόσβασης αντιγράφηκε στο πρόχειρο!",
    emailPlaceholder: "Διεύθυνση Email",
    passwordPlaceholder: "Κωδικός Πρόσβασης",
    signInBtn: "Ασφαλής Σύνδεση",
    
    consignment: "Φορτωτική",
    originDest: "Προέλευση → Προορισμός",
    cargoWeight: "Φορτίο / Βάρος",
    emissions: "Εκπομπές",
    freightCost: "Κόστος Ναύλου",
    inTransit: "Σε Μεταφορά",
    delivered: "Παραδόθηκε",
    booked: "Καταχωρήθηκε",
    sea: "Θαλάσσιο",
    rail: "Σιδηροδρομικό",
    road: "Οδικό",
    air: "Αεροπορικό",
    modalDistribution: "Κατανομή Τρόπων Μεταφοράς",
    weeklyTrend: "Εβδομαδιαία Τάση Εκπομπών & Δαπανών"
  }
};

export const useTranslation = (lang: Language): Translations => {
  return translations[lang] || translations.en;
};
