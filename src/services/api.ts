/**
 * Unified API Gateway
 * ----------------------------------------------------------------
 * All Supabase access should flow through this module so we can
 * centralize error handling, logging, retries, and future swaps.
 */
import { supabase } from "@/integrations/supabase/client";
import { authService } from "./auth.service";
import { profileService } from "./profile.service";
import { servicesService } from "./services.service";
import { activityService } from "./activity.service";
import { transactionsService } from "./transactions.service";
import { travelService } from "./travel.service";
import { coursesService } from "./courses.service";
import { productsService } from "./products.service";
import { notificationsService } from "./notifications.service";
import { paymentService } from "./payment.service";
import { shopsService } from "./shops.service";
import { serviceListingsService } from "./serviceListings.service";
import { localListingsService } from "./localListings.service";
import { ordersService } from "./orders.service";
import { reviewsService } from "./reviews.service";
import { searchService } from "./search.service";
import { pricingEngine } from "./pricing.service";

export const api = {
  client: supabase,
  auth: authService,
  profiles: profileService,
  services: servicesService,
  activity: activityService,
  transactions: transactionsService,
  travel: travelService,
  courses: coursesService,
  products: productsService,
  notifications: notificationsService,
  payment: paymentService,
  shops: shopsService,
  serviceListings: serviceListingsService,
  localListings: localListingsService,
  orders: ordersService,
  reviews: reviewsService,
  search: searchService,
  pricing: pricingEngine,
};

export type Api = typeof api;