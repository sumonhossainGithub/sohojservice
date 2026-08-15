export type Lang = "en" | "bn";

export const dictionary = {
  en: {
    tagline: "Trusted local help, at your doorstep",
    subtitle:
      "Find verified electricians, plumbers, tutors and more in your area — free to book, no middleman.",
    searchPlaceholder: "What do you need help with?",
    browse: "Browse professionals",
    howItWorks: "How it works",
    step1Title: "Choose a service",
    step1Body: "Pick a category like electrician, plumber, or tutor.",
    step2Title: "Pick a nearby professional",
    step2Body: "See verified profiles, ratings, and experience in your area.",
    step3Title: "Book for free",
    step3Body: "Send a request with your problem and preferred time. No fees.",
    categoriesTitle: "Popular services",
    login: "Log in",
    register: "Sign up",
    logout: "Log out",
    joinAsPro: "Join as a professional",
    forCustomers: "For customers",
    forProfessionals: "For professionals",
    dashboard: "Dashboard",
    bookNow: "Request booking",
    verified: "Verified",
    notVerified: "Pending verification",
    yearsExp: "years experience",
    perVisit: "per visit",
  },
  bn: {
    tagline: "বিশ্বস্ত স্থানীয় সেবা, আপনার দোরগোড়ায়",
    subtitle:
      "আপনার এলাকার যাচাইকৃত ইলেকট্রিশিয়ান, প্লাম্বার, টিউটর খুঁজুন — সম্পূর্ণ বিনামূল্যে বুকিং, কোনো মধ্যস্বত্বভোগী নেই।",
    searchPlaceholder: "আপনার কী সাহায্য দরকার?",
    browse: "সেবাদাতা খুঁজুন",
    howItWorks: "যেভাবে কাজ করে",
    step1Title: "সেবা বেছে নিন",
    step1Body: "ইলেকট্রিশিয়ান, প্লাম্বার বা টিউটরের মতো ক্যাটাগরি বেছে নিন।",
    step2Title: "কাছের একজন বেছে নিন",
    step2Body: "আপনার এলাকায় যাচাইকৃত প্রোফাইল, রেটিং ও অভিজ্ঞতা দেখুন।",
    step3Title: "বিনামূল্যে বুক করুন",
    step3Body: "আপনার সমস্যা ও পছন্দের সময় জানিয়ে অনুরোধ পাঠান। কোনো ফি নেই।",
    categoriesTitle: "জনপ্রিয় সেবা",
    login: "লগ ইন",
    register: "সাইন আপ",
    logout: "লগ আউট",
    joinAsPro: "সেবাদাতা হিসেবে যোগ দিন",
    forCustomers: "গ্রাহকদের জন্য",
    forProfessionals: "সেবাদাতাদের জন্য",
    dashboard: "ড্যাশবোর্ড",
    bookNow: "বুকিং অনুরোধ",
    verified: "যাচাইকৃত",
    notVerified: "যাচাই বাকি",
    yearsExp: "বছরের অভিজ্ঞতা",
    perVisit: "প্রতি ভিজিট",
  },
} as const;

export function t(lang: Lang, key: keyof typeof dictionary["en"]) {
  return dictionary[lang][key] ?? dictionary.en[key];
}
