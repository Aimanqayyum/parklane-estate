import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';
import { groupMenu } from '@/lib/listingMenu';
import type { ListingMenu, MenuRow } from '@/types/property';

export const LISTING_MENU_QUERY_KEY = ['listing-menu'] as const;

const FIVE_MINUTES = 5 * 60 * 1000;

/**
 * The Buy / Rent menu (purposes -> categories, with live counts) from the
 * `get_listing_menu()` database function. One request, cached for 5 minutes.
 * Header, listing page, filters and the admin form all read from this.
 */
export function useListingMenu() {
  const query = useQuery({
    queryKey: LISTING_MENU_QUERY_KEY,
    staleTime: FIVE_MINUTES,
    queryFn: async (): Promise<MenuRow[]> => {
      const { data, error } = await supabase.rpc('get_listing_menu');
      if (error) throw error;
      return (data ?? []) as MenuRow[];
    },
  });

  const menu: ListingMenu = useMemo(() => groupMenu(query.data ?? []), [query.data]);

  return {
    menu,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
