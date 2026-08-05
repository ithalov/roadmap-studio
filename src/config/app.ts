import packageJson from '../../package.json';

export const APP_NAME = 'Roadmap Studio';
export const APP_DESCRIPTION = 'A local-first desktop workspace for professional roadmap planning.';
export const APP_VERSION = packageJson.version;
export const APP_RELEASE_NAME = `${APP_NAME} ${APP_VERSION}`;
export const APP_DB_NAME = 'roadmap-studio.db';
export const APP_THEME_STORAGE_KEY = 'roadmap-studio-theme';
export const APP_SETTINGS_STORAGE_KEY = 'roadmap-studio-settings';
export const APP_PROJECT_STORAGE_KEY = 'roadmap-studio-project';
export const APP_UI_STORAGE_KEY = 'roadmap-studio-ui';
