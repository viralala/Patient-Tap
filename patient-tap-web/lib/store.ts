"use client";

import { create } from "zustand";
import type { LogEntry, PatientProfile } from "@/lib/models";
import type { DecryptResult } from "@/lib/services";
import { demoPatientOwner } from "@/lib/mock-data";

/**
 * Shared app state — the web parallel of the Flutter Provider controllers.
 *
 * Holds only what must survive navigation between surfaces:
 *   - `ownerProfile`: the patient's own record (Edit <-> Dashboard <-> Write)
 *   - `scanned`: the responder's decrypted record (Scan -> Profile -> Log)
 * Per-screen loading/animation state lives in the components themselves.
 */
interface AppState {
  /** Patient mode: the app owner's record (pre-seeded demo patient). */
  ownerProfile: PatientProfile;
  setOwnerProfile: (p: PatientProfile) => void;

  /** Responder mode: the most recently decrypted tag. */
  scanned: DecryptResult | null;
  setScanned: (r: DecryptResult | null) => void;

  /** Append a treatment-log entry to the scanned record (post re-write). */
  appendScannedLog: (entry: LogEntry) => void;
}

export const useAppStore = create<AppState>((set) => ({
  ownerProfile: demoPatientOwner(),
  setOwnerProfile: (p) => set({ ownerProfile: p }),

  scanned: null,
  setScanned: (r) => set({ scanned: r }),

  appendScannedLog: (entry) =>
    set((state) => {
      if (!state.scanned?.profile) return state;
      return {
        scanned: {
          ...state.scanned,
          profile: {
            ...state.scanned.profile,
            treatmentLog: [...state.scanned.profile.treatmentLog, entry],
            updatedAt: new Date(),
          },
        },
      };
    }),
}));
