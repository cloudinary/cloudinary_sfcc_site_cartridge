'use strict';
/** *******************************************************************************
*@file 		  : File Name - CloudinaryConstants
*@description : This script file is used to define constants and initialize vari-
*               ables used in this cartridge .
*
*@author	  :	PixelMEDIA
*@created     : 12 Dec 2019
**********************************************************************************/

/**
 * Cloudinary Constants sets up various values to be used throughout the cartridge code
 */
var CloudinaryConstants = {};
var Site = require('dw/system/Site');
var System = require('dw/system/System');
var sitePrefs = Site.getCurrent().getPreferences();

CloudinaryConstants.CLD_APIKEY = sitePrefs.getCustom().CLDAPIkey;
CloudinaryConstants.CLD_APISECRET = sitePrefs.getCustom().CLDSecretKey;
CloudinaryConstants.CLD_AUTOUPLOAD_MAPPING = sitePrefs.getCustom().CLDAutoUploadMapping;
CloudinaryConstants.CLD_BASE_PATH = sitePrefs.getCustom().CLDBaseDeliveryPath;
CloudinaryConstants.CLD_CLOUDNAME = sitePrefs.getCustom().CLDCloudName;
CloudinaryConstants.CLD_CONTENT_IMAGE_PATH = sitePrefs.getCustom().CLDContentImagePath;
CloudinaryConstants.CLD_CATALOG_IMAGE_PATH = sitePrefs.getCustom().CLDCatalogImagePath;
CloudinaryConstants.CLD_ENABLED = sitePrefs.getCustom().CLDEnabled;
CloudinaryConstants.CLD_GALLERY_ENABLED = sitePrefs.getCustom().CLDGalleryEnabled;
CloudinaryConstants.CLD_IMAGE_PATH = sitePrefs.getCustom().CLDProductImagePath;
CloudinaryConstants.CLD_UPLOAD_PRESET = sitePrefs.getCustom().CLDUploadPreset;
CloudinaryConstants.CLD_VIDEO_PATH = sitePrefs.getCustom().CLDProductVideoPath;
CloudinaryConstants.CLD_VIDEO_OPTIONS = sitePrefs.getCustom().CLDVideoPlayerStyle;
CloudinaryConstants.CLD_VIDEO_ENABLED = sitePrefs.getCustom().CLDVideoEnabled;
CloudinaryConstants.CLD_VIDEO_PLAYER_ENABLED = sitePrefs.getCustom().CLDVideoPlayerEnabled;
CloudinaryConstants.CLD_VIDEO_CUSTOM_MAP_PATH = sitePrefs.getCustom().CLDVideoCustomMapPath;
CloudinaryConstants.CLD_USE_VIDEO_CUSTOM_MAPPING = sitePrefs.getCustom().CLDVideoCustomMappingEnabled;
CloudinaryConstants.CLD_GALLERY_STYLES = sitePrefs.getCustom().CLDGalleryStyles;
CloudinaryConstants.CLD_PRODUCT_ATTRIBUTE_FOR_TAGS = sitePrefs.getCustom().CLDProductAttributeForTags;
CloudinaryConstants.CLD_GLOBAL_IMAGE_TRANSFORMATIONS = sitePrefs.getCustom().CLDImageTransformation;
CloudinaryConstants.CLD_GLOBAL_VIDEO_TRANSFORMATIONS = sitePrefs.getCustom().CLDVideoTransformation;
CloudinaryConstants.CLD_GLOBAL_IMAGE_TRANSFORM_FORMAT = sitePrefs.getCustom().CLDImageTransformFormat;
CloudinaryConstants.CLD_GLOBAL_VIDEO_TRANSFORM_FORMAT = sitePrefs.getCustom().CLDVideoTransformFormat;
CloudinaryConstants.CLD_GLOBAL_IMAGE_QUALITY = sitePrefs.getCustom().CLDImageTransformQuality;
CloudinaryConstants.CLD_GLOBAL_VIDEO_QUALITY = sitePrefs.getCustom().CLDVideoTransformQuality;
CloudinaryConstants.CLD_GLOBAL_IMAGE_DPR = sitePrefs.getCustom().CLDImageTransformDPR;
CloudinaryConstants.CLD_IMAGE_PAGE_TYPE_SETTINGS = sitePrefs.getCustom().CLDImagePageTypeSettings;
CloudinaryConstants.CLD_HIGH_RES_IMAGES_VIEW_TYPE = sitePrefs.getCustom().CLDHighResImageViewType;
CloudinaryConstants.CLD_SMD_ENDPOINT = sitePrefs.getCustom().CLDMetadataFilteringEndpoint;
CloudinaryConstants.CLD_SMD_ENDPOINT_GALLERY_POSITION = sitePrefs.getCustom().CLDMetadataEndpointByGalleryPosition;
CloudinaryConstants.CLD_SMD_KEY = sitePrefs.getCustom().CLDSMDKey;
CloudinaryConstants.CLD_SMD_VALUE = sitePrefs.getCustom().CLDSMDValue;
CloudinaryConstants.CLD_INCLUDE_VIDEOS_IN_PGW = sitePrefs.getCustom().CLDIncludeVideosInPGW;
CloudinaryConstants.IMAGES_BASE_PATH = sitePrefs.getCustom().CLDImagesBasePath;
CloudinaryConstants.CLD_SWATCH_IMAGES_VIEW_TYPE = sitePrefs.getCustom().CLDSwatchImageViewType;
CloudinaryConstants.CLD_ENABLE_SWATCH_ON_PLP = sitePrefs.getCustom().CLDEnableSwatchOnPLP;
CloudinaryConstants.CLD_CUSTOM_MAPPING_VIDEO_FORMAT = sitePrefs.getCustom().CLDVideoCustomMappingFormat;
CloudinaryConstants.CUSTOMER_SERVICE_EMAIL = sitePrefs.getCustom().customerServiceEmail;
CloudinaryConstants.CLD_ASSETS_UPLOAD_LIMIT_MB = sitePrefs.getCustom().CLDMaxAssetUploadLimitMBs;
CloudinaryConstants.CLD_CARTRIDGE_OPERATION_MODE = sitePrefs.getCustom().CLDCartridgeOperationMode.value;
CloudinaryConstants.CLD_CARTRIDGE_CONTENT_OPERATION_MODE = sitePrefs.getCustom().CLDCartridgeContentOperationMode.value;
CloudinaryConstants.CLD_CONTENT_LIBRARY_JOB_LAST_EXECUTION_DATE = sitePrefs.getCustom().CLDContentLibraryJobLastExecutionDate;
CloudinaryConstants.CLD_CATALOG_CONTENT_JOB_LAST_EXECUTION_DATE = sitePrefs.getCustom().CLDCatalogContentJobLastExecutionDate;
CloudinaryConstants.CLD_REPORTING_LOG_LEVEL = sitePrefs.getCustom().CLDReportingLogLevel.value;
CloudinaryConstants.CLD_REST_SERVICE_CREDENTIALS = sitePrefs.getCustom().CLDRestServiceCredentialsID;

