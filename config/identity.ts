import { defineOrganization } from "nuxt-schema-org/schema";

export const ORGANIZATION_SCHEMA_ID = "#organization";

export default defineOrganization({
  "@id": ORGANIZATION_SCHEMA_ID,
  name: "Stichting Onderwijs in",
  url: "https://onderwijsin.nl",
  logo: "https://res.cloudinary.com/onderwijsin/image/upload/w_600,c_scale/brand/OnderwijsIn_VolledigeLogo_Oranje_ljapwt.png",
  sameAs: ["https://www.linkedin.com/company/onderwijs-in"],
  email: "hallo@onderwijsin.nl",
  telephone: "(031) 824 01 04",
  contactPoints: [
    {
      telephone: "(031) 824 01 04",
      contactType: "Algemene vragen",
    },
    {
      email: "hallo@onderwijsin.nl",
      contactType: "Algemene vragen",
    },
  ],
  keywords: [
    "Onderwijs",
    "Traineeship",
    "Voortgezet onderwijs",
    "Basisonderwijs",
    "Onderwijsloket",
    "Klantreis",
    "Werving",
    "Zij-instromers",
    "Expertisecentrum",
    "Kennisbank",
    "Lerarentekort",
    "Geschiktheidsonderszoek",
    "Adviescentrum",
    "Informatiecentrum",
  ],
  address: {
    addressLocality: "Ede",
    addressRegion: "Gelderland",
    postalCode: "6717HK",
    streetAddress: "Johannes Bosboomlaan 50",
    addressCountry: "NL",
  },
  numberOfEmployees: 16,
  nonprofitStatus: "NonprofitSBBI",
  subOrganization: [
    {
      type: "Organization",
      name: "Trainees in onderwijs",
      url: "https://traineesinonderwijs.nl",
      logo: "https://res.cloudinary.com/onderwijsin/image/upload/w_600,c_scale/brand/logo_traineesindonderwijs_f2kwvx_t2wg0f.png",
    },
    {
      type: "Organization",
      name: "Onderwijsloket",
      url: "https://onderwijsloket.com",
      logo: "https://res.cloudinary.com/onderwijsin/image/upload/w_600,c_scale/brand/logo_onderwijsloket_by0ejs.png",
    },
  ],
});
