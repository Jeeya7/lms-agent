/**
 * Generates a valid iCalendar (.ics) string from a study schedule.
 * Each study block becomes a VEVENT with the agent reasoning as the description.
 */
export function generateICS(schedule) {
  const now =
    new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";

  const DATE_MAP = {
    "Mon Apr 27": "20260427",
    "Tue Apr 28": "20260428",
    "Wed Apr 29": "20260429",
    "Thu Apr 30": "20260430",
    "Fri May 1":  "20260501",
    "Sat May 2":  "20260502",
    "Sun May 3":  "20260503",
  };

  function parseTimeToHHMMSS(rawTime) {
    const [time, ampm] = rawTime.trim().split(" ");
    let [h, m] = time.split(":").map(Number);
    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}${String(m).padStart(2, "0")}00`;
  }

  let events = "";

  schedule.forEach(({ day, blocks }) => {
    const dateStr = DATE_MAP[day] || "20260427";

    blocks.forEach((block, i) => {
      const [startRaw] = block.time.split("–");
      const startTime = parseTimeToHHMMSS(startRaw);
      const endHour = Math.min(
        parseInt(startTime.slice(0, 2)) + Math.ceil(block.hours),
        23
      );
      const endTime = `${String(endHour).padStart(2, "0")}${startTime.slice(2)}`;

      events +=
        `BEGIN:VEVENT\r\n` +
        `UID:studypilot-${dateStr}-${i}@studypilot\r\n` +
        `DTSTAMP:${now}\r\n` +
        `DTSTART:${dateStr}T${startTime}\r\n` +
        `DTEND:${dateStr}T${endTime}\r\n` +
        `SUMMARY:Study: ${block.assignment} [${block.course}]\r\n` +
        `DESCRIPTION:${block.reason}\r\n` +
        `CATEGORIES:Study Block\r\n` +
        `END:VEVENT\r\n`;
    });
  });

  return (
    `BEGIN:VCALENDAR\r\n` +
    `VERSION:2.0\r\n` +
    `PRODID:-//StudyPilot//AI Study Planner//EN\r\n` +
    `CALSCALE:GREGORIAN\r\n` +
    events +
    `END:VCALENDAR`
  );
}
