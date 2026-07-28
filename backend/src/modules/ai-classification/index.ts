export { classificationRouter } from "./classification.routes.js";
export { classificationController } from "./classification.controller.js";
export { classificationService } from "./classification.service.js";
export { classificationFallbackService } from "./classification-fallback.service.js";
export { classificationRepository } from "./classification.repository.js";

export {
  classifySingleSchema,
  classifyBatchSchema,
  classifyFeedbackByIdSchema,
  getClassificationSchema,
  listClassificationsSchema,
} from "./classification.validator.js";

export {
  classifyByKeywords,
  classifyBatchByKeywords,
  mergeClassificationResults,
  validateContent,
  isValidCategory,
} from "./classification.processor.js";

export {
  assertCanClassify,
  assertCanViewClassifications,
  assertCanDeleteClassification,
  assertCanManageClassificationSettings,
} from "./classification.permissions.js";

export {
  mapClassificationResult,
  mapClassificationRecord,
  mapClassificationRecords,
} from "./classification.mapper.js";

export {
  CLASSIFICATION_MAX_BATCH_SIZE,
  CLASSIFICATION_MAX_CONTENT_LENGTH,
  CLASSIFICATION_MIN_CONTENT_LENGTH,
  CLASSIFICATION_DEFAULT_CONFIDENCE,
  CLASSIFICATION_CACHE_TTL_MS,
  CLASSIFICATION_RETRY_MAX_ATTEMPTS,
  CLASSIFICATION_RETRY_DELAY_MS,
  CLASSIFICATION_SENTIMENT_LABELS,
  CLASSIFICATION_CATEGORIES,
  CLASSIFICATION_MESSAGES,
} from "./classification.constants.js";

export type * from "./classification.types.js";
