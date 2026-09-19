import { seoType } from "./objects/seo";
import { socialLinkType } from "./objects/socialLink";
import { customHtmlType } from "./objects/customHtml";
import { siteSettingsType } from "./singletons/siteSettings";
import { navigationType } from "./singletons/navigation";
import { homePageType } from "./singletons/homePage";
import { pricingPlanType } from "./documents/pricingPlan";
import { announcementType } from "./documents/announcement";

export const schemaTypes = [
  // Objects
  seoType,
  socialLinkType,
  customHtmlType,
  // Singletons
  siteSettingsType,
  navigationType,
  homePageType,
  // Collections
  pricingPlanType,
  announcementType,
];
