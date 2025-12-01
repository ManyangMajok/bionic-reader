import { TextStructure, ReadingSettings } from "../types";

export const analyzeTextStructure = (text: string): TextStructure => {
  const lines = text.split("\n").filter((line) => line.trim().length > 0);
  const headings: TextStructure["headings"] = [];
  const paragraphs: TextStructure["paragraphs"] = [];
  const lists: TextStructure["lists"] = [];
  let position = 0;
  let totalWords = 0;

  for (const line of lines) {
    const trimmedLine = line.trim();
    const words = trimmedLine.split(/\s+/).filter((word) => word.length > 0);
    const wordCount = words.length;
    totalWords += wordCount;

    // Detect headings (lines that are short, capitalized, or have specific patterns)
    if (
      wordCount <= 10 &&
      (trimmedLine.match(/^[A-Z][A-Z\s]+$/) || // ALL CAPS
        trimmedLine.match(/^\d+\.\s/) || // Numbered headings
        trimmedLine.match(/^[A-Z][a-z]+(?:\s[A-Z][a-z]+)*:?$/) || // Title Case
        trimmedLine.match(/^#{1,6}\s/)) // Markdown headings
    ) {
      const level = trimmedLine.match(/^#{1,6}/)
        ? trimmedLine.match(/^#{1,6}/)?.[0].length || 1
        : 1;
      headings.push({
        level,
        text: trimmedLine.replace(/^#{1,6}\s*/, ""),
        position,
      });
    }
    // Detect lists (lines starting with bullets, numbers, or dashes)
    else if (
      trimmedLine.match(/^[•\-\*]\s/) ||
      trimmedLine.match(/^\d+[.)\s]/)
    ) {
      const existingList = lists[lists.length - 1];
      if (existingList && Math.abs(existingList.position - position) < 5) {
        existingList.items.push(trimmedLine);
      } else {
        lists.push({
          items: [trimmedLine],
          position,
        });
      }
    }
    // Regular paragraphs
    else if (wordCount > 3) {
      paragraphs.push({
        text: trimmedLine,
        position,
        wordCount,
      });
    }

    position++;
  }

  // Calculate reading time (average 200 words per minute)
  const readingTime = Math.ceil(totalWords / 200);

  return {
    headings,
    paragraphs,
    lists,
    totalWords,
    readingTime,
  };
};

export const processBionicText = (
  text: string,
  intensity: number,
  settings: ReadingSettings,
): string => {
  // Split by lines first to preserve paragraph structure
  const lines = text.split("\n");
  const frequency = settings.fixationFrequency || 1;

  const processedLines = lines.map((line) => {
    if (line.trim().length === 0) return line; // Preserve empty lines

    const trimmedLine = line.trim();

    // Enhanced formatting for headings
    if (
      trimmedLine.match(/^[A-Z][A-Z\s]+$/) ||
      trimmedLine.match(/^\d+\.\s/) ||
      trimmedLine.match(/^[A-Z][a-z]+(?:\s[A-Z][a-z]+)*:?$/) ||
      trimmedLine.match(/^#{1,6}\s/)
    ) {
      const words = trimmedLine.split(/\s+/);
      const processedWords = words.map((word, index) => {
        // Frequency Check
        if (index % frequency !== 0) return word;

        if (word.length === 0) return word;
        const charsToBold = Math.max(
          1,
          Math.ceil((word.length * (intensity + 10)) / 100),
        );
        const boldPart = word.slice(0, charsToBold);
        const normalPart = word.slice(charsToBold);

        if (settings.fixationControl === "off") {
          return word;
        } else if (settings.fixationControl === "highlight") {
          return `<span class="bg-yellow-200" style="opacity: ${
            settings.opacityLevel / 100
          }">${boldPart}</span><span class="text-gray-700">${normalPart}</span>`;
        } else {
          // Color is inherited from parent container in PreviewCard
          return `<strong style="opacity: ${
            settings.opacityLevel / 100
          }; font-weight: 700;">${boldPart}</strong><span>${normalPart}</span>`;
        }
      });
      return `<div class="text-lg font-semibold mb-2 mt-4">${processedWords.join(
        " ",
      )}</div>`;
    }

    // Enhanced formatting for lists
    if (
      trimmedLine.match(/^[•\-\*]\s/) ||
      trimmedLine.match(/^\d+[.)\s]/)
    ) {
      const words = trimmedLine.split(/\s+/);
      const processedWords = words.map((word, index) => {
        // Frequency Check
        if (index % frequency !== 0) return word;

        if (word.length === 0) return word;
        const charsToBold = Math.max(
          1,
          Math.ceil((word.length * intensity) / 100),
        );
        const boldPart = word.slice(0, charsToBold);
        const normalPart = word.slice(charsToBold);

        if (settings.fixationControl === "off") {
          return word;
        } else if (settings.fixationControl === "highlight") {
          return `<span class="bg-yellow-200" style="opacity: ${
            settings.opacityLevel / 100
          }">${boldPart}</span>${normalPart}`;
        } else {
          return `<strong style="opacity: ${
            settings.opacityLevel / 100
          }; font-weight: 700;">${boldPart}</strong>${normalPart}`;
        }
      });
      return `<div class="ml-4 mb-1">${processedWords.join(" ")}</div>`;
    }

    // Regular paragraph processing
    const words = line.split(/\s+/);
    const processedWords = words.map((word, index) => {
      // Frequency Check: Skip processing if index doesn't match frequency
      if (index % frequency !== 0) return word;

      if (word.length === 0) return word;

      // Calculate how many characters to bold based on intensity
      const charsToBold = Math.max(
        1,
        Math.ceil((word.length * intensity) / 100),
      );
      const boldPart = word.slice(0, charsToBold);
      const normalPart = word.slice(charsToBold);

      if (settings.fixationControl === "off") {
        return word;
      } else if (settings.fixationControl === "highlight") {
        return `<span class="bg-yellow-200" style="opacity: ${
          settings.opacityLevel / 100
        }">${boldPart}</span>${normalPart}`;
      } else {
        return `<strong style="opacity: ${
          settings.opacityLevel / 100
        }; font-weight: 700;">${boldPart}</strong>${normalPart}`;
      }
    });

    return processedWords.join(" ");
  });

  return processedLines.join("\n");
};