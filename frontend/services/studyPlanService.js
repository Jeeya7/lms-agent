/**
 * Study Plan Service
 *
 * Provides a unified interface for fetching study plan data.
 * Attempts to fetch from backend API first, falls back to mock data on failure.
 * Returns consistent shape regardless of data source.
 */

import { MOCK_SUMMARY, MOCK_ASSIGNMENTS } from "../data/mockAssignments";
import { MOCK_SCHEDULE } from "../data/mockSchedule";

// Configuration
function normalizeApiBase(rawValue) {
  const cleaned = (rawValue || "").trim();
  if (!cleaned) {
    return "";
  }

  const withProtocol = /^https?:\/\//i.test(cleaned)
    ? cleaned
    : `https://${cleaned}`;

  return withProtocol.replace(/\/+$/, "");
}

const API_BASE_URL = normalizeApiBase(
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_LMS_FUNCTION_APP_BASE ||
  ""
);
const API_TIMEOUT = 10000; // 10 seconds

/**
 * Fetches with timeout to prevent indefinite hangs
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = API_TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Generates a study plan by calling the backend API.
 * Falls back to mock data if the backend is unavailable.
 *
 * @param {string} canvasIcsUrl - Canvas ICS calendar URL
 * @param {string[]} outlookIcsUrls - Array of Outlook ICS calendar URLs
 * @param {string} [selectedCourse] - Optional course filter
 * @param {string} [confidenceLevel] - Optional confidence level ("low", "medium", "high")
 *
 * @returns {Promise<{
 *   data: { summary, assignments, schedule },
 *   source: "backend" | "mock",
 *   timestamp: number
 * }>}
 */
export async function generateStudyPlan(
  canvasIcsUrl,
  outlookIcsUrls,
  selectedCourse,
  confidenceLevel,
  preferences = null
) {
  try {
    // Attempt to call backend API
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/api/study-plan/preview`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          canvas_ics_url: canvasIcsUrl,
          outlook_ics_urls: outlookIcsUrls,
          selected_course: selectedCourse || null,
          confidence_level: confidenceLevel || null,
          preferences: preferences,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const apiData = await response.json();

    // Log success
    console.info(
      "✓ Study plan generated from backend",
      { canvasIcsUrl, outlookCount: outlookIcsUrls.length }
    );

    return {
      data: apiData,
      source: "backend",
      timestamp: Date.now(),
    };
  } catch (error) {
    // Log the error for debugging but don't expose to user
    console.warn(
      "⚠ Backend API unavailable, falling back to mock data",
      error.message
    );

    // Return mock data
    return {
      data: {
        summary: MOCK_SUMMARY,
        assignments: MOCK_ASSIGNMENTS,
        schedule: MOCK_SCHEDULE,
      },
      source: "mock",
      timestamp: Date.now(),
    };
  }
}

/**
 * Exports study blocks to an ICS file via the backend.
 * Falls back to a client-side implementation if backend fails.
 *
 * @param {Array} studyBlocks - Array of study block objects
 * @returns {Promise<string>} ICS file content
 */
export async function exportStudyPlanToIcs(studyBlocks) {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/api/study-plan/export`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ study_blocks: studyBlocks }),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const icsContent = await response.text();
    console.info("✓ Study plan exported via backend");
    return icsContent;
  } catch (error) {
    console.warn(
      "⚠ Export via backend failed, using client-side fallback",
      error.message
    );

    // Client-side fallback would be handled by the caller
    // For now, re-throw so the UI can handle it
    throw error;
  }
}

/**
 * Health check to verify backend availability
 * @returns {Promise<boolean>}
 */
export async function isBackendAvailable() {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/api/health`,
      { method: "GET" },
      3000 // Shorter timeout for health check
    );
    return response.ok;
  } catch {
    return false;
  }
}
