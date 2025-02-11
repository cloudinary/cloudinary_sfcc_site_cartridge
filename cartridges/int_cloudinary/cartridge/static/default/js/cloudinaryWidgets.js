/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

    "use strict";


    window.renderCloudinaryGalleryWidget = function () {
        let imgUrls;
        const cldElements = document.querySelectorAll('.cloudinary-data-container');
    
        cldElements.forEach(el => {
            const cloudinaryObj = typeof el.dataset.cloudinary === "string" && el.dataset.cloudinary.trim().startsWith("{")
                ? JSON.parse(el.dataset.cloudinary)
                : el.dataset.cloudinary;
    
            if (cloudinaryObj) {
                if (cloudinaryObj.galleryEnabled && typeof cloudinary !== 'undefined') {
                    let galleryOptions = cloudinaryObj.images.galleryWidget.options;
                    if (cloudinaryObj.domain !== 'res.cloudinary.com') {
                        galleryOptions.SecureDistribution = cloudinaryObj.domain;
                        galleryOptions.privateCdn = true;
                    }
                    window.cldGallery = window.cldProductGallery ? window.cldProductGallery.galleryWidget(galleryOptions) : (cloudinary.galleryWidget && cloudinary.galleryWidget(galleryOptions));
                    window.cldGallery && window.cldGallery.render();
                } else if (cloudinaryObj.images && cloudinaryObj.images.imageURLs) {
                    imgUrls = cloudinaryObj.images.imageURLs;
                }
            }
        });
    
        return imgUrls;
    };
    
    window.renderCloudinarySetGalleryWidgets = function () {
        document.querySelectorAll('.cloudinary-set-data-container').forEach(el => {
            let cldObj = el.dataset.cloudinary && el.dataset.cloudinary.trim().startsWith("{") ? JSON.parse(el.dataset.cloudinary) : el.dataset.cloudinary;
            let cldSetImages = el.dataset.cloudinarySetImages && el.dataset.cloudinarySetImages.trim().startsWith("{") ? JSON.parse(el.dataset.cloudinarySetImages) : el.dataset.cloudinarySetImages;
    
            if (cldObj && cldObj.isEnabled && cldSetImages && cldSetImages.galleryWidget &&
                cldObj.galleryEnabled && typeof cloudinary !== 'undefined') {
                if (cldObj.domain !== 'res.cloudinary.com') {
                    cldSetImages.galleryWidget.options.SecureDistribution = cldObj.domain;
                    cldSetImages.galleryWidget.options.privateCdn = true;
                }
                window.cldGallery = window.cldProductGallery ? window.cldProductGallery.galleryWidget(cldSetImages.galleryWidget.options) : (cloudinary.galleryWidget && cloudinary.galleryWidget(cldSetImages.galleryWidget.options));
                window.cldGallery && window.cldGallery.render();
            }
        });
    };
    
    window.renderCloudinaryVideoPlayer = function () {
        let cldURLs = [];
    
        document.querySelectorAll('.cloudinary-data-container').forEach(el => {
            let cldObj = el.dataset.cloudinary && el.dataset.cloudinary.trim().startsWith("{") ? JSON.parse(el.dataset.cloudinary) : el.dataset.cloudinary;
            let videoPlayerID = el.dataset.cloudinaryVideoPlayerId;
    
            if (cldObj && cldObj.video && cldObj.video.videoURL && cldObj.video.videoURL !== '' && cldObj.video.videoURL !== 'null') {
                if (cldObj.videoPlayerEnabled && typeof cloudinary !== 'undefined') {
                    if (cldObj.domain !== 'res.cloudinary.com') {
                        cldObj.video.widgetOptions.privateCdn = true;
                        cldObj.video.widgetOptions.secureDistribution = cldObj.domain;
                    }
                    let cld = window.cldVideoPlayer.new({ cloud_name: cldObj.cloudName });
                    let player = cld.videoPlayer('cld-video-player' + (videoPlayerID ? '-' + videoPlayerID : ''), cldObj.video.widgetOptions);
                    player.source(cldObj.video.videoURL, {}).play();
                    player.transformation(cldObj.video.widgetOptions.transformations);
                } else {
                    cldURLs.push(cldObj.video.videoURL);
                }
            }
        });
    
        return cldURLs;
    };
    
    window.makeCloudinaryImagesResponsive = function () {
        const cldResponsiveImgTags = document.querySelectorAll('.cld-responsive');
        const cldEl = document.querySelector('.cloudinary-data-container');
        const cloudinaryObj = cldEl.dataset.cloudinary;
    
        if (cldResponsiveImgTags.length > 0) {
            if (window.cldObj === undefined && window.cloudinary && window.cloudinary.default) {
                window.cldObj = window.cloudinary.default.Cloudinary.new({ cloud_name: cloudinaryObj.cloudName || cloudinaryObj });
            }
            window.cldObj && window.cldObj.responsive();
        }
    };
    
    document.addEventListener('DOMContentLoaded', () => {
        window.renderCloudinaryVideoPlayer();
        window.makeCloudinaryImagesResponsive();
    
        const iconNextPrev = document.querySelector('.icon-next, .icon-prev');
        if (iconNextPrev) {
            iconNextPrev.addEventListener('click', () => {
                setTimeout(() => {
                    window.makeCloudinaryImagesResponsive();
                }, 0);
            });
        }
    });
    
    
    /***/ })
    /******/ ]);