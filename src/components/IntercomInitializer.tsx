"use client";

import { useEffect } from "react";

interface IntercomInitializerProps {
  appId: string;
  user?: {
    name?: string;
    email?: string;
    user_id?: string;
    created_at?: number;
    // biome-ignore lint/suspicious/noExplicitAny: disable any type checking for Intercom types
    [key: string]: unknown;
  };
}

const IntercomInitializer = ({
  user = {},
  appId,
}: IntercomInitializerProps) => {
  useEffect(() => {
    // Check if Intercom is already loaded
    if (typeof window.Intercom === "function") {
      // If already loaded, just update settings
      window.Intercom("update", {
        app_id: appId,
        ...user,
      });
    } else {
      // Load Intercom script if not present
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.src = `https://widget.intercom.io/widget/${appId}`;
      document.head.appendChild(script);

      script.onload = () => {
        // Initialize Intercom once the script is loaded
        if (typeof window.Intercom === "function") {
          window.Intercom("boot", {
            app_id: appId,
            ...user,
            // hide_default_launcher: true, // Uncomment if you want to hide the default bubble
          });
        }
      };

      // Cleanup function for unmounting (important for SPAs)
      return () => {
        if (typeof window.Intercom === "function") {
          window.Intercom("shutdown"); // Shuts down the messenger
          // Optionally remove the script tag if needed, though Intercom handles most cleanup
          const intercomScript = document.querySelector(
            `script[src*="${appId}"]`
          );
          if (intercomScript) {
            intercomScript.remove();
          }
          const intercomContainer =
            document.getElementById("intercom-container");
          if (intercomContainer) {
            intercomContainer.remove();
          }
        }
      };
    }
  }, [user, appId]);

  return null; // This component doesn't render any UI
};

export default IntercomInitializer;
