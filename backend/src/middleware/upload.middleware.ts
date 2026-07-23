import multer from "multer";
import path from "node:path";

import { FEEDBACK_IMPORT_CONFIG } from "../modules/feedback-import/feedbackImport.constants.js";
import { ApiError } from "../utils/apiError.js";

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => {
    callback(null, "uploads/csv");
  },

  filename: (_request, file, callback) => {
    const extension = path.extname(file.originalname);

    const uniqueFileName = `${Date.now()}-${Math.round(Math.random() * 1_000_000)}${extension}`;

    callback(null, uniqueFileName);
  },
});

export const uploadFeedbackCsv = multer({
  storage,

  limits: {
    fileSize: FEEDBACK_IMPORT_CONFIG.maximumFileSize,
    files: 1,
  },

  fileFilter: (_request, file, callback) => {
    const isCsv =
      file.mimetype === "text/csv" ||
      file.mimetype === "application/vnd.ms-excel" ||
      file.originalname.toLowerCase().endsWith(".csv");

    if (!isCsv) {
      callback(new ApiError(400, "Only CSV files are allowed"));

      return;
    }

    callback(null, true);
  },
});
