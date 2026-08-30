"use client";

import React, { useEffect } from "react";

/**
 * Injects Chrome Speculation Rules API script
 * Allows Chrome and Chromium browsers (Edge, Opera, Android Chrome) to prerender top stories in the background
 * Enabling 0ms instant page loads.
 */
export function SpeculationRules() {
  useEffect(() => {
    // Only inject if HTMLScriptElement.supports and speculationrules are supported
    if (
      typeof HTMLScriptElement !== "undefined" &&
      HTMLScriptElement.supports &&
      HTMLScriptElement.supports("speculationrules")
    ) {
      const existing = document.getElementById("chrome-speculation-rules");
      if (!existing) {
        const script = document.createElement("script");
        script.id = "chrome-speculation-rules";
        script.type = "speculationrules";
        script.textContent = JSON.stringify({
          prerender: [
            {
              source: "list",
              urls: ["/stories", "/trending", "/latest"],
            },
            {
              where: {
                href_matches: "/story/*",
              },
              eagerness: "moderate",
            },
          ],
          prefetch: [
            {
              where: {
                href_matches: "/category/*",
              },
              eagerness: "moderate",
            },
          ],
        });
        document.head.appendChild(script);
      }
    }
  }, []);

  return null;
}
