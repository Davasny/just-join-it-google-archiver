import { z } from "zod";

const jjCategorySchema = z.enum([
  "data",
  "java",
  "other",
  "pm",
  "analytics",
  "testing",
  "devops",
  "ai",
  "javascript",
  "security",
  "architecture",
  "erp",
  "python",
  "net",
  "admin",
  "support",
  "mobile",
  "ux",
  "c",
  "go",
  "php",
  "game",
  "ruby",
  "scala",
  "html",
]);

export type jjCategory = z.infer<typeof jjCategorySchema>;

const jjCompanyLocationSchema = z.object({
  city: z.string(),
  street: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  slug: z.string().min(1),
});

const jjEmploymentTypeSchema = z.object({
  from: z.number().min(1).nullable(),
  fromPerUnit: z.number().min(1).nullable(),

  to: z.number().min(1).nullable(),
  toPerUnit: z.number().min(1).nullable(),

  currency: z.enum(["PLN", "GBP", "CHF", "EUR", "USD"]),
  currencySource: z.enum(["conversion", "original"]),

  type: z.enum([
    "b2b",
    "permanent",
    "permament",
    "any",
    "internship",
    "mandate_contract",
  ]),

  unit: z.enum([
    "hour",
    "Hour",
    "day",
    "Day",
    "month",
    "Month",
    "year",
    "Year",
  ]),

  gross: z.boolean(),
});

const jjSkillSchema = z.object({
  name: z.string().min(1),
  level: z.number(),
});

const jjLanguageSchema = z.object({
  code: z.string().min(1),
  level: z.string().min(1),
});

export const jjOfferSchema = z.object({
  guid: z.guid(),

  title: z.string().min(1),
  slug: z.string().min(1),

  workplaceType: z.enum(["hybrid", "office", "remote"]),
  workingTime: z.enum([
    "full_time",
    "part_time",
    "b2b_contract",
    "freelance",
    "internship",
  ]),

  experienceLevel: z.enum([
    "junior",
    "mid",
    "senior",
    "manager",
    "c_level",
    "intern",
  ]),

  category: z.object({
    key: jjCategorySchema,
    parentKey: z.string().min(1).nullable(),
  }),

  city: z.string(),
  street: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  locations: z.array(jjCompanyLocationSchema),

  isRemoteInterview: z.boolean(),

  companyName: z.string(),
  companyLogoThumbUrl: z.string(),

  isOpenToHireUkrainians: z.boolean(),

  employmentTypes: z.array(jjEmploymentTypeSchema),
  requiredSkills: z.array(jjSkillSchema),
  niceToHaveSkills: z.array(jjSkillSchema),
  languages: z.array(jjLanguageSchema),

  isPromoted: z.boolean(),
  isSuperOffer: z.boolean(),
  applyMethod: z.enum(["form", "external"]),

  publishedAt: z.iso.datetime(),
  lastPublishedAt: z.iso.datetime(),
  expiredAt: z.iso.datetime(),
});

export type jjOffer = z.infer<typeof jjOfferSchema>;