// Enable disable cloudinary on specific pages constants
CloudinaryConstants.CLD_IMAGE_PAGE_TYPE_SETTINGS_OBJECT = JSON.parse(CloudinaryConstants.CLD_IMAGE_PAGE_TYPE_SETTINGS);

// Enable pgw
CloudinaryConstants.CLD_360_SPINSETS_ENABLED = sitePrefs.getCustom().CLDEnable360SpinSets;
CloudinaryConstants.CLD_3D_OBJECTS_ENABLED = sitePrefs.getCustom().CLDEnable3DObjects;

// General constants
CloudinaryConstants.IMAGE_UPLOAD_URL_RESOURCE_TYPE = 'image/upload';
CloudinaryConstants.VIDEO_UPLOAD_URL_RESOURCE_TYPE = 'video/upload';
CloudinaryConstants.RAW_UPLOAD_URL_RESOURCE_TYPE = '/raw/upload';
CloudinaryConstants.UPLOAD_ENDPOINT = '/upload';
CloudinaryConstants.TAGS_ENDPOINT = '/tags';
CloudinaryConstants.IMAGE_LIST_URL_RESOURCE_TYPE = '/image/list';
CloudinaryConstants.URL_EMPTY_SPACES_REGEX = / /g;
CloudinaryConstants.URL_EMPTY_SPACES_REPLACE = '%20';
CloudinaryConstants.CLD_METADATA_GALLERY_POSITION_KEY = 'SFCC_gallery_position';
CloudinaryConstants.FORWARD_SLASH = '/';
CloudinaryConstants.COMMA = ',';
CloudinaryConstants.DOT = '.';
CloudinaryConstants.COMMA_WITH_SPACE = ', ';
CloudinaryConstants.DATETIME_FORMAT = 'yyy-MM-dd hh:mm:ss';
CloudinaryConstants.WIDTH_PREFIX = 'w_';
CloudinaryConstants.HEIGHT_PREFIX = 'h_';
CloudinaryConstants.FORMAT_PREFIX = 'f_';
CloudinaryConstants.QUALITY_PREFIX = 'q_';
CloudinaryConstants.DPR_PREFIX = 'dpr_';
CloudinaryConstants.PRIVATE_LIBRARY = 'Library';
CloudinaryConstants.COLON = ':';
CloudinaryConstants.EMPTY_STRING = '';
CloudinaryConstants.TRUE = 'True';
CloudinaryConstants.FALSE = 'False';
CloudinaryConstants.PIPE = '|';
CloudinaryConstants.EQUAL = '=';
CloudinaryConstants.HYPHEN = '-';
CloudinaryConstants.UNDER_SCORE = '_';
CloudinaryConstants.CLD_PRODUCT_SWATCH_IMG = 'cloudinaryProductSwatchImg';
CloudinaryConstants.VIDEO_POSTER_IMAGE_TYPE = '.jpg';
CloudinaryConstants.QUESTION_MARK = '?';
CloudinaryConstants.CLD_TRACKING_PARAM_PLATFORM_PLACEHOLDER = '<PLATFORM_TYPE>';
CloudinaryConstants.API_TRACKING_PARAM = 'CloudinarySalesForceSiteCartridge/2.1 (CommerceCloud ' + System.compatibilityMode + ') Architecture ' + CloudinaryConstants.CLD_TRACKING_PARAM_PLATFORM_PLACEHOLDER;
CloudinaryConstants.CLD_TRACKING_PARAM = '_i=AG';
CloudinaryConstants.CLD_PRODUCT_IMG = 'cloudinaryProductImage';
CloudinaryConstants.DEBUG_EXECUTION_MODE = 'Debug';
CloudinaryConstants.PROD_EXECUTION_MODE = 'Prod';
CloudinaryConstants.SYNC_MODE_DELTA = 'DELTA';
CloudinaryConstants.POST_METHOD = 'POST';
CloudinaryConstants.PRODUCT_ASSETS_NAME_CHANGED_EMAIL_SUBJECT = 'Cloudinary Asset Rename Notification For VIEW_TYPE View Type';
CloudinaryConstants.CONTENT_ASSETS_NAME_CHANGED_EMAIL_SUBJECT = 'Cloudinary Asset Rename Notification';
CloudinaryConstants.ASSET_UPLOAD_SIZE_LIMIT_BYTES = CloudinaryConstants.CLD_ASSETS_UPLOAD_LIMIT_MB * 1048576;
CloudinaryConstants.CLD_PRODUCT_IMGS = 'cloudinaryProductImages';
CloudinaryConstants.CLD_QUERY_PARAM_FOR_SET_AND_BUNDLE = '&isBundleOrSet=true';
CloudinaryConstants.CLD_QURY_PARAM_FOR_PGW_CONTAINER_SUFFIX = '&cloudinaryPGWContainerSuffix=';
CloudinaryConstants.CLD_VIEW_TYPE_PLACE_HOLDER = 'VIEW_TYPE';
CloudinaryConstants.CLD_PUBLIC_ID_SPECIAL_CHARS_REGEX = /[%&#?\\<>]/g;
CloudinaryConstants.CLD_REPORTING_LOG_LEVELS = {
    WARN: '1',
    INFO: '2',
    DEBUG: '3'
};
CloudinaryConstants.CLD_LIST_SERVICE_CLOUDNAME_PLACEHOLDER = '[cloudname]';
CloudinaryConstants.CLD_LIST_SERVICE_API_KEY_PLACEHOLDER = '[apikey]';
CloudinaryConstants.CLD_LIST_SERVICE_API_SECRET_PLACEHOLDER = '[apisecret]';
CloudinaryConstants.CLD_UPLOAD_SVC = 'cloudinary.rest.upload';
CloudinaryConstants.CLD_LIST_SVC = 'cloudinary.rest.list';
CloudinaryConstants.CLD_SEARCH_SVC = 'cloudinary.search.list';
CloudinaryConstants.CLD_IMAGE_RESOURCE_TYPE = 'image';
CloudinaryConstants.CLD_VIDEO_RESOURCE_TYPE = 'video';
CloudinaryConstants.CLD_SPIN_SET_RESOURCE_TYPE = 'spin';
CloudinaryConstants.CLD_360_SPIN_SET_TAG_SUFFIX = '_360';
CloudinaryConstants.CLD_3D_OBJECT_TAG_SUFFIX = '3d';
CloudinaryConstants.CLD_3D_OBJECT_TAG_SUFFIX_SLASH = '_3D';
CloudinaryConstants.CLD_RAW_RESOURCE_TYPE = 'raw';
CloudinaryConstants.JSON_EXTENSION = '.json';
CloudinaryConstants.LIST_RESOURCE_TYPE = '/list/';
CloudinaryConstants.CLD_LIBRARY_VIDEO_ENABLED = 1;
CloudinaryConstants.CLD_LIBRARY_VIDEO_PLAYER_ENABLED = 1;
CloudinaryConstants.CLD_SFCC_INTEGRATION = 'cloudinary_sfcc_integration';
CloudinaryConstants.CLD_SFCC_PLATFORM = 'sfcc_' + System.compatibilityMode;
CloudinaryConstants.CLD_SFCC_VERSION = '2.1';
CloudinaryConstants.CLD_SFCC_ENVIRONMENT = System.instanceType === System.PRODUCTION_SYSTEM || System.instanceType === System.STAGING_SYSTEM ? 'production' : 'development';

// Cloudinary cartridge modes
CloudinaryConstants.CLD_GET_ASSETS_BY_TAG_NAME_MODE = '1';
CloudinaryConstants.CLD_GET_ASSETS_BY_VIEW_TYPE_MODE = '2';
CloudinaryConstants.CLD_GET_ASSETS_BY_AUTO_UPLOAD_MODE = '3';

// API SERVICE ERRORS
CloudinaryConstants.CLD_MISSING_PARAM = 'Required parameter missing';
CloudinaryConstants.CLD_MISSING_KEY = 'Cloudinary API key missing';
CloudinaryConstants.CLD_GENERAL_ERROR = 'Cloudinary Upload service error: ';

// SCRIPT process errors
CloudinaryConstants.CLD_MISSING_IDENTIFIER = 'Required identifier missing';
CloudinaryConstants.CLD_INVALID_RESOURCE = 'Invalid resource specified';
CloudinaryConstants.CLD_DISABLED = 'Cloudinary is currently disabled';
CloudinaryConstants.CLD_VIDEO_DISABLED = 'Cloudinary video is currently disabled';
CloudinaryConstants.CLD_NO_SMD_ENPOINT_PRESENT = 'No SMD endpoint configured in custom preferences';
CloudinaryConstants.CLD_AUTO_UPLOAD_DISABLED = 'Cloudinary auto-uploading is disabled';
CloudinaryConstants.CLD_VIDEO_NOT_CONFIGURED = 'Video not configured in SFCC for product with ID: {0}';

// Cloudinary structured metadata keys
CloudinaryConstants.SFCC_PRODUCT_IDENTIFIER = 'sfcc-product-identifier';
CloudinaryConstants.SFCC_IS_MAIN = 'sfcc-is-main';
CloudinaryConstants.SFCC_GALLERY_POSITION = 'sfcc-gallery-position';
CloudinaryConstants.SFCC_PRODUCT_NAME = 'sfcc-product-name';
CloudinaryConstants.SFCC_PRODUCT_BRAND = 'sfcc-product-brand';
CloudinaryConstants.SFCC_VIEW_TYPE = 'sfcc-view-type';
CloudinaryConstants.SFCC_ALTTEXT_EXTERNAL_ID = 'sfcc-alt-text';

// SCRIPT API process errors
CloudinaryConstants.CLD_GET_IMG_ASSETS_URLS_ERROR = 'Error occured while fetching cloudinary image assets URLs for product with ID : {0}, error : {1}';
CloudinaryConstants.CLD_GET_VIDEO_ASSETS_URLS_ERROR = 'Error occured while fetching cloudinary videos assets URLs for product with ID : {0}, error : {1}';
CloudinaryConstants.CLD_GET_RAW_ASSETS_URLS_ERROR = 'Error occured while fetching cloudinary raw assets URLs for product with ID : {0}, error : {1}';
CloudinaryConstants.CLD_GET_STATIC_LIBRARY_IMAGES_URLS_ERROR = 'Error occured while fetching cloudinary static library images URLs for against folder : {0}, error : {1}';
CloudinaryConstants.CLD_APPLY_IMG_ABS_URL_TRANSFORM_ERROR = 'Error occured while applying transformations on image absolute URL, URL : {0}, error : {1}';
CloudinaryConstants.CLD_APPLY_IMG_REL_URL_TRANSFORM_ERROR = 'Error occured while applying transformations on image relative URL, URL : {0}, error : {1}';
CloudinaryConstants.CLD_APPLY_VIDEO_ABS_URL_TRANSFORM_ERROR = 'Error occured while applying transformations on video absolute URL, URL : {0}, error : {1}';
CloudinaryConstants.CLD_APPLY_VIDEO_REL_URL_TRANSFORM_ERROR = 'Error occured while applying transformations on video relative URL, URL : {0}, error : {1}';
CloudinaryConstants.CLD_APPLY_CONTENT_IMG_REL_URL_TRANSFORM_ERROR = 'Error occured while applying transformations on static library img relative URL, URL : {0}, error : {1}';
CloudinaryConstants.CLD_APPLY_CONTENT_IMG_ABS_URL_TRANSFORM_ERROR = 'Error occured while applying transformations on static library img absolute URL, URL : {0}, error : {1}';
CloudinaryConstants.CLD_APPLY_CONTENT_VIDEO_REL_URL_TRANSFORM_ERROR = 'Error occured while applying transformations on static library video relative URL, URL : {0}, error : {1}';
CloudinaryConstants.CLD_APPLY_CONTENT_VIDEO_ABS_URL_TRANSFORM_ERROR = 'Error occured while applying transformations on static library video absolute URL, URL : {0}, error : {1}';
CloudinaryConstants.CLD_APPLY_CONTENT_REL_URL_TRANSFORM_ERROR = 'Error occured while applying transformations on static library content absolute URL, URL : {0}, error : {1}';
CloudinaryConstants.CLD_GET_SMD_URL_ERROR = 'Error occured while building product image URL base on SMD, product ID: {0}, error : {1}';
CloudinaryConstants.CLD_GET_PRODUCT_PRIMARY_IMG_URL_ERROR = 'Error occured while building product primary image url using tag name, product ID: {0}, error : {1}';
CloudinaryConstants.CLD_GET_PRODUCT_IMG_URL_BY_POSITION_ERROR = 'Error occured while building product image url by postion using tag name, product ID: {0}, error : {1}';
CloudinaryConstants.CLD_GET_VIDEO_URLS_BY_VIEW_TYPE_ERROR = 'Error occured while fetching video URLs by view type for product with ID: {0}, error : {1}';
CloudinaryConstants.CLD_GET_IMG_URLS_BY_VIEW_TYPE_ERROR = 'Error occured while fetching image URLs by view type for product with ID: {0}, error : {1}';
CloudinaryConstants.CLD_GET_CATALOG_IMAGE_ERROR = 'Error occured while fetching catalog image URL,  relURL: {0}, error : {1}';
CloudinaryConstants.CLD_GET_CATALOG_VIDEO_ERROR = 'Error occured while fetching catalog video URL,  relURL: {0}, error : {1}';

CloudinaryConstants.CLD_GET_IMG_GLOBAL_TRANSFORM_ERROR = 'Error occured while fetching image global transformations, error : {0}';
CloudinaryConstants.CLD_GET_VIDEO_GLOBAL_TRANSFORM_ERROR = 'Error occured while fetching video global transformations, error : {0}';
CloudinaryConstants.CLD_GET_IMG_PROD_CAT_TRANSFORM_ERROR = 'Error occured while fetching image product/catalog level transformations, error : {0}';
CloudinaryConstants.CLD_GET_VIDEO_PROD_CAT_TRANSFORM_ERROR = 'Error occured while fetching video product/catalog level transformations, error : {0}';
CloudinaryConstants.CLD_GET_IMAGE_CATEGORY_TRANSFORM_ERROR = 'Error occurred while fetching image transformations specified on category level, error: {0}';
CloudinaryConstants.CLD_GET_VIDEO_CATEGORY_TRANSFORM_ERROR = 'Error occurred while fetching video transformations specified on category level, error: {0}';
CloudinaryConstants.CLD_GET_IMAGE_CATALOG_TRANSFORM_ERROR = 'Error occurred while fetching image transformations specified on catalog level, error: {0}';
CloudinaryConstants.CLD_GET_VIDEO_CATALOG_TRANSFORM_ERROR = 'Error occurred while fetching video transformations specified on catalog level, error: {0}';
CloudinaryConstants.CLD_GET_IMG_DIMENSIONS_ERROR = 'Error occured while fetching image global dimemsions, error : {0}';
CloudinaryConstants.CLD_GET_IMG_SRCSET_ERROR = 'Error occured while building image srcset for absolute URL, absURL: {0}, error : {1}';
CloudinaryConstants.CLD_GET_IMG_LIBRARY_TRANSFORM_ERROR = 'Error occured while fetching image library level transformations, error : {0}';
CloudinaryConstants.CLD_GET_VIDEO_LIBRARY_TRANSFORM_ERROR = 'Error occured while fetching video library level transformations, error : {0}';
CloudinaryConstants.CLD_GET_AUTO_UPLOAD_IMAGES_URLS_ERROR = 'Error occured while fetching images URLs through aut-uploading for product with ID : {0}, error : {1}';
CloudinaryConstants.CLD_GET_AUTO_UPLOAD_VIDEOS_URLS_ERROR = 'Error occured while fetching videos URLs through aut-uploading for product with ID : {0}, error : {1}';
CloudinaryConstants.CLD_GET_PRODUCT_CUSTOM_MAPPING_VIDEO_URL_ERROR = 'Error occured while fetching custom mapping video URL for product with ID : {0}, error : {1}';

// SCRIPT API constants
CloudinaryConstants.BREAKPOINTS_KEY = 'breakpoints';
CloudinaryConstants.DIMENSIONS_STRING_KEY = 'dimensionsString';
CloudinaryConstants.DIMENSIONS_KEY = 'dimensions';
CloudinaryConstants.RESPONSIVE_KEY = 'automateResponsivenessWithJS';
CloudinaryConstants.RESPONSIVE_DIMENSIONS_KEY = 'autoResponsiveDimensions';
CloudinaryConstants.DEFAULT_DIRECTORY = 'default/';
CloudinaryConstants.DEFAULT_DIRECTORY_WITHOUT_SLASH = 'default';
CloudinaryConstants.CONTENT_TYPE_IMG = 'image';
CloudinaryConstants.CONTENT_TYPE_VIDEO = 'video';
CloudinaryConstants.CONTENT_TYPE_RAW = 'raw';
CloudinaryConstants.SRCSET_KEY = 'srcset="';
CloudinaryConstants.SIZES_KEY = 'sizes="';
CloudinaryConstants.SIZE_KEY = 'size';
CloudinaryConstants.CLD_SMD_KEY_VALUE_PLACEHOLDER = '<SMDKEY:SMDVALUE>';
CloudinaryConstants.CLD_SMD_KEY_PLACEHOLDER = '<SMDKEY>';
CloudinaryConstants.CLD_SMD_VALUE_PLACEHOLDER = '<SMDVALUE>';
CloudinaryConstants.CLD_SITE_TRANSFORMS_PLACEHOLDER = '<SITE TRANSFORMS>';
CloudinaryConstants.CLD_PRODCAT_TRANSFORMS_PLACEHOLDER = '<PRODCAT TRANSFORMS>';
CloudinaryConstants.CLD_DIMENSIONS_PLACEHOLDER = '<DIMENSIONS>';
CloudinaryConstants.CLD_TAG_PLACEHOLDER = '<TAG>';
CloudinaryConstants.CLD_SMD_GALLERY_POSITION_KEY = 'sfcc-gallery-position';
CloudinaryConstants.CLD_SMD_ALT_TEXT_KEY = 'sfcc-alt-text';
CloudinaryConstants.VIDEO_VIEW_TYPE = 'video';
CloudinaryConstants.COLOR_ATTR = 'color';
CloudinaryConstants.SIZE_ATTR = 'size';
CloudinaryConstants.DW_STATIC_URL_REFERENCE = '/on/demandware.static';
CloudinaryConstants.SKU_CUSTOM_MAPPING_PACEHOLDER = '#sku#';
CloudinaryConstants.LOCALE_CUSTOM_MAPPING_PACEHOLDER = '#locale#';
CloudinaryConstants.NAME_CUSTOM_MAPPING_PACEHOLDER = '#name#';
CloudinaryConstants.COLOR_CUSTOM_MAPPING_PACEHOLDER = '#color#';
CloudinaryConstants.SIZE_CUSTOM_MAPPING_PLACEHOLDER = '#size#';

// Cloudinary page types
CloudinaryConstants.PAGE_TYPES = {
    PDP: 'pdp',
    PLP: 'plp',
    CART: 'cart',
    MINI_CART: 'miniCart',
    QUICK_VIEW: 'quickview',
    SEARCH_SUGGESTIONS: 'searchSuggestions',
    CHECKOUT: 'checkout',
    ORDER_CONFIRMATION: 'orderConfirmation',
    CLD_PLP_SWATCH: 'cldPlpSwatch',
    CLD_PDP_SWATCH: 'cldPdpSwatch',
    CLD_PRODUCT_NAV: 'cldProductNav',
    CATEGORY_BANNER: 'categoryBanner',
    RECOMMENDATION_TILE: 'recommendationTile',
    CLD_HOME_PAGE_TILE: 'cldhomePageProductTile',
    CLD_CART_PRODUCT_TILE: 'cldCartProductTile'
};

// API error codes
CloudinaryConstants.ERROR_CODES = {
    UNAUTHORIZED: 401
};

// Cartridge version : possible values are sitegenesis, sfra.
// Update this version when you start integrating the cartridge
CloudinaryConstants.SITE_VERSION_FOR_TEST_SUITE = 'sfra';

module.exports = CloudinaryConstants;
