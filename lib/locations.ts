export type BDLocation = {
  nameEn: string;
  nameBn: string;
  district: string;
  division: string;
  lat?: number;
  lng?: number;
};

export const BANGLADESH_LOCATIONS: BDLocation[] = [
  // Dhaka Division
  { nameEn: "Dhanmondi", nameBn: "ধানমন্ডি", district: "Dhaka", division: "Dhaka", lat: 23.7461, lng: 90.3742 },
  { nameEn: "Gulshan", nameBn: "গুলশান", district: "Dhaka", division: "Dhaka", lat: 23.7925, lng: 90.4078 },
  { nameEn: "Banani", nameBn: "বনানী", district: "Dhaka", division: "Dhaka", lat: 23.7937, lng: 90.4066 },
  { nameEn: "Uttara", nameBn: "উত্তরা", district: "Dhaka", division: "Dhaka", lat: 23.8759, lng: 90.3795 },
  { nameEn: "Mirpur", nameBn: "মিরপুর", district: "Dhaka", division: "Dhaka", lat: 23.8223, lng: 90.3654 },
  { nameEn: "Mohammadpur", nameBn: "মোহাম্মদপুর", district: "Dhaka", division: "Dhaka", lat: 23.7658, lng: 90.3584 },
  { nameEn: "Motijheel", nameBn: "মতিঝিল", district: "Dhaka", division: "Dhaka", lat: 23.7334, lng: 90.4172 },
  { nameEn: "Savar", nameBn: "সাভার", district: "Dhaka", division: "Dhaka", lat: 23.8479, lng: 90.2577 },
  { nameEn: "Dhamrai", nameBn: "ধামরাই", district: "Dhaka", division: "Dhaka", lat: 23.9172, lng: 90.2144 },
  { nameEn: "Keraniganj", nameBn: "কেরাণীগঞ্জ", district: "Dhaka", division: "Dhaka", lat: 23.6844, lng: 90.3131 },
  { nameEn: "Nawabganj", nameBn: "নবাবগঞ্জ", district: "Dhaka", division: "Dhaka", lat: 23.6667, lng: 90.1667 },
  { nameEn: "Dohar", nameBn: "দোহার", district: "Dhaka", division: "Dhaka", lat: 23.5933, lng: 90.1333 },
  { nameEn: "Gazipur Sadar", nameBn: "গাজীপুর সদর", district: "Gazipur", division: "Dhaka", lat: 23.9999, lng: 90.4203 },
  { nameEn: "Kaliakair", nameBn: "কালিয়াকৈর", district: "Gazipur", division: "Dhaka", lat: 24.0736, lng: 90.2181 },
  { nameEn: "Kapasia", nameBn: "কাপাসিয়া", district: "Gazipur", division: "Dhaka", lat: 24.1167, lng: 90.5667 },
  { nameEn: "Sreepur", nameBn: "শ্রীপুর", district: "Gazipur", division: "Dhaka", lat: 24.2000, lng: 90.4667 },
  { nameEn: "Kaliganj", nameBn: "কালীগঞ্জ", district: "Gazipur", division: "Dhaka", lat: 23.9167, lng: 90.5667 },
  { nameEn: "Narayanganj Sadar", nameBn: "নারায়ণগঞ্জ সদর", district: "Narayanganj", division: "Dhaka", lat: 23.6238, lng: 90.5000 },
  { nameEn: "Sonargaon", nameBn: "সোনারগাঁ", district: "Narayanganj", division: "Dhaka", lat: 23.6500, lng: 90.6000 },
  { nameEn: "Rupganj", nameBn: "রূপগঞ্জ", district: "Narayanganj", division: "Dhaka", lat: 23.7944, lng: 90.5194 },
  { nameEn: "Araihazar", nameBn: "আড়াইহাজার", district: "Narayanganj", division: "Dhaka", lat: 23.7833, lng: 90.6500 },
  { nameEn: "Bandar", nameBn: "বন্দর", district: "Narayanganj", division: "Dhaka", lat: 23.5972, lng: 90.5333 },
  { nameEn: "Narsingdi Sadar", nameBn: "নরসিংদী সদর", district: "Narsingdi", division: "Dhaka", lat: 23.9167, lng: 90.7167 },
  { nameEn: "Palash", nameBn: "পলাশ", district: "Narsingdi", division: "Dhaka", lat: 23.9500, lng: 90.6333 },
  { nameEn: "Shibpur", nameBn: "শিবপুর", district: "Narsingdi", division: "Dhaka", lat: 24.0333, lng: 90.7333 },
  { nameEn: "Raipura", nameBn: "রায়পুরা", district: "Narsingdi", division: "Dhaka", lat: 23.9833, lng: 90.8667 },
  { nameEn: "Monohardi", nameBn: "মনোহরদী", district: "Narsingdi", division: "Dhaka", lat: 24.1333, lng: 90.7000 },
  { nameEn: "Belabo", nameBn: "বেলাবো", district: "Narsingdi", division: "Dhaka", lat: 24.1000, lng: 90.8500 },
  { nameEn: "Tangail Sadar", nameBn: "টাঙ্গাইল সদর", district: "Tangail", division: "Dhaka", lat: 24.2500, lng: 89.9167 },
  { nameEn: "Mirzapur", nameBn: "মির্জাপুর", district: "Tangail", division: "Dhaka", lat: 24.1000, lng: 90.1000 },
  { nameEn: "Madhupur", nameBn: "মধুপুর", district: "Tangail", division: "Dhaka", lat: 24.6167, lng: 90.0333 },
  { nameEn: "Gopalpur", nameBn: "গোপালপুর", district: "Tangail", division: "Dhaka", lat: 24.5500, lng: 89.9167 },
  { nameEn: "Ghatail", nameBn: "ঘাটাইল", district: "Tangail", division: "Dhaka", lat: 24.5000, lng: 90.0000 },
  { nameEn: "Kalihati", nameBn: "কালিহাতী", district: "Tangail", division: "Dhaka", lat: 24.3833, lng: 90.0000 },
  { nameEn: "Sakhipur", nameBn: "সখিপুর", district: "Tangail", division: "Dhaka", lat: 24.3000, lng: 90.1667 },
  { nameEn: "Nagarpur", nameBn: "নাগরপুর", district: "Tangail", division: "Dhaka", lat: 24.0500, lng: 89.8667 },
  { nameEn: "Delduar", nameBn: "দেলদুয়ার", district: "Tangail", division: "Dhaka", lat: 24.1333, lng: 89.9667 },
  { nameEn: "Bhuapur", nameBn: "ভুয়াপুর", district: "Tangail", division: "Dhaka", lat: 24.4667, lng: 89.8667 },
  { nameEn: "Dhanbari", nameBn: "ধনবাড়ী", district: "Tangail", division: "Dhaka", lat: 24.6667, lng: 89.9500 },
  { nameEn: "Basail", nameBn: "বাসাইল", district: "Tangail", division: "Dhaka", lat: 24.2167, lng: 90.0500 },
  { nameEn: "Kishoreganj Sadar", nameBn: "কিশোরগঞ্জ সদর", district: "Kishoreganj", division: "Dhaka", lat: 24.4333, lng: 90.7833 },
  { nameEn: "Bhairab", nameBn: "ভৈরব", district: "Kishoreganj", division: "Dhaka", lat: 24.0500, lng: 90.9833 },
  { nameEn: "Bajitpur", nameBn: "বাজিতপুর", district: "Kishoreganj", division: "Dhaka", lat: 24.2167, lng: 90.9500 },
  { nameEn: "Katiadi", nameBn: "কটিয়াদী", district: "Kishoreganj", division: "Dhaka", lat: 24.2500, lng: 90.8000 },
  { nameEn: "Pakundia", nameBn: "পাকুন্দিয়া", district: "Kishoreganj", division: "Dhaka", lat: 24.3333, lng: 90.6833 },
  { nameEn: "Manikganj Sadar", nameBn: "মানিকগঞ্জ সদর", district: "Manikganj", division: "Dhaka", lat: 23.8617, lng: 90.0003 },
  { nameEn: "Singair", nameBn: "সিংগাইর", district: "Manikganj", division: "Dhaka", lat: 23.8167, lng: 90.1500 },
  { nameEn: "Munshiganj Sadar", nameBn: "মুন্সীগঞ্জ সদর", district: "Munshiganj", division: "Dhaka", lat: 23.5422, lng: 90.5306 },
  { nameEn: "Sreenagar", nameBn: "শ্রীনগর", district: "Munshiganj", division: "Dhaka", lat: 23.5333, lng: 90.2833 },
  { nameEn: "Gopalganj Sadar", nameBn: "গোপালগঞ্জ সদর", district: "Gopalganj", division: "Dhaka", lat: 23.0050, lng: 89.8267 },
  { nameEn: "Kashiani", nameBn: "কাশিয়ানী", district: "Gopalganj", division: "Dhaka", lat: 23.2167, lng: 89.7000 },
  { nameEn: "Faridpur Sadar", nameBn: "ফরিদপুর সদর", district: "Faridpur", division: "Dhaka", lat: 23.6000, lng: 89.8333 },
  { nameEn: "Boalmari", nameBn: "বোয়ালমারী", district: "Faridpur", division: "Dhaka", lat: 23.3833, lng: 89.6833 },
  { nameEn: "Bhanga", nameBn: "ভাঙ্গা", district: "Faridpur", division: "Dhaka", lat: 23.3833, lng: 89.9833 },
  { nameEn: "Madaripur Sadar", nameBn: "মাদারীপুর সদর", district: "Madaripur", division: "Dhaka", lat: 23.1642, lng: 90.1864 },
  { nameEn: "Shibchar", nameBn: "শিবচর", district: "Madaripur", division: "Dhaka", lat: 23.3500, lng: 90.1667 },
  { nameEn: "Rajbari Sadar", nameBn: "রাজবাড়ী সদর", district: "Rajbari", division: "Dhaka", lat: 23.7574, lng: 89.6444 },
  { nameEn: "Pangsa", nameBn: "পাংশা", district: "Rajbari", division: "Dhaka", lat: 23.7833, lng: 89.4167 },
  { nameEn: "Shariatpur Sadar", nameBn: "শরীয়তপুর সদর", district: "Shariatpur", division: "Dhaka", lat: 23.2423, lng: 90.4348 },
  { nameEn: "Naria", nameBn: "নড়িয়া", district: "Shariatpur", division: "Dhaka", lat: 23.3167, lng: 90.4167 },

  // Rajshahi Division (including Sirajganj, Pabna, Bogura, etc.)
  { nameEn: "Sirajganj Sadar", nameBn: "সিরাজগঞ্জ সদর", district: "Sirajganj", division: "Rajshahi", lat: 24.4533, lng: 89.7006 },
  { nameEn: "Belkuchi", nameBn: "বেলকুচি", district: "Sirajganj", division: "Rajshahi", lat: 24.2889, lng: 89.7028 },
  { nameEn: "Ullapara", nameBn: "উল্লাপাড়া", district: "Sirajganj", division: "Rajshahi", lat: 24.3167, lng: 89.5667 },
  { nameEn: "Shahjadpur", nameBn: "শাহজাদপুর", district: "Sirajganj", division: "Rajshahi", lat: 24.1750, lng: 89.6000 },
  { nameEn: "Raiganj", nameBn: "রায়গঞ্জ", district: "Sirajganj", division: "Rajshahi", lat: 24.5000, lng: 89.5333 },
  { nameEn: "Kazipur", nameBn: "কাজীপুর", district: "Sirajganj", division: "Rajshahi", lat: 24.6667, lng: 89.6500 },
  { nameEn: "Tarash", nameBn: "তাড়াশ", district: "Sirajganj", division: "Rajshahi", lat: 24.4333, lng: 89.3667 },
  { nameEn: "Kamarkhand", nameBn: "কামারখন্দ", district: "Sirajganj", division: "Rajshahi", lat: 24.3667, lng: 89.6500 },
  { nameEn: "Chauhali", nameBn: "চৌহালী", district: "Sirajganj", division: "Rajshahi", lat: 24.2000, lng: 89.7500 },
  { nameEn: "Rajshahi Sadar", nameBn: "রাজশাহী সদর / বোয়ালিয়া", district: "Rajshahi", division: "Rajshahi", lat: 24.3636, lng: 88.6241 },
  { nameEn: "Motihar", nameBn: "মতিহার", district: "Rajshahi", division: "Rajshahi", lat: 24.3683, lng: 88.6367 },
  { nameEn: "Paba", nameBn: "পবা", district: "Rajshahi", division: "Rajshahi", lat: 24.4167, lng: 88.6500 },
  { nameEn: "Godagari", nameBn: "গোদাগাড়ী", district: "Rajshahi", division: "Rajshahi", lat: 24.4667, lng: 88.3333 },
  { nameEn: "Tanore", nameBn: "তানোর", district: "Rajshahi", division: "Rajshahi", lat: 24.5833, lng: 88.5833 },
  { nameEn: "Bagmara", nameBn: "বাগমারা", district: "Rajshahi", division: "Rajshahi", lat: 24.5667, lng: 88.8000 },
  { nameEn: "Durgapur", nameBn: "দুর্গাপুর", district: "Rajshahi", division: "Rajshahi", lat: 24.4500, lng: 88.7667 },
  { nameEn: "Charghat", nameBn: "চারঘাট", district: "Rajshahi", division: "Rajshahi", lat: 24.2833, lng: 88.7500 },
  { nameEn: "Puthia", nameBn: "পুঠিয়া", district: "Rajshahi", division: "Rajshahi", lat: 24.3667, lng: 88.8333 },
  { nameEn: "Bagha", nameBn: "বাঘা", district: "Rajshahi", division: "Rajshahi", lat: 24.1833, lng: 88.8333 },
  { nameEn: "Bogura Sadar", nameBn: "বগুড়া সদর", district: "Bogura", division: "Rajshahi", lat: 24.8500, lng: 89.3667 },
  { nameEn: "Sherpur", nameBn: "শেরপুর", district: "Bogura", division: "Rajshahi", lat: 24.6667, lng: 89.4167 },
  { nameEn: "Shibganj", nameBn: "শিবগঞ্জ", district: "Bogura", division: "Rajshahi", lat: 24.9833, lng: 89.3167 },
  { nameEn: "Gabtali", nameBn: "গাবতলী", district: "Bogura", division: "Rajshahi", lat: 24.8833, lng: 89.5167 },
  { nameEn: "Dhunat", nameBn: "ধুনট", district: "Bogura", division: "Rajshahi", lat: 24.6833, lng: 89.5333 },
  { nameEn: "Shajahanpur", nameBn: "শাজাহানপুর", district: "Bogura", division: "Rajshahi", lat: 24.7667, lng: 89.3667 },
  { nameEn: "Pabna Sadar", nameBn: "পাবনা সদর", district: "Pabna", division: "Rajshahi", lat: 24.0000, lng: 89.2500 },
  { nameEn: "Ishwardi", nameBn: "ঈশ্বরদী", district: "Pabna", division: "Rajshahi", lat: 24.1500, lng: 89.0667 },
  { nameEn: "Chatmohar", nameBn: "চাটমোহর", district: "Pabna", division: "Rajshahi", lat: 24.2333, lng: 89.2833 },
  { nameEn: "Santhia", nameBn: "সাঁথিয়া", district: "Pabna", division: "Rajshahi", lat: 24.0667, lng: 89.5333 },
  { nameEn: "Bera", nameBn: "বেড়া", district: "Pabna", division: "Rajshahi", lat: 24.0667, lng: 89.6167 },
  { nameEn: "Sujanagar", nameBn: "সুজানগর", district: "Pabna", division: "Rajshahi", lat: 23.9167, lng: 89.4333 },
  { nameEn: "Natore Sadar", nameBn: "নাটোর সদর", district: "Natore", division: "Rajshahi", lat: 24.4167, lng: 88.9833 },
  { nameEn: "Singra", nameBn: "সিংড়া", district: "Natore", division: "Rajshahi", lat: 24.5000, lng: 89.1500 },
  { nameEn: "Baraigram", nameBn: "বড়াইগ্রাম", district: "Natore", division: "Rajshahi", lat: 24.3000, lng: 89.1667 },
  { nameEn: "Gurudaspur", nameBn: "গুরুদাসপুর", district: "Natore", division: "Rajshahi", lat: 24.3667, lng: 89.2500 },
  { nameEn: "Naogaon Sadar", nameBn: "নওগাঁ সদর", district: "Naogaon", division: "Rajshahi", lat: 24.8167, lng: 88.9500 },
  { nameEn: "Manda", nameBn: "মান্দা", district: "Naogaon", division: "Rajshahi", lat: 24.7833, lng: 88.6667 },
  { nameEn: "Patnitala", nameBn: "পত্নীতলা", district: "Naogaon", division: "Rajshahi", lat: 25.0500, lng: 88.7333 },
  { nameEn: "Joypurhat Sadar", nameBn: "জয়পুরহাট সদর", district: "Joypurhat", division: "Rajshahi", lat: 25.1000, lng: 89.0333 },
  { nameEn: "Panchbibi", nameBn: "পাঁচবিবি", district: "Joypurhat", division: "Rajshahi", lat: 25.1833, lng: 89.0167 },
  { nameEn: "Chapainawabganj Sadar", nameBn: "চাঁপাইনবাবগঞ্জ সদর", district: "Chapainawabganj", division: "Rajshahi", lat: 24.6000, lng: 88.2667 },
  { nameEn: "Shibganj", nameBn: "শিবগঞ্জ", district: "Chapainawabganj", division: "Rajshahi", lat: 24.6833, lng: 88.1667 },

  // Chattogram Division
  { nameEn: "Chattogram Sadar / Kotwali", nameBn: "চট্টগ্রাম সদর / কোতোয়ালী", district: "Chattogram", division: "Chattogram", lat: 22.3350, lng: 91.8325 },
  { nameEn: "Panchlaish", nameBn: "পাঁচলাইশ", district: "Chattogram", division: "Chattogram", lat: 22.3667, lng: 91.8333 },
  { nameEn: "Halishahar", nameBn: "হালিশহর", district: "Chattogram", division: "Chattogram", lat: 22.3167, lng: 91.7833 },
  { nameEn: "Patiya", nameBn: "পটিয়া", district: "Chattogram", division: "Chattogram", lat: 22.3000, lng: 91.9833 },
  { nameEn: "Hathazari", nameBn: "হাটহাজারী", district: "Chattogram", division: "Chattogram", lat: 22.5000, lng: 91.8000 },
  { nameEn: "Sitakunda", nameBn: "সীতাকুণ্ড", district: "Chattogram", division: "Chattogram", lat: 22.6167, lng: 91.6667 },
  { nameEn: "Mirsharai", nameBn: "মীরসরাই", district: "Chattogram", division: "Chattogram", lat: 22.7667, lng: 91.5833 },
  { nameEn: "Raozan", nameBn: "রাউজান", district: "Chattogram", division: "Chattogram", lat: 22.5333, lng: 91.9167 },
  { nameEn: "Rangunia", nameBn: "রাঙ্গুনিয়া", district: "Chattogram", division: "Chattogram", lat: 22.4500, lng: 92.0500 },
  { nameEn: "Anwara", nameBn: "আনোয়ারা", district: "Chattogram", division: "Chattogram", lat: 22.2167, lng: 91.9167 },
  { nameEn: "Banshkhali", nameBn: "বাঁশখালী", district: "Chattogram", division: "Chattogram", lat: 22.0333, lng: 91.9500 },
  { nameEn: "Cox's Bazar Sadar", nameBn: "কক্সবাজার সদর", district: "Cox's Bazar", division: "Chattogram", lat: 21.4333, lng: 91.9833 },
  { nameEn: "Chakaria", nameBn: "চকোরিয়া", district: "Cox's Bazar", division: "Chattogram", lat: 21.7833, lng: 92.0833 },
  { nameEn: "Teknaf", nameBn: "টেকনাফ", district: "Cox's Bazar", division: "Chattogram", lat: 20.8667, lng: 92.3000 },
  { nameEn: "Ukhiya", nameBn: "উখিয়া", district: "Cox's Bazar", division: "Chattogram", lat: 21.2833, lng: 92.1500 },
  { nameEn: "Ramu", nameBn: "রামু", district: "Cox's Bazar", division: "Chattogram", lat: 21.4333, lng: 92.1000 },
  { nameEn: "Cumilla Sadar", nameBn: "কুমিল্লা সদর", district: "Cumilla", division: "Chattogram", lat: 23.4607, lng: 91.1809 },
  { nameEn: "Daudkandi", nameBn: "দাউদকান্দি", district: "Cumilla", division: "Chattogram", lat: 23.5333, lng: 90.7167 },
  { nameEn: "Debidwar", nameBn: "দেবিদ্বার", district: "Cumilla", division: "Chattogram", lat: 23.6000, lng: 90.9833 },
  { nameEn: "Laksam", nameBn: "লাকসাম", district: "Cumilla", division: "Chattogram", lat: 23.2333, lng: 91.1167 },
  { nameEn: "Chandpur Sadar", nameBn: "চাঁদপুর সদর", district: "Chandpur", division: "Chattogram", lat: 23.2333, lng: 90.6667 },
  { nameEn: "Hajiganj", nameBn: "হাজীগঞ্জ", district: "Chandpur", division: "Chattogram", lat: 23.2500, lng: 90.8500 },
  { nameEn: "Feni Sadar", nameBn: "ফেনী সদর", district: "Feni", division: "Chattogram", lat: 23.0167, lng: 91.4000 },
  { nameEn: "Noakhali Sadar", nameBn: "নোয়াখালী সদর", district: "Noakhali", division: "Chattogram", lat: 22.8333, lng: 91.1000 },
  { nameEn: "Begumganj", nameBn: "বেগমগঞ্জ", district: "Noakhali", division: "Chattogram", lat: 22.9500, lng: 91.1000 },
  { nameEn: "Brahmanbaria Sadar", nameBn: "ব্রাহ্মণবাড়িয়া সদর", district: "Brahmanbaria", division: "Chattogram", lat: 23.9500, lng: 91.1167 },
  { nameEn: "Ashuganj", nameBn: "আশুগঞ্জ", district: "Brahmanbaria", division: "Chattogram", lat: 24.0333, lng: 91.0000 },
  { nameEn: "Rangamati Sadar", nameBn: "রাঙ্গামাটি সদর", district: "Rangamati", division: "Chattogram", lat: 22.6500, lng: 92.1833 },
  { nameEn: "Bandarban Sadar", nameBn: "বান্দরবান সদর", district: "Bandarban", division: "Chattogram", lat: 22.1833, lng: 92.2167 },
  { nameEn: "Khagrachhari Sadar", nameBn: "খাগড়াছড়ি সদর", district: "Khagrachhari", division: "Chattogram", lat: 23.1000, lng: 91.9667 },

  // Khulna Division
  { nameEn: "Khulna Sadar", nameBn: "খুলনা সদর", district: "Khulna", division: "Khulna", lat: 22.8167, lng: 89.5500 },
  { nameEn: "Sonadanga", nameBn: "সোনাডাঙ্গা", district: "Khulna", division: "Khulna", lat: 22.8167, lng: 89.5333 },
  { nameEn: "Daulatpur", nameBn: "দৌলতপুর", district: "Khulna", division: "Khulna", lat: 22.8833, lng: 89.5167 },
  { nameEn: "Dumuria", nameBn: "ডুমুরিয়া", district: "Khulna", division: "Khulna", lat: 22.8000, lng: 89.4167 },
  { nameEn: "Rupsha", nameBn: "রূপসা", district: "Khulna", division: "Khulna", lat: 22.8333, lng: 89.5833 },
  { nameEn: "Jashore Sadar", nameBn: "যশোর সদর", district: "Jashore", division: "Khulna", lat: 23.1667, lng: 89.2167 },
  { nameEn: "Jhikargacha", nameBn: "ঝিকরগাছা", district: "Jashore", division: "Khulna", lat: 23.1000, lng: 89.1333 },
  { nameEn: "Kushtia Sadar", nameBn: "কুষ্টিয়া সদর", district: "Kushtia", division: "Khulna", lat: 23.9000, lng: 89.1333 },
  { nameEn: "Kumarkhali", nameBn: "কুমারখালী", district: "Kushtia", division: "Khulna", lat: 23.8667, lng: 89.2500 },
  { nameEn: "Jhenaidah Sadar", nameBn: "ঝিনাইদহ সদর", district: "Jhenaidah", division: "Khulna", lat: 23.5333, lng: 89.1833 },
  { nameEn: "Kaliganj", nameBn: "কালীগঞ্জ", district: "Jhenaidah", division: "Khulna", lat: 23.4167, lng: 89.1333 },
  { nameEn: "Satkhira Sadar", nameBn: "সাতক্ষীরা সদর", district: "Satkhira", division: "Khulna", lat: 22.7167, lng: 89.0833 },
  { nameEn: "Bagerhat Sadar", nameBn: "বাগেরহাট সদর", district: "Bagerhat", division: "Khulna", lat: 22.6667, lng: 89.7833 },
  { nameEn: "Mongla", nameBn: "মোংলা", district: "Bagerhat", division: "Khulna", lat: 22.4833, lng: 89.6000 },
  { nameEn: "Chuadanga Sadar", nameBn: "চুয়াডাঙ্গা সদর", district: "Chuadanga", division: "Khulna", lat: 23.6333, lng: 88.8500 },
  { nameEn: "Magura Sadar", nameBn: "মাগুরা সদর", district: "Magura", division: "Khulna", lat: 23.4833, lng: 89.4167 },
  { nameEn: "Narail Sadar", nameBn: "নড়াইল সদর", district: "Narail", division: "Khulna", lat: 23.1667, lng: 89.5000 },
  { nameEn: "Meherpur Sadar", nameBn: "মেহেরপুর সদর", district: "Meherpur", division: "Khulna", lat: 23.7667, lng: 88.6333 },

  // Sylhet Division
  { nameEn: "Sylhet Sadar / Kotwali", nameBn: "সিলেট সদর / কোতোয়ালী", district: "Sylhet", division: "Sylhet", lat: 24.8949, lng: 91.8687 },
  { nameEn: "South Surma", nameBn: "দক্ষিণ সুরমা", district: "Sylhet", division: "Sylhet", lat: 24.8500, lng: 91.8667 },
  { nameEn: "Beanibazar", nameBn: "বিয়ানীবাজার", district: "Sylhet", division: "Sylhet", lat: 24.8333, lng: 92.1667 },
  { nameEn: "Golapganj", nameBn: "গোলাপগঞ্জ", district: "Sylhet", division: "Sylhet", lat: 24.8667, lng: 92.0167 },
  { nameEn: "Moulvibazar Sadar", nameBn: "মৌলভীবাজার সদর", district: "Moulvibazar", division: "Sylhet", lat: 24.4833, lng: 91.7667 },
  { nameEn: "Sreemangal", nameBn: "শ্রীমঙ্গল", district: "Moulvibazar", division: "Sylhet", lat: 24.3000, lng: 91.7333 },
  { nameEn: "Habiganj Sadar", nameBn: "হবিগঞ্জ সদর", district: "Habiganj", division: "Sylhet", lat: 24.3833, lng: 91.4167 },
  { nameEn: "Sunamganj Sadar", nameBn: "সুনামগঞ্জ সদর", district: "Sunamganj", division: "Sylhet", lat: 25.0667, lng: 91.4000 },

  // Barishal Division
  { nameEn: "Barishal Sadar / Kotwali", nameBn: "বরিশাল সদর / কোতোয়ালী", district: "Barishal", division: "Barishal", lat: 22.7010, lng: 90.3535 },
  { nameEn: "Gournadi", nameBn: "গৌরনদী", district: "Barishal", division: "Barishal", lat: 22.9667, lng: 90.2333 },
  { nameEn: "Bhola Sadar", nameBn: "ভোলা সদর", district: "Bhola", division: "Barishal", lat: 22.6833, lng: 90.6500 },
  { nameEn: "Patuakhali Sadar", nameBn: "পটুয়াখালী সদর", district: "Patuakhali", division: "Barishal", lat: 22.3500, lng: 90.3333 },
  { nameEn: "Kuakata / Kalapara", nameBn: "কুয়াকাটা / কলাপাড়া", district: "Patuakhali", division: "Barishal", lat: 21.8167, lng: 90.1500 },
  { nameEn: "Pirojpur Sadar", nameBn: "পিরোজপুর সদর", district: "Pirojpur", division: "Barishal", lat: 22.5833, lng: 89.9667 },
  { nameEn: "Barguna Sadar", nameBn: "বরগুনা সদর", district: "Barguna", division: "Barishal", lat: 22.1500, lng: 90.1167 },
  { nameEn: "Jhalokathi Sadar", nameBn: "ঝালকাঠি সদর", district: "Jhalokathi", division: "Barishal", lat: 22.6417, lng: 90.2000 },

  // Rangpur Division
  { nameEn: "Rangpur Sadar", nameBn: "রংপুর সদর", district: "Rangpur", division: "Rangpur", lat: 25.7500, lng: 89.2500 },
  { nameEn: "Pirganj", nameBn: "পীরগঞ্জ", district: "Rangpur", division: "Rangpur", lat: 25.4167, lng: 89.3167 },
  { nameEn: "Dinajpur Sadar", nameBn: "দিনাজপুর সদর", district: "Dinajpur", division: "Rangpur", lat: 25.6167, lng: 88.6333 },
  { nameEn: "Saidpur", nameBn: "সৈয়দপুর", district: "Nilphamari", division: "Rangpur", lat: 25.7833, lng: 88.9000 },
  { nameEn: "Nilphamari Sadar", nameBn: "নীলফামারী সদর", district: "Nilphamari", division: "Rangpur", lat: 25.9333, lng: 88.8500 },
  { nameEn: "Kurigram Sadar", nameBn: "কুড়িগ্রাম সদর", district: "Kurigram", division: "Rangpur", lat: 25.8167, lng: 89.6500 },
  { nameEn: "Gaibandha Sadar", nameBn: "গাইবান্ধা সদর", district: "Gaibandha", division: "Rangpur", lat: 25.3333, lng: 89.5333 },
  { nameEn: "Gobindaganj", nameBn: "গোবিন্দগঞ্জ", district: "Gaibandha", division: "Rangpur", lat: 25.1333, lng: 89.3833 },
  { nameEn: "Thakurgaon Sadar", nameBn: "ঠাকুরগাঁও সদর", district: "Thakurgaon", division: "Rangpur", lat: 26.0333, lng: 88.4667 },
  { nameEn: "Panchagarh Sadar", nameBn: "পঞ্চগড় সদর", district: "Panchagarh", division: "Rangpur", lat: 26.3333, lng: 88.5500 },
  { nameEn: "Lalmonirhat Sadar", nameBn: "লালমনিরহাট সদর", district: "Lalmonirhat", division: "Rangpur", lat: 25.9167, lng: 89.4500 },

  // Mymensingh Division
  { nameEn: "Mymensingh Sadar / Kotwali", nameBn: "ময়মনসিংহ সদর / কোতোয়ালী", district: "Mymensingh", division: "Mymensingh", lat: 24.7500, lng: 90.4000 },
  { nameEn: "Muktagacha", nameBn: "মুক্তাগাছা", district: "Mymensingh", division: "Mymensingh", lat: 24.7667, lng: 90.2667 },
  { nameEn: "Trishal", nameBn: "ত্রিশাল", district: "Mymensingh", division: "Mymensingh", lat: 24.5833, lng: 90.4000 },
  { nameEn: "Bhaluka", nameBn: "ভালুকা", district: "Mymensingh", division: "Mymensingh", lat: 24.3833, lng: 90.3833 },
  { nameEn: "Jamalpur Sadar", nameBn: "জামালপুর সদর", district: "Jamalpur", division: "Mymensingh", lat: 24.9167, lng: 89.9500 },
  { nameEn: "Sarishabari", nameBn: "সরিষাবাড়ী", district: "Jamalpur", division: "Mymensingh", lat: 24.7500, lng: 89.8333 },
  { nameEn: "Sherpur Sadar", nameBn: "শেরপুর সদর", district: "Sherpur", division: "Mymensingh", lat: 25.0167, lng: 90.0167 },
  { nameEn: "Netrokona Sadar", nameBn: "নেত্রকোণা সদর", district: "Netrokona", division: "Mymensingh", lat: 24.8833, lng: 90.7333 },
];

/**
 * Calculates straight line distance in KM using Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371; // Earth radius in KM
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Finds the nearest Bangladesh upazila/district to the given GPS coordinates
 */
export function findNearestLocation(
  lat: number,
  lng: number,
  locationsList: BDLocation[] = BANGLADESH_LOCATIONS
): { location: BDLocation; distanceKm: number } | null {
  let closest: BDLocation | null = null;
  let minDistance = Infinity;

  for (const loc of locationsList) {
    if (loc.lat != null && loc.lng != null) {
      const d = calculateDistanceKm(lat, lng, loc.lat, loc.lng);
      if (d < minDistance) {
        minDistance = d;
        closest = loc;
      }
    }
  }

  if (!closest) return null;
  return { location: closest, distanceKm: minDistance };
}
