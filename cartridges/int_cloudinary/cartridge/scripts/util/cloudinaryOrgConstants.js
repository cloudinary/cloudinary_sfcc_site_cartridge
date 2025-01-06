'use strict';

/**
 * Cloudinary Constants sets up various values to be used throughout the cartridge code
 */
var CloudinaryOrgConstants = {};
var System = require('dw/system/System');
var orgPrefs = System.getPreferences();

CloudinaryOrgConstants.CLD_APIKEY = orgPrefs.getCustom().CLDAPIkey;
CloudinaryOrgConstants.CLD_APISECRET = orgPrefs.getCustom().CLDSecretKey;
CloudinaryOrgConstants.IMAGES_BASE_PATH = orgPrefs.getCustom().CLDBasePath || 'https://res.cloudinary.com/';
CloudinaryOrgConstants.CLD_CLOUDNAME = orgPrefs.getCustom().CLDCloudName || 'sfcc-cartridge-development';
CloudinaryOrgConstants.CLD_ENABLED = orgPrefs.getCustom().CLDEnabled || false;
CloudinaryOrgConstants.CLD_ORG_CONTENT_IMAGE_PATH = orgPrefs.getCustom().CLDOrgContentImgPath || 'organization/content/images';
CloudinaryOrgConstants.CLD_ORG_CONTENT_VIDEO_PATH = orgPrefs.getCustom().CLDOrgContentVideoPath || 'organization/content/videos';
CloudinaryOrgConstants.CLD_LAST_SYNC = orgPrefs.getCustom().CLDLastSyncJobExecution || '01/01/1970';
CloudinaryOrgConstants.CLD_GLOBAL_IMAGE_TRANSFORMATIONS = orgPrefs.getCustom().CLDImageTransformation || '';
CloudinaryOrgConstants.CLD_GLOBAL_VIDEO_TRANSFORMATIONS = orgPrefs.getCustom().CLDVideoTransformation || '';
CloudinaryOrgConstants.CLD_GLOBAL_IMAGE_TRANSFORM_FORMAT = orgPrefs.getCustom().CLDImageTransformFormat || '';
CloudinaryOrgConstants.CLD_GLOBAL_VIDEO_TRANSFORM_FORMAT = orgPrefs.getCustom().CLDVideoTransformFormat || '';
CloudinaryOrgConstants.CLD_GLOBAL_IMAGE_QUALITY = orgPrefs.getCustom().CLDImageTransformQuality || '';
CloudinaryOrgConstants.CLD_GLOBAL_VIDEO_QUALITY = orgPrefs.getCustom().CLDVideoTransformQuality || '';
CloudinaryOrgConstants.CLD_GLOBAL_IMAGE_DPR = orgPrefs.getCustom().CLDImageTransformDPR || '';
CloudinaryOrgConstants.CLD_IMAGE_PAGE_TYPE_SETTINGS = orgPrefs.getCustom().CLDImagePageTypeSettings || '';
CloudinaryOrgConstants.CLD_REST_SERVICE_CREDENTIALS = orgPrefs.getCustom().CLDRestServiceCredentialsID;


