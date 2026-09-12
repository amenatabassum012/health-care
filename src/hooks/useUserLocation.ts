import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { supabase } from "../lib/supabaseClient";

import {
  saveUserLocation,
} from "../lib/location";

import type {
  UserRole,
} from "../lib/location";

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
  sharing: boolean;
}

export function useUserLocation(
  userId: string | null,
  role: UserRole
) {
  const [location, setLocation] =
    useState<LocationState>({
      latitude: null,
      longitude: null,
      accuracy: null,
      loading: true,
      error: null,
      sharing: false,
    });

  const watchId =
    useRef<number | null>(null);

  const startLocationSharing =
    useCallback(async () => {

      if (!navigator.geolocation) {
        setLocation((prev) => ({
          ...prev,
          loading: false,
          error:
            "Location is not supported by this browser.",
        }));

        return;
      }

      if (watchId.current !== null) {
        return;
      }

      let currentUserId = userId;

      /*
       * Get the logged-in Supabase user
       * if a userId was not supplied.
       */
      if (!currentUserId) {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          currentUserId =
            user?.id ?? null;
        } catch (error) {
          console.error(
            "Could not get current user:",
            error
          );
        }
      }

      setLocation((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      watchId.current =
        navigator.geolocation.watchPosition(
          async (position) => {

            const latitude =
              position.coords.latitude;

            const longitude =
              position.coords.longitude;

            const accuracy =
              position.coords.accuracy;

            console.log(
              "📍 Current Location"
            );

            console.log(
              "Latitude:",
              latitude
            );

            console.log(
              "Longitude:",
              longitude
            );

            console.log(
              "Accuracy:",
              accuracy,
              "meters"
            );

            setLocation({
              latitude,
              longitude,
              accuracy,
              loading: false,
              error: null,
              sharing: true,
            });

            /*
             * Save only when a real
             * authenticated user exists.
             */
            if (currentUserId) {
              try {
                await saveUserLocation(
                  currentUserId,
                  role,
                  latitude,
                  longitude,
                  accuracy
                );

                console.log(
                  "✅ Location saved"
                );
              } catch (error) {
                console.error(
                  "Could not save location:",
                  error
                );
              }
            }
          },

          (error) => {

            let message =
              "Unable to get your location.";

            if (
              error.code ===
              error.PERMISSION_DENIED
            ) {
              message =
                "Location permission was denied. Please allow location access.";
            }

            if (
              error.code ===
              error.POSITION_UNAVAILABLE
            ) {
              message =
                "Your location is currently unavailable.";
            }

            if (
              error.code ===
              error.TIMEOUT
            ) {
              message =
                "Location request timed out. Please try again.";
            }

            console.error(
              "Location error:",
              message
            );

            setLocation((prev) => ({
              ...prev,
              loading: false,
              sharing: false,
              error: message,
            }));

            watchId.current = null;
          },

          {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 15000,
          }
        );

    }, [userId, role]);

  const stopLocationSharing =
    useCallback(() => {

      if (watchId.current !== null) {

        navigator.geolocation.clearWatch(
          watchId.current
        );

        watchId.current = null;
      }

      setLocation((prev) => ({
        ...prev,
        sharing: false,
      }));

    }, []);

  /*
   * Automatically start when dashboard opens.
   */
  useEffect(() => {

    startLocationSharing();

    return () => {

      if (watchId.current !== null) {

        navigator.geolocation.clearWatch(
          watchId.current
        );

        watchId.current = null;
      }

    };

  }, [startLocationSharing]);

  return {
    latitude: location.latitude,
    longitude: location.longitude,
    accuracy: location.accuracy,
    loading: location.loading,
    error: location.error,
    sharing: location.sharing,
    startLocationSharing,
    stopLocationSharing,
  };
}