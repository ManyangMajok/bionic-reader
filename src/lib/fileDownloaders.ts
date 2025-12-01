import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { ProcessedText } from "../types";

export const generateDocx = async (
  processedText: ProcessedText,
  file: File | null,
) => {
  try {
    const paragraphs: Paragraph[] = [];

    // Add title
    paragraphs.push(
      new Paragraph({
        text: `Bionic Reading - ${file?.name || "Processed Text"}`,
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 400 },
      }),
    );

    const lines = processedText.processed.split("\n");

    for (const line of lines) {
      if (line.trim() === "") {
        paragraphs.push(new Paragraph({ text: "" }));
        continue;
      }

      const isHeading = line.includes(
        '<div class="text-lg font-semibold text-gray-800',
      );

      if (isHeading) {
        const headingText = line.replace(/<[^>]*>/g, "").trim();
        if (headingText) {
          paragraphs.push(
            new Paragraph({
              text: headingText,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 200 },
            }),
          );
        }
        continue;
      }

      const textRuns: TextRun[] = [];
      let processedLine = line;
      processedLine = processedLine
        .replace(/<div[^>]*>/g, "")
        .replace(/<\/div>/g, "");
      const parts = processedLine.split(/(<strong[^>]*>.*?<\/strong>)/g);

      for (const part of parts) {
        if (!part) continue;

        if (part.includes("<strong")) {
          const boldMatch = part.match(/<strong[^>]*>(.*?)<\/strong>/);
          if (boldMatch && boldMatch[1]) {
            textRuns.push(
              new TextRun({
                text: boldMatch[1],
                bold: true,
              }),
            );
          }
        } else {
          const cleanText = part
            .replace(/<[^>]*>/g, "")
            .replace(/&nbsp;/g, " ");
          if (cleanText.trim()) {
            textRuns.push(
              new TextRun({
                text: cleanText,
              }),
            );
          }
        }
      }

      if (textRuns.length > 0) {
        paragraphs.push(
          new Paragraph({
            children: textRuns,
            spacing: { after: 120 },
          }),
        );
      }
    }

    if (paragraphs.length === 1) {
      paragraphs.push(
        new Paragraph({
          text: "No content to display",
        }),
      );
    }

    const doc = new Document({
      creator: "Bionic Reader",
      title: `Bionic Reading - ${file?.name || "Processed Text"}`,
      description:
        "Enhanced text for improved reading speed and comprehension",
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720,
                right: 720,
                bottom: 720,
                left: 720,
              },
            },
          },
          children: paragraphs,
        },
      ],
    });

    // --- FIX IS HERE ---
    // Generate and download the file
    // Packer.toBlob() is the correct method for browser environments
    // It returns a Blob directly, with the correct MIME type.
    const blob = await Packer.toBlob(doc);
    // --- END OF FIX ---

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const fileName = file?.name
      ? file.name.replace(/\.[^/.]+$/, "")
      : "processed";
    a.href = url;
    a.download = `bionic-${fileName}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error generating DOCX:", error);
    throw new Error(
      `There was an error generating the DOCX file: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
};