import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, users, professionalProfiles } from "@/db/schema";

const categoryList = [
  { slug: "electrician", nameEn: "Electrician", nameBn: "ইলেকট্রিশিয়ান", icon: "zap" },
  { slug: "plumber", nameEn: "Plumber", nameBn: "প্লাম্বার", icon: "droplet" },
  { slug: "ac-repair", nameEn: "AC Repair", nameBn: "এসি মেরামত", icon: "wind" },
  { slug: "cleaning", nameEn: "House Cleaning", nameBn: "বাসা পরিষ্কার", icon: "sparkles" },
  { slug: "painter", nameEn: "Painter", nameBn: "রং মিস্ত্রি", icon: "paintbrush" },
  { slug: "carpenter", nameEn: "Carpenter", nameBn: "কাঠমিস্ত্রি", icon: "hammer" },
  { slug: "mobile-repair", nameEn: "Mobile Repair", nameBn: "মোবাইল মেরামত", icon: "smartphone" },
  { slug: "internet-tech", nameEn: "Internet Technician", nameBn: "ইন্টারনেট টেকনিশিয়ান", icon: "wifi" },
  { slug: "mechanic", nameEn: "Bike/Car Mechanic", nameBn: "বাইক/গাড়ি মেকানিক", icon: "wrench" },
  { slug: "cctv", nameEn: "CCTV Installer", nameBn: "সিসিটিভি ইনস্টলার", icon: "camera" },
  { slug: "tutor", nameEn: "Home Tutor", nameBn: "হোম টিউটর", icon: "book-open" },
];

async function upsertCategory(cat: (typeof categoryList)[number]) {
  const existing = await db.query.categories.findFirst({ where: eq(categories.slug, cat.slug) });
  if (existing) return existing;
  const [created] = await db.insert(categories).values(cat).returning();
  return created;
}

async function main() {
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
        name: "Admin",
        email: "admin@sohojservice.com",
        passwordHash,
        role: "ADMIN",
      })
      .returning();
  }

  // Demo professional
  let proUser = await db.query.users.findFirst({
    where: eq(users.email, "karim.electrician@example.com"),
  });
  if (!proUser) {
    const passwordHash = await bcrypt.hash("pro12345", 10);
    [proUser] = await db
      .insert(users)
      .values({
        name: "Karim Sheikh",
        email: "karim.electrician@example.com",
        phone: "01700000000",
        passwordHash,
        role: "PROFESSIONAL",
      })
      .returning();
  }

  const electrician = await db.query.categories.findFirst({
    where: eq(categories.slug, "electrician"),
  });

  if (electrician && proUser) {
    const existingProfile = await db.query.professionalProfiles.findFirst({
      where: eq(professionalProfiles.userId, proUser.id),
    });
    if (!existingProfile) {
      await db.insert(professionalProfiles).values({
        userId: proUser.id,
        categoryId: electrician.id,
        bio: "10 years experience in home and shop wiring.",
        area: "Sirajganj Sadar",
        city: "Sirajganj",
        yearsExperience: 10,
        ratePerVisit: 300,
        isVerified: true,
      });
    }
  }

  console.log("Seed complete.");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
