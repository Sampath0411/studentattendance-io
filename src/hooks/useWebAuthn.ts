import { useState } from "react";
import { toast } from "sonner";

const CREDENTIAL_KEY = "webauthn-credential";

export const useWebAuthn = () => {
  const [isSupported] = useState(() => {
    return !!(window.PublicKeyCredential && navigator.credentials);
  });

  const registerFingerprint = async (userId: string, regNumber: string): Promise<boolean> => {
    if (!isSupported) {
      toast.error("Biometric authentication is not supported on this device");
      return false;
    }

    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: "AU Attendance", id: window.location.hostname },
          user: {
            id: new TextEncoder().encode(userId),
            name: regNumber,
            displayName: regNumber,
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" },
            { alg: -257, type: "public-key" },
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
          timeout: 60000,
        },
      }) as PublicKeyCredential;

      if (credential) {
        // Store credential ID locally for this user
        const stored = JSON.parse(localStorage.getItem(CREDENTIAL_KEY) || "{}");
        stored[regNumber.toLowerCase()] = {
          credentialId: Array.from(new Uint8Array(credential.rawId)),
          userId,
        };
        localStorage.setItem(CREDENTIAL_KEY, JSON.stringify(stored));
        return true;
      }
      return false;
    } catch (err: any) {
      if (err.name !== "NotAllowedError") {
        toast.error("Failed to set up fingerprint login");
      }
      return false;
    }
  };

  const authenticateFingerprint = async (): Promise<{ regNumber: string; userId: string } | null> => {
    if (!isSupported) return null;

    const stored = JSON.parse(localStorage.getItem(CREDENTIAL_KEY) || "{}");
    const entries = Object.entries(stored) as [string, any][];
    if (entries.length === 0) return null;

    try {
      const allowCredentials = entries.map(([_, data]) => ({
        id: new Uint8Array(data.credentialId),
        type: "public-key" as const,
      }));

      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials,
          userVerification: "required",
          timeout: 60000,
        },
      }) as PublicKeyCredential;

      if (assertion) {
        const matchedId = Array.from(new Uint8Array(assertion.rawId));
        const matched = entries.find(([_, data]) => {
          const storedId = data.credentialId as number[];
          return storedId.length === matchedId.length && storedId.every((v, i) => v === matchedId[i]);
        });
        if (matched) {
          return { regNumber: matched[0], userId: matched[1].userId };
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  const hasStoredCredential = (): boolean => {
    const stored = JSON.parse(localStorage.getItem(CREDENTIAL_KEY) || "{}");
    return Object.keys(stored).length > 0;
  };

  return { isSupported, registerFingerprint, authenticateFingerprint, hasStoredCredential };
};
