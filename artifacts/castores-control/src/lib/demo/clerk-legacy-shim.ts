/**
 * Shim de @clerk/react/legacy para modo demo.
 * Sólo expone useSignUp con un proxy que cubre cualquier método.
 */
const noopAsync = async (..._args: unknown[]) => null;

function demoProxy<T extends Record<string, unknown>>(base: T): T {
  return new Proxy(base, {
    get(target, prop, receiver) {
      if (prop in target) return Reflect.get(target, prop, receiver);
      if (prop === Symbol.iterator || prop === "then" || prop === "constructor") {
        return undefined;
      }
      return noopAsync;
    },
  }) as T;
}

export function useSignUp() {
  return demoProxy({
    isLoaded: true,
    signUp: demoProxy({
      status: null as null | string,
      emailAddress: "",
      create: noopAsync,
      attemptEmailAddressVerification: noopAsync,
      prepareEmailAddressVerification: noopAsync,
    }),
    setActive: noopAsync,
  });
}
