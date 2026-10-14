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
  customs: string;
  cancelled: string;
  actions: string;
  route: string;
  idCustomer: string;
  back: string;
  close: string;
  dashTitle: string;
  dashSubtitle: string;
  activeConsignments: string;
  completed: string;
  intermodalEfficiency: string;
  greenShare: string;
  emissionsCurve: string;
  emissionsCurveDesc: string;
  activeCorridors: string;
  modalShiftBenefit: string;
  modalShiftDesc: string;
  shipTitle: string;
  shipSubtitle: string;
  newShipmentAnalysis: string;
  dropBol: string;
  analyzeOptions: string;
  fillRequired: string;
  bookNow: string;
  shipmentDetails: string;
  legs: string;
  totalCost: string;
  publicPortal: string;
  copyTrackingLink: string;
  copied: string;
  trackTitle: string;
  trackSubtitle: string;
  chokepointAlerts: string;
  consignmentMetrics: string;
  milestoneHistory: string;
  damageAudit: string;
  uploadPhoto: string;
  noShipments: string;
  sustTitle: string;
  sustSubtitle: string;
  complianceEngine: string;
  exportReport: string;
  offsetMarket: string;
  offsetDesc: string;
  investNow: string;
  neutralized: string;
  coPilot: string;
  emissionsByZone: string;
  netTitle: string;
  netSubtitle: string;
  aiTitle: string;
  aiSubtitle: string;
  aiWelcome: string;
  aiPlaceholder: string;
  aiThinking: string;
  aiError: string;
  voiceInput: string;
  listening: string;
  voiceUnsupported: string;
  quickPrompts: string;
  qpSuez: string;
  qpSuezQ: string;
  qpEmissions: string;
  qpEmissionsQ: string;
  qpFleet: string;
  qpFleetQ: string;
  notifications: string;
  preferredCarrier: string;
  preferredCarrierSet: string;
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
    weeklyTrend: "Weekly Emissions & Spend",
    customs: "Customs",
    cancelled: "Cancelled",
    actions: "Actions",
    route: "Route",
    idCustomer: "ID / Customer",
    back: "Back",
    close: "Close",
    dashTitle: "Executive Dashboard",
    dashSubtitle: "Global Logistics & ESG Performance Monitoring",
    activeConsignments: "Active Consignments",
    completed: "Completed",
    intermodalEfficiency: "Intermodal Efficiency",
    greenShare: "Rail/Sea Green Share",
    emissionsCurve: "Emissions Trend",
    emissionsCurveDesc: "Aggregated GHG emissions (kg CO2e) across all multimodal routes",
    activeCorridors: "Active Strategic Corridors",
    modalShiftBenefit: "Modal Shift Benefit",
    modalShiftDesc: "Current rail/sea split saves ~64% CO2 vs all-road haulage.",
    shipTitle: "Shipment Management",
    shipSubtitle: "Consignment operations, cost & emissions per shipment",
    newShipmentAnalysis: "New Shipment Analysis",
    dropBol: "Upload a Bill of Lading to auto-fill",
    analyzeOptions: "Analyze Options",
    fillRequired: "Fill in customer, origin, destination and a weight above 0.",
    bookNow: "Book Now",
    shipmentDetails: "Shipment Details",
    legs: "Transport Legs",
    totalCost: "Total Cost",
    publicPortal: "Public Tracking Portal",
    copyTrackingLink: "Copy Tracking Link",
    copied: "Copied!",
    trackTitle: "Logistics Command Center",
    trackSubtitle: "Corridor tracking, risk alerts & AI cargo inspection",
    chokepointAlerts: "Chokepoint Alerts",
    consignmentMetrics: "Consignment Metrics",
    milestoneHistory: "Milestone History",
    damageAudit: "AI Cargo Integrity Audit",
    uploadPhoto: "Upload Inspection Photo",
    noShipments: "No shipments match your search.",
    sustTitle: "Sustainability Intelligence",
    sustSubtitle: "CBAM Compliance, EU ETS & Carbon Accounting",
    complianceEngine: "Compliance Engine",
    exportReport: "Export CSRD / CBAM Report",
    offsetMarket: "Offset Market",
    offsetDesc: "Neutralize footprint via Verified Carbon Standard (VCS) projects.",
    investNow: "Invest Now",
    neutralized: "Footprint neutralized ✓",
    coPilot: "Sustainability Co-Pilot",
    emissionsByZone: "Emissions by Regulatory Zone",
    netTitle: "Supplier Intelligence",
    netSubtitle: "Carrier ESG Scorecard & Global Network Leaderboard",
    aiTitle: "AI Command Center",
    aiSubtitle: "Multimodal logistics intelligence with Google Gemini",
    aiWelcome: "Welcome to the EcoFreight AI Command Center powered by Google Gemini. How can I help with route decarbonization, CBAM compliance, or multimodal logistics today?",
    aiPlaceholder: "Ask about routes, CBAM carbon tariffs, or emissions...",
    aiThinking: "Gemini is analyzing...",
    aiError: "The AI response could not be completed. Please check your connection.",
    voiceInput: "Voice Input",
    listening: "Listening...",
    voiceUnsupported: "Voice input is not supported in this browser. Please type your message.",
    quickPrompts: "Quick AI Prompts",
    qpSuez: "Check Suez Delays",
    qpSuezQ: "What is the current status of Suez Canal and Red Sea maritime traffic, and how should we mitigate delays and emissions?",
    qpEmissions: "Emission Summary",
    qpEmissionsQ: "Summarize the carbon emission reduction potential across Road vs Rail vs Sea under the GLEC framework.",
    qpFleet: "Fleet Optimization",
    qpFleetQ: "What operational strategies can our fleet adopt to minimize fuel consumption and comply with EU CBAM requirements?",
    notifications: "Latest Updates",
    preferredCarrier: "Preferred Carrier",
    preferredCarrierSet: "Preferred"
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
    weeklyTrend: "Haftalık Emisyon ve Harcama Trendi",
    customs: "Gümrükte",
    cancelled: "İptal Edildi",
    actions: "İşlemler",
    route: "Rota",
    idCustomer: "ID / Müşteri",
    back: "Geri",
    close: "Kapat",
    dashTitle: "Yönetici Paneli",
    dashSubtitle: "Küresel Lojistik ve ESG Performans İzleme",
    activeConsignments: "Aktif Sevkiyat",
    completed: "Tamamlandı",
    intermodalEfficiency: "İntermodal Verimlilik",
    greenShare: "Demiryolu/Deniz Yeşil Payı",
    emissionsCurve: "Emisyon Trendi",
    emissionsCurveDesc: "Tüm çok modlu rotalarda toplam sera gazı emisyonu (kg CO2e)",
    activeCorridors: "Aktif Stratejik Koridorlar",
    modalShiftBenefit: "Mod Değişimi Faydası",
    modalShiftDesc: "Mevcut demiryolu/deniz dağılımı, tamamen karayoluna göre ~%64 CO2 tasarrufu sağlar.",
    shipTitle: "Sevkiyat Yönetimi",
    shipSubtitle: "Sevkiyat operasyonları, maliyet ve emisyonlar",
    newShipmentAnalysis: "Yeni Sevkiyat Analizi",
    dropBol: "Otomatik doldurmak için konşimento yükleyin",
    analyzeOptions: "Seçenekleri Analiz Et",
    fillRequired: "Müşteri, çıkış, varış ve 0'dan büyük ağırlık girin.",
    bookNow: "Şimdi Rezerve Et",
    shipmentDetails: "Sevkiyat Detayları",
    legs: "Taşıma Ayakları",
    totalCost: "Toplam Maliyet",
    publicPortal: "Halka Açık Takip Portalı",
    copyTrackingLink: "Takip Linkini Kopyala",
    copied: "Kopyalandı!",
    trackTitle: "Lojistik Komuta Merkezi",
    trackSubtitle: "Koridor takibi, risk uyarıları ve AI kargo denetimi",
    chokepointAlerts: "Darboğaz Uyarıları",
    consignmentMetrics: "Sevkiyat Metrikleri",
    milestoneHistory: "Kilometre Taşı Geçmişi",
    damageAudit: "AI Kargo Bütünlük Denetimi",
    uploadPhoto: "Denetim Fotoğrafı Yükle",
    noShipments: "Aramanızla eşleşen sevkiyat yok.",
    sustTitle: "Sürdürülebilirlik Zekası",
    sustSubtitle: "CBAM Uyumu, AB ETS ve Karbon Muhasebesi",
    complianceEngine: "Uyum Motoru",
    exportReport: "CSRD / CBAM Raporu İndir",
    offsetMarket: "Dengeleme Pazarı",
    offsetDesc: "Ayak izinizi VCS sertifikalı projelerle dengeleyin.",
    investNow: "Şimdi Yatırım Yap",
    neutralized: "Ayak izi dengelendi ✓",
    coPilot: "Sürdürülebilirlik Yardımcısı",
    emissionsByZone: "Düzenleyici Bölgeye Göre Emisyonlar",
    netTitle: "Tedarikçi Zekası",
    netSubtitle: "Taşıyıcı ESG Karnesi ve Küresel Ağ Sıralaması",
    aiTitle: "AI Komuta Merkezi",
    aiSubtitle: "Google Gemini ile çok modlu lojistik zekası",
    aiWelcome: "Google Gemini destekli EcoFreight AI Komuta Merkezi'ne hoş geldiniz. Rota karbonsuzlaştırma, CBAM uyumu veya çok modlu lojistik konusunda nasıl yardımcı olabilirim?",
    aiPlaceholder: "Rotalar, CBAM karbon vergileri veya emisyonlar hakkında sorun...",
    aiThinking: "Gemini analiz ediyor...",
    aiError: "AI yanıtı tamamlanamadı. Lütfen bağlantınızı kontrol edin.",
    voiceInput: "Sesli Giriş",
    listening: "Dinleniyor...",
    voiceUnsupported: "Bu tarayıcı sesli girişi desteklemiyor. Lütfen mesajınızı yazın.",
    quickPrompts: "Hızlı AI Komutları",
    qpSuez: "Süveyş Gecikmelerini Kontrol Et",
    qpSuezQ: "Süveyş Kanalı ve Kızıldeniz deniz trafiğinin güncel durumu nedir, gecikmeleri ve emisyonları nasıl azaltmalıyız?",
    qpEmissions: "Emisyon Özeti",
    qpEmissionsQ: "GLEC çerçevesinde Karayolu, Demiryolu ve Deniz arasındaki karbon emisyonu azaltım potansiyelini özetle.",
    qpFleet: "Filo Optimizasyonu",
    qpFleetQ: "Filomuz yakıt tüketimini azaltmak ve AB CBAM gerekliliklerine uymak için hangi stratejileri benimseyebilir?",
    notifications: "Son Güncellemeler",
    preferredCarrier: "Tercih Edilen Taşıyıcı",
    preferredCarrierSet: "Tercih Edildi"
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
    weeklyTrend: "Εβδομαδιαία Τάση Εκπομπών & Δαπανών",
    customs: "Τελωνείο",
    cancelled: "Ακυρώθηκε",
    actions: "Ενέργειες",
    route: "Διαδρομή",
    idCustomer: "ID / Πελάτης",
    back: "Πίσω",
    close: "Κλείσιμο",
    dashTitle: "Πίνακας Ελέγχου",
    dashSubtitle: "Παρακολούθηση Logistics & Απόδοσης ESG",
    activeConsignments: "Ενεργές Αποστολές",
    completed: "Ολοκληρώθηκαν",
    intermodalEfficiency: "Διατροπική Αποδοτικότητα",
    greenShare: "Πράσινο Μερίδιο Σιδ/Θάλ",
    emissionsCurve: "Τάση Εκπομπών",
    emissionsCurveDesc: "Συνολικές εκπομπές GHG (kg CO2e) σε όλες τις πολυτροπικές διαδρομές",
    activeCorridors: "Ενεργοί Στρατηγικοί Διάδρομοι",
    modalShiftBenefit: "Όφελος Αλλαγής Μέσου",
    modalShiftDesc: "Ο τρέχων συνδυασμός σιδηροδρόμου/θάλασσας εξοικονομεί ~64% CO2 έναντι οδικών μεταφορών.",
    shipTitle: "Διαχείριση Αποστολών",
    shipSubtitle: "Λειτουργίες αποστολών, κόστος & εκπομπές ανά αποστολή",
    newShipmentAnalysis: "Ανάλυση Νέας Αποστολής",
    dropBol: "Ανεβάστε φορτωτική για αυτόματη συμπλήρωση",
    analyzeOptions: "Ανάλυση Επιλογών",
    fillRequired: "Συμπληρώστε πελάτη, προέλευση, προορισμό και βάρος μεγαλύτερο του 0.",
    bookNow: "Κράτηση Τώρα",
    shipmentDetails: "Λεπτομέρειες Αποστολής",
    legs: "Σκέλη Μεταφοράς",
    totalCost: "Συνολικό Κόστος",
    publicPortal: "Δημόσια Πύλη Παρακολούθησης",
    copyTrackingLink: "Αντιγραφή Συνδέσμου",
    copied: "Αντιγράφηκε!",
    trackTitle: "Κέντρο Ελέγχου Logistics",
    trackSubtitle: "Παρακολούθηση διαδρόμων, ειδοποιήσεις κινδύνου & AI επιθεώρηση φορτίου",
    chokepointAlerts: "Ειδοποιήσεις Σημείων Συμφόρησης",
    consignmentMetrics: "Μετρικές Αποστολής",
    milestoneHistory: "Ιστορικό Σταθμών",
    damageAudit: "AI Έλεγχος Ακεραιότητας Φορτίου",
    uploadPhoto: "Μεταφόρτωση Φωτογραφίας",
    noShipments: "Καμία αποστολή δεν ταιριάζει με την αναζήτηση.",
    sustTitle: "Ευφυΐα Βιωσιμότητας",
    sustSubtitle: "Συμμόρφωση CBAM, EU ETS & Λογιστική Άνθρακα",
    complianceEngine: "Μηχανή Συμμόρφωσης",
    exportReport: "Εξαγωγή Αναφοράς CSRD / CBAM",
    offsetMarket: "Αγορά Αντιστάθμισης",
    offsetDesc: "Ουδετεροποιήστε το αποτύπωμα μέσω έργων Verified Carbon Standard (VCS).",
    investNow: "Επένδυση Τώρα",
    neutralized: "Το αποτύπωμα ουδετεροποιήθηκε ✓",
    coPilot: "Συγκυβερνήτης Βιωσιμότητας",
    emissionsByZone: "Εκπομπές ανά Ρυθμιστική Ζώνη",
    netTitle: "Ευφυΐα Προμηθευτών",
    netSubtitle: "Βαθμολογία ESG Μεταφορέων & Κατάταξη Δικτύου",
    aiTitle: "Κέντρο Εντολών AI",
    aiSubtitle: "Ευφυΐα πολυτροπικών μεταφορών με Google Gemini",
    aiWelcome: "Καλώς ήρθατε στο Κέντρο Εντολών AI της EcoFreight με Google Gemini. Πώς μπορώ να βοηθήσω με απανθρακοποίηση διαδρομών, συμμόρφωση CBAM ή πολυτροπικές μεταφορές;",
    aiPlaceholder: "Ρωτήστε για διαδρομές, τέλη άνθρακα CBAM ή εκπομπές...",
    aiThinking: "Το Gemini αναλύει...",
    aiError: "Η απάντηση AI δεν ολοκληρώθηκε. Ελέγξτε τη σύνδεσή σας.",
    voiceInput: "Φωνητική Εισαγωγή",
    listening: "Ακούω...",
    voiceUnsupported: "Η φωνητική εισαγωγή δεν υποστηρίζεται σε αυτόν τον browser. Πληκτρολογήστε το μήνυμά σας.",
    quickPrompts: "Γρήγορες Ερωτήσεις AI",
    qpSuez: "Καθυστερήσεις Σουέζ",
    qpSuezQ: "Ποια είναι η τρέχουσα κατάσταση στη Διώρυγα του Σουέζ και την Ερυθρά Θάλασσα, και πώς μειώνουμε καθυστερήσεις και εκπομπές;",
    qpEmissions: "Σύνοψη Εκπομπών",
    qpEmissionsQ: "Σύνοψε το δυναμικό μείωσης εκπομπών άνθρακα μεταξύ Οδικών, Σιδηροδρομικών και Θαλάσσιων μεταφορών βάσει GLEC.",
    qpFleet: "Βελτιστοποίηση Στόλου",
    qpFleetQ: "Ποιες στρατηγικές μπορεί να υιοθετήσει ο στόλος μας για ελάχιστη κατανάλωση καυσίμου και συμμόρφωση με το EU CBAM;",
    notifications: "Τελευταίες Ενημερώσεις",
    preferredCarrier: "Προτιμώμενος Μεταφορέας",
    preferredCarrierSet: "Προτιμώμενος"
  }
};

export const useTranslation = (lang: Language): Translations => {
  return translations[lang] || translations.en;
};

export const statusLabel = (status: string, t: Translations): string => {
  switch (status) {
    case 'In Transit': return t.inTransit;
    case 'Delivered': return t.delivered;
    case 'Customs': return t.customs;
    case 'Cancelled': return t.cancelled;
    default: return t.booked;
  }
};
