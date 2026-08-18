import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { db } from "@/db";
import { categories, users, professionalProfiles } from "@/db/schema";

export const categoryList = [
  { slug: "electrician", nameEn: "Electrician", nameBn: "ইলেকট্রিশিয়ান", icon: "zap" },
  { slug: "plumber", nameEn: "Plumber", nameBn: "প্লাম্বার", icon: "droplet" },
  { slug: "ac-repair", nameEn: "AC Repair", nameBn: "এসি মেরামত", icon: "wind" },
  { slug: "fridge-repair", nameEn: "Refrigerator & Freezer", nameBn: "ফ্রিজ মেরামত", icon: "snowflake" },
  { slug: "cleaning", nameEn: "House Cleaning", nameBn: "বাসা পরিষ্কার", icon: "sparkles" },
  { slug: "painter", nameEn: "Painter", nameBn: "রং মিস্ত্রি", icon: "paintbrush" },
  { slug: "carpenter", nameEn: "Carpenter", nameBn: "কাঠমিস্ত্রি", icon: "hammer" },
  { slug: "mobile-repair", nameEn: "Mobile Phone Repair", nameBn: "মোবাইল মেরামত", icon: "smartphone" },
  { slug: "computer-repair", nameEn: "Computer & Laptop Repair", nameBn: "কম্পিউটার ও ল্যাপটপ", icon: "monitor" },
  { slug: "internet-tech", nameEn: "Internet & WiFi Setup", nameBn: "ইন্টারনেট টেকনিশিয়ান", icon: "wifi" },
  { slug: "mechanic", nameEn: "Bike & Car Mechanic", nameBn: "বাইক/গাড়ি মেকানিক", icon: "wrench" },
  { slug: "cctv", nameEn: "CCTV & Security Camera", nameBn: "সিসিটিভি ইনস্টলার", icon: "camera" },
  { slug: "tutor", nameEn: "Home Tutor", nameBn: "হোম টিউটর", icon: "book-open" },
  { slug: "generator-ips", nameEn: "IPS & Generator Service", nameBn: "আইপিএস ও জেনারেটর", icon: "battery-charging" },
  { slug: "solar-panel", nameEn: "Solar Panel Installation", nameBn: "সোলার প্যানেল", icon: "sun" },
  { slug: "gas-stove", nameEn: "Gas Stove & Geyser Repair", nameBn: "গ্যাস চুলা ও গিজার", icon: "flame" },
  { slug: "water-filter", nameEn: "Water Purifier & Filter", nameBn: "ওয়াটার ফিল্টার", icon: "filter" },
  { slug: "motor-pump", nameEn: "Water Motor & Pump Repair", nameBn: "পানি মোটর ও পাম্প", icon: "activity" },
  { slug: "pest-control", nameEn: "Pest Control & Fumigation", nameBn: "কীটপতঙ্গ ও পোকা দমন", icon: "shield" },
  { slug: "welding-fabricator", nameEn: "Welding & Grill Maker", nameBn: "ওয়েল্ডিং ও গ্রিল মিস্ত্রি", icon: "tool" },
  { slug: "masonry-tiles", nameEn: "Tiles & Rajmistri Work", nameBn: "টাইলস ও রাজমিস্ত্রি", icon: "grid" },
  { slug: "shifting-movers", nameEn: "Home Shifting & Movers", nameBn: "বাসা বদল ও পরিবহন", icon: "truck" },
  { slug: "tv-repair", nameEn: "TV & LED Display Repair", nameBn: "টিভি মেরামত", icon: "tv" },
  { slug: "beauty-salon", nameEn: "Home Beauty & Salon", nameBn: "হোম পার্লার ও সেলুন", icon: "scissors" },
  { slug: "photography", nameEn: "Event Photography", nameBn: "ইভেন্ট ফটোগ্রাফি", icon: "aperture" },
  { slug: "septic-cleaning", nameEn: "Septic Tank & Sewerage", nameBn: "পয়ঃনিষ্কাশন ও ট্যাঙ্ক", icon: "trash" },
];

async function upsertCategory(cat: (typeof categoryList)[number]) {
  const existing = await db.query.categories.findFirst({ where: eq(categories.slug, cat.slug) });
  if (existing) {
    // Update names if changed
    const [updated] = await db
      .update(categories)
      .set({ nameEn: cat.nameEn, nameBn: cat.nameBn, icon: cat.icon })
      .where(eq(categories.id, existing.id))
      .returning();
    return updated;
  }
  const [created] = await db
    .insert(categories)
    .values({
      id: createId(),
      ...cat,
    })
    .returning();
  return created;
}

async function main() {
  console.log(`Seeding ${categoryList.length} categories...`);
  for (const cat of categoryList) {
    await upsertCategory(cat);
  }

  // Demo admin
  let admin = await db.query.users.findFirst({ where: eq(users.email, "admin@sohojservice.com") });
  if (!admin) {
    const passwordHash = await bcrypt.hash("admin1234", 10);
    [admin] = await db
      .insert(users)
      .values({
        id: createId(),
        name: "Admin",
        email: "admin@sohojservice.com",
        phone: "01711000000",
        passwordHash,
        role: "ADMIN",
        emailVerified: true,
      })
      .returning();
  }

  console.log("Seed complete. Categories count:", categoryList.length);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
