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
};

export type Api = typeof api;