// User schema constraints
export const MIN_USERNAME_LENGTH = 1;
export const MAX_USERNAME_LENGTH = 64;
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 32;
export const MIN_USER_AGE = 18;
export const MAX_USER_AGE = 100;
export const DEFAULT_ELO_RATING = 1000;

// Comment constraints
export const MIN_COMMENT_LENGTH = 2;
export const MAX_COMMENT_LENGTH = 500;

// Tournament constraints
export const MIN_TOURNAMENT_TITLE_LENGTH = 3;
export const MAX_TOURNAMENT_TITLE_LENGTH = 64;
export const MIN_TOURNAMENT_DESCRIPTION_LENGTH = 4;
export const MAX_TOURNAMENT_DESCRIPTION_LENGTH = 500;

// Game variants
export const VALID_ROUNDS = [3, 5, 7];
export const VALID_TIME_CONTROLS = [10, 30, 90]; // seconds total for all rounds
export const VALID_PLAYER_COUNTS = [2, 3, 5];
export const VALID_BUY_INS = [1, 10, 50];

export const MSEC_PER_DAY = 1000 * 60 * 60 * 24; // 24 hours
export const MAX_LENGTH_AGENT_STRING = 1024;