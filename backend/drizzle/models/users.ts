import {
  pgTable,
  varchar,
  primaryKey,
  text,
  serial,
  integer,
  boolean,
  date,
  timestamp,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => {
      return crypto.randomUUID();
    }), // ID with role-based prefix
  name: text("first_name").notNull(),
  lastName: text("last_name"),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("email_verified"), // Nullable
  role: text("role").notNull().default("temp"), // Founder, Investor, etc.
  location: text("location"), // Nullable (IP-based)
  gender: text("gender"), // Nullable
  lastChangeOfPitcture: timestamp("last_change_of_picture"), // Nullable
  dob: date("dob"),
  image: text("image"), // Nullable
  countryCode: varchar("country_code", { length: 5 }), // Nullable
  number: varchar("number", { length: 20 }), // Nullable
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  deletedOn: timestamp("deleted_on"), // Nullable
  journal: text("journal"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ]
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    {
      compositePk: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
      }),
    },
  ]
);

export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => [
    {
      compositePK: primaryKey({
        columns: [authenticator.userId, authenticator.credentialID],
      }),
    },
  ]
);

export const languages = pgTable("languages", {
  id: integer("id").primaryKey(),
  language_name: text("language_name").notNull(),
});

export const userLanguages = pgTable(
  "user_languages",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    languageId: integer("language_id")
      .notNull()
      .references(() => languages.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.languageId] }), // Composite Primary Key
  })
);

export const unregisteredUsers = pgTable("unregistered_users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => {
      return crypto.randomUUID();
    }),
  ip: text("ip").notNull(),
  browser: text("browser").notNull(),
  os: text("os").notNull(),
  device: text("device").notNull(),
  userAgent: text("user_agent").notNull(),
  locationData: text("location_data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Who started the session
  ip: text("ip").notNull(), // User's IP address
  postalCode: text("postal_code"),
  city: text("city"),
  state: text("state"),
  country: text("country"),
  continent: text("continent"),
  createdAt: timestamp("created_at").defaultNow(), // When the session was created
});