// General constants
CloudinaryOrgConstants.IMAGE_UPLOAD_URL_RESOURCE_TYPE = '/image/upload';
CloudinaryOrgConstants.VIDEO_UPLOAD_URL_RESOURCE_TYPE = '/video/upload';
CloudinaryOrgConstants.UPLOAD_DELIVERY_TYPE = 'upload';
CloudinaryOrgConstants.CLD_RESOURCES = 'resources';
CloudinaryOrgConstants.URL_EMPTY_SPACES_REGEX = / /g;
CloudinaryOrgConstants.URL_EMPTY_SPACES_REPLACE = '%20';
CloudinaryOrgConstants.DEFAULT_DIRECTORY = 'default/';
CloudinaryOrgConstants.UPLOAD_DELIVERY_TYPE = 'upload';
CloudinaryOrgConstants.DEBUG_EXECUTION_MODE = 'Debug';
CloudinaryOrgConstants.PROD_BACK_FILE_EXECUTION_MODE = 'Prod - backfills only';
CloudinaryOrgConstants.PROD_EXECUTION_MODE = 'Prod';
CloudinaryOrgConstants.SYNC_MODE_DELTA = 'DELTA';
CloudinaryOrgConstants.FORWARD_SLASH = '/';
CloudinaryOrgConstants.COMMA = ',';
CloudinaryOrgConstants.DOT = '.';
CloudinaryOrgConstants.COMMA_WITH_SPACE = ', ';
CloudinaryOrgConstants.WIDTH_PREFIX = 'w_';
CloudinaryOrgConstants.HEIGHT_PREFIX = 'h_';
CloudinaryOrgConstants.DOUBLE_QUOTE = '"';
CloudinaryOrgConstants.FORMAT_PREFIX = 'f_';
CloudinaryOrgConstants.QUALITY_PREFIX = 'q_';
CloudinaryOrgConstants.DPR_PREFIX = 'dpr_';
CloudinaryOrgConstants.CLD_IMAGE_RESOURCE_TYPE = 'image';
CloudinaryOrgConstants.CLD_VIDEO_RESOURCE_TYPE = 'video';
CloudinaryOrgConstants.CLD_UPLOAD_SVC = 'cloudinary.rest.upload';
CloudinaryOrgConstants.CLD_UPLOAD_PRESET = 'sfra_default';
CloudinaryOrgConstants.ORG_CONTENT_DW_URL = '/on/demandware.servlet/webdav/Sites/Static/';
CloudinaryOrgConstants.CONTENT_TYPE_IMG = 'image';
CloudinaryOrgConstants.CONTENT_TYPE_VIDEO = 'video';
CloudinaryOrgConstants.CONTENT_TYPE_RAW = 'raw';
CloudinaryOrgConstants.UPLOAD_ENDPOINT = '/upload';
CloudinaryOrgConstants.TAGS_ENDPOINT = '/tags';
CloudinaryOrgConstants.SYNC_MODE_DELTA = 'DELTA';
CloudinaryOrgConstants.POST_METHOD = 'POST';
CloudinaryOrgConstants.CLD_UPLOAD_SVC = 'cloudinary.rest.upload';
CloudinaryOrgConstants.CLD_LIST_SERVICE_CLOUDNAME_PLACEHOLDER = '[cloudname]';
CloudinaryOrgConstants.CLD_LIST_SERVICE_API_KEY_PLACEHOLDER = '[apikey]';
CloudinaryOrgConstants.CLD_LIST_SERVICE_API_SECRET_PLACEHOLDER = '[apisecret]';
CloudinaryOrgConstants.HOST_NAME = 'https://' + System.getInstanceHostname();
CloudinaryOrgConstants.CLD_TRACKING_PARAM_PLATFORM_PLACEHOLDER = '<PLATFORM_TYPE>';
CloudinaryOrgConstants.CLD_SFCC_PLATFORM = 'sfcc_' + System.compatibilityMode;
CloudinaryOrgConstants.CLD_PUBLIC_ID_SPECIAL_CHARS_REGEX = /[%&#?\\<>]/g;
CloudinaryOrgConstants.CLD_REPORTING_LOG_LEVELS = {
    WARN: '1',
    INFO: '2',
    DEBUG: '3'
};
CloudinaryOrgConstants.API_TRACKING_PARAM = 'CloudinarySalesForceSiteCartridge/' + orgPrefs.getCustom().CLDCartridgeVersion + ' (CommerceCloud ' + System.compatibilityMode + ') Architecture ' + CloudinaryOrgConstants.CLD_TRACKING_PARAM_PLATFORM_PLACEHOLDER;

// API SERVICE ERRORS
CloudinaryOrgConstants.CLD_MISSING_PARAM = 'Required parameter missing';
CloudinaryOrgConstants.CLD_MISSING_KEY = 'Cloudinary API key missing';
CloudinaryOrgConstants.CLD_GENERAL_ERROR = 'Cloudinary Upload service error: ';

module.exports = CloudinaryOrgConstants;
