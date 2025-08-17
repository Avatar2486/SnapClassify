import fs from "fs";
import path from "path";
import toDataUri from "../shared/imgTouri.js";
import logger from "../shared/logger.js";
import gemini_call from "../services/gemini_hit.js";

function getAllImages(dirPath, fileList = []) {
  logger.info("Getting List of Image path from the dir", dirPath);
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // This I did to seach for image inside inside the Dir
      getAllImages(filePath, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      if ([".png", ".jpg", ".jpeg", ".webp", ".heic", "heif"].includes(ext)) {
        fileList.push(filePath);
      }
    }
  });

  logger.info(`Found ${fileList.length} Image Files`);
  return fileList;
}

function llmObj(FILE_URI, datatype, config = true) {
  const model = "gemini-2.0-flash-exp";

  let data = {
    model: model,
    contents: [
      {
        text: `
Carefully examine the entire image.
The image may contain one or more of the following:

Titles of Movies, TV Series, Anime, Manga, Manhwa, Songs, or Books

Jokes (text-based jokes, meme captions, humorous lines)

Your task:

Extract all distinct items that match any of these categories.

Preserve the exact spelling, punctuation, and formatting from the image.

Assign the most accurate category from:
Movie, Series, Anime, Manga, Manhwa, Song, Book, Joke

Always pick the best match; avoid “Unknown” unless it truly fits no category.

A joke must be classified as “Joke” and should include the full joke text, not truncated.

If the text looks like a creative work title, classify accordingly.

For each item, estimate a confidence score between 0 and 1 for your classification.
          `,
      },
      {
        inlineData: {
          mimeType: datatype,
          data: FILE_URI,
        },
      },
    ],
  };

  if (config) {
    data.generationConfig = {
      responseMimeType: "application/json",
      responseSchema: {
        type: "array",
        items: {
          type: "object",
          properties: {
            text: { type: "string" }, // The exact extracted text
            type: { type: "string" }, // e.g., "Movie", "Joke", "Manga"
            confidence: { type: "number" }, // Confidence score 0–1
          },
          required: ["text", "type"],
          propertyOrdering: ["text", "type", "confidence"],
        },
      },
    };
  }

  return data;
}

async function main() {
  logger.info("Starting the Image to Data Process");
  try {
    let filepaths = getAllImages("./images");
    let uris = [];

    for (const filepath of filepaths) {
      try {
        logger.info(`Extracting URI for --> ${filepath}`);
        let fileuri = toDataUri(filepath);
        uris.push(fileuri);
        logger.info(
          `Successfully processed: ${filepath} with MIME type: ${fileuri.datatype}`
        );
      } catch (error) {
        logger.error(`Failed to process ${filepath}: ${error.message}`);
        continue;
      }
    }

    if (uris.length === 0) {
      throw new Error("No valid images were processed");
    }

    logger.info(`Generated ${uris.length} Image Files URI`);

    fs.writeFile("extracted_uri.json", JSON.stringify(uris, null, 2), (err) => {
      if (err) throw err;
      logger.info("Successfully extracted the data and saved");
    });

    const results = [];
    for (let i = 0; i < uris.length; i++) {
      try {
        logger.info(
          `Processing image ${i + 1}/${uris.length}: ${uris[i].originalPath}`
        );
        logger.info(`Data Type of Image is ${uris[i].datatype}`);

        let geminiObj = llmObj(uris[i].filedata, uris[i].datatype);

        let ai_response = await gemini_call(geminiObj);
        logger.info("Raw AI Response:", ai_response);

        const safeResponse = ai_response
          ? JSON.parse(JSON.stringify(ai_response))
          : null;

        results.push({
          imagePath: uris[i].originalPath,
          status: "success",
          response: safeResponse,
        });

        logger.info(`Successfully processed image ${i + 1}/${uris.length}`);

        if (i < uris.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        logger.error(
          `Failed to process image ${uris[i].originalPath} with Gemini API: ${error.message}`
        );

        results.push({
          imagePath: uris[i].originalPath,
          status: "failed",
          response: null,
          error: error.message,
        });
      }
    }

    logger.info(JSON.stringify(results));

    fs.writeFile("ai_results.json", JSON.stringify(results, null, 2), (err) => {
      if (err) throw err;
      logger.info("Successfully saved all AI results");
    });

    // Formating the  data in specifc format
    let finaldata = specifcFormat(results);
    return finaldata;
  } catch (error) {
    logger.error("An error occurred in Node", error);
    throw error;
  }
}

function specifcFormat(data) {
  let newdata = [];
  data.forEach((obj) => {
    obj.response.forEach((res) => {
      newdata.push({
        Filename: obj.imagePath,
        Status: obj.status,
        Txt: res.text,
        Type: res.type,
        Confidence: res.confidence,
      });
    });
  });

  return newdata;
}

main();
