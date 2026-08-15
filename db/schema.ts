import {
  pgTable,
  text,
  timestamp,
  integer,
  doublePrecision,
  boolean,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

export const roleEnum = pgEnum("role", ["CUSTOMER", "PROFESSIONAL", "ADMIN"]);
export const bookingStatusEnum = pgEnum("booking_status", [
  "PENDING",
  "ACCEPTED",
  "DECLINED",
  "COMPLETED",
  "CANCELLED",
]);

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  photoUrl: text("photo_url"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  locationUpdatedAt: timestamp("location_updated_at"),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("CUSTOMER"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const categories = pgTable("categories", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameBn: text("name_bn").notNull(),
  icon: text("icon").notNull().default("wrench"),
});

export const professionalProfiles = pgTable(
  "professional_profiles",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id),
    bio: text("bio").notNull().default(""),
    area: text("area").notNull(),
    city: text("city").notNull().default("Sirajganj"),
    yearsExperience: integer("years_experience").notNull().default(0),
    ratePerVisit: integer("rate_per_visit"),
    isVerified: boolean("is_verified").notNull().default(false),
    isAvailable: boolean("is_available").notNull().default(true),
    photoUrl: text("photo_url"),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("professional_profiles_user_id_idx").on(table.userId)]
);

export const bookings = pgTable("bookings", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  customerId: text("customer_id")
    .notNull()
    .references(() => users.id),
  professionalId: text("professional_id")
    .notNull()
    .references(() => professionalProfiles.id),
  status: bookingStatusEnum("status").notNull().default("PENDING"),
  problemNote: text("problem_note").notNull(),
  address: text("address").notNull(),
  preferredDate: timestamp("preferred_date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const reviews = pgTable(
  "reviews",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    bookingId: text("booking_id").references(() => bookings.id),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    professionalId: text("professional_id")
      .notNull()
      .references(() => professionalProfiles.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    comment: text("comment").notNull().default(""),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("reviews_booking_id_idx").on(table.bookingId),
    uniqueIndex("reviews_author_professional_idx").on(table.authorId, table.professionalId),
  ]
);

// Relations (so Drizzle's query API can do nested selects, e.g. booking.professional.user)
export const usersRelations = relations(users, ({ one, many }) => ({
  professional: one(professionalProfiles, {
    fields: [users.id],
    references: [professionalProfiles.userId],
  }),
  bookingsMade: many(bookings),
  reviewsWritten: many(reviews),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  professionals: many(professionalProfiles),
}));

export const professionalProfilesRelations = relations(
  professionalProfiles,
  ({ one, many }) => ({
    user: one(users, {
      fields: [professionalProfiles.userId],
      references: [users.id],
    }),
    category: one(categories, {
      fields: [professionalProfiles.categoryId],
      references: [categories.id],
    }),
    bookings: many(bookings),
    reviews: many(reviews),
  })
);

export const bookingsRelations = relations(bookings, ({ one }) => ({
  customer: one(users, {
    fields: [bookings.customerId],
    references: [users.id],
  }),
  professional: one(professionalProfiles, {
    fields: [bookings.professionalId],
    references: [professionalProfiles.id],
  }),
  review: one(reviews, {
    fields: [bookings.id],
    references: [reviews.bookingId],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.id],
  }),
  author: one(users, {
    fields: [reviews.authorId],
    references: [users.id],
  }),
  professional: one(professionalProfiles, {
    fields: [reviews.professionalId],
    references: [professionalProfiles.id],
  }),
}));
