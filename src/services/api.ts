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

export const api = {
  client: supabase,
  auth: authService,
  profiles: profileService,
  services: servicesService,
  activity: activityService,
  transactions: transactionsService,
};

export type Api = typeof api;