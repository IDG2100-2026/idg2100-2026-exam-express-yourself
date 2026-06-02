// User schema constraints
export const MIN_USERNAME_LENGTH = 1;
export const MAX_USERNAME_LENGTH = 64;
export const ALLOWED_USERNAME_FORMAT = /^[a-zA-Z0-9]+$/;
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 72;
export const MAX_USER_EMAIL_LENGTH = 254;
export const ALLOWED_USER_EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_USER_AGE = 18;
export const MAX_USER_AGE = 100;
export const MAX_USER_BIO_LENGTH = 300;
export const ALLOWED_USER_BIO_FORMAT = /^[a-zA-Z0-9 .,\-!?'"():;\n\r]*$/;
export const DEFAULT_USER_ELO_RATING = 1000;
export const MIN_USER_ELO_RATING = 0;
export const DEFAULT_USER_POINTS = 100;
export const MIN_USER_POINTS = 0;
export const DEFAULT_USER_BOARD_COLOR = "#1c2130";
export const DEFAULT_USER_LOBBY_SIZE = 5;
export const USER_ROLES = ["user", "admin"];
export const USER_THEMES = ["light", "dark"];
export const ELO_FIELD_BY_TIME_CONTROL = { 10: "tc10", 30: "tc30", 90: "tc90" };

// Comment constraints
export const MIN_COMMENT_LENGTH = 2;
export const MAX_COMMENT_LENGTH = 500;
export const COMMENT_TARGET_TYPES = ["Match", "Tournament"];

// Tournament constraints
export const MIN_TOURNAMENT_TITLE_LENGTH = 3;
export const MAX_TOURNAMENT_TITLE_LENGTH = 64;
export const MIN_TOURNAMENT_DESCRIPTION_LENGTH = 4;
export const MAX_TOURNAMENT_DESCRIPTION_LENGTH = 500;
export const ALLOWED_TOURNAMENT_DESCRIPTION_FORMAT = /^[a-zA-Z0-9 .,\-!?'"():;\n\r]*$/;
export const DEFAULT_TOURNAMENT_NUMBER_OF_ROUNDS = 3;
export const DEFAULT_TOURNAMENT_BUY_IN = 0;
export const MIN_TOURNAMENT_BUY_IN = 0;
export const DEFAULT_TOURNAMENT_ELO_MIN = 0;
export const DEFAULT_TOURNAMENT_ELO_MAX = 9999;
export const TOURNAMENT_STATUSES = ["upcoming", "cancelled", "in-progress", "completed"];
export const TOURNAMENT_WIN_POINTS = 50;

// Middleware
export const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes

// Match schema constraints
export const VALID_ROUNDS = [3, 5, 7];
export const VALID_TIME_CONTROLS = [10, 30, 90]; // seconds total for all rounds
export const VALID_PLAYER_COUNTS = [2, 3, 5];
export const VALID_BUY_INS = [1, 10, 50];
export const MATCH_STATUSES = ["waiting", "in-progress", "completed"];
export const MATCH_PHASES = ["rolling", "betting", "reveal"];

// Leaderboard
export const LEADERBOARD_SORT_OPTIONS = ["wins", "winPercentage", "matches"];

// Utilities
export const MSEC_PER_DAY = 1000 * 60 * 60 * 24; // 24 hours
export const MAX_LENGTH_AGENT_STRING = 1024;

// File uploads
export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const MAX_IMAGE_FILE_SIZE = 2 * 1024 * 1024; // 2mb