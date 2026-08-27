// export { authRouter } from "./auth.routes.js";

// export {
//   registerController,
//   loginController,
//   profileController,
//   logoutController,
// } from "./auth.controller.js";

// export {
//   registerUser,
//   loginUser,
//   getCurrentUser,
// } from "./auth.service.js";

// export {
//   findUserByEmail,
//   findPublicUserById,
//   createWorkspaceWithAdmin,
//   updateLastLogin,
// } from "./auth.repository.js";

// export {
//   generateAccessToken,
//   generateRefreshToken,
//   verifyAccessToken,
//   verifyRefreshToken,
//   generatePasswordResetToken,
//   verifyPasswordResetToken,
//   generateEmailVerificationToken,
//   verifyEmailVerificationToken,
//   generateApiKey,
// } from "./token.service.js";

// export {
//   requestPasswordReset,
//   resetPassword,
//   changePassword,
// } from "./password-reset.service.js";

// export {
//   requestEmailVerification,
//   verifyEmail,
//   resendVerification,
// } from "./email-verification.service.js";

// export {
//   toAuthResponse,
//   mapPublicUser,
//   mapJwtPayloadToPublicUser,
// } from "./auth.mapper.js";

// export {
//   hasMinimumRole,
//   canRegister,
//   canLogin,
//   canAccessProfile,
//   canManageOwnAccount,
//   canResetPassword,
// } from "./auth.permissions.js";

// export type * from "./auth.types.js";
// export {
//   registerSchema,
//   loginSchema,
// } from "./auth.validator.js";

export {
  authRouter,
} from "./auth.routes.js";

export {
  loginUser,
  registerUser,
  getCurrentUser,
} from "./auth.service.js";

export {
  generateAccessToken,
  verifyAccessToken,
} from "./token.service.js";

export {
  isAdmin,
  isAnalyst,
  isViewer,
  canAnalyze,
  canView,
} from "./auth.permissions.js";