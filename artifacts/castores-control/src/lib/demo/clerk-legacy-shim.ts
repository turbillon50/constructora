/**
 * Shim de @clerk/react/legacy — usado sólo para useSignUp en App.tsx.
 * En demo mode siempre devuelve un signUp inactivo (sin flujo OTP).
 */
export function useSignUp() {
  return {
    isLoaded: true,
    signUp: { status: null as null | string, emailAddress: "" },
    setActive: async () => {},
  };
}
