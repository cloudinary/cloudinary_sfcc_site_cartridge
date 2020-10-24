'use strict';

var $ = require('jquery');

window.renderCloudinaryGalleryWidget = function () {
    var imgUrls;
    var $cldEl = $('.cloudinary-data-container');
    var cloudinaryObj = $cldEl.data('cloudinary');

    if (cloudinaryObj) {
        if (cloudinaryObj.galleryEnabled && typeof cloudinary !== 'undefined') {
            var galleryOptions = cloudinaryObj.images.galleryWidget.options;
            window.cldGallery = cloudinary.galleryWidget(galleryOptions); // eslint-disable-line no-undef
            cldGallery.render(); // eslint-disable-line no-undef
        } else if (cloudinaryObj.images && cloudinaryObj.images.imageURLs) {
            imgUrls = cloudinaryObj.images.imageURLs;
        }
    }

    return imgUrls;
};

window.renderCloudinarySetGalleryWidgets = function () {
    var cldObj;
    var cldSetImages;

    $('.cloudinary-set-data-container').each(function () {
        cldObj = $(this).data('cloudinary');
        cldSetImages = $(this).data('cloudinary-set-images');

        if (cldObj && cldObj.isEnabled && cldSetImages && cldSetImages.galleryWidget &&
            cldObj.galleryEnabled && typeof cloudinary !== 'undefined') {
            window.cldGallery = cloudinary.galleryWidget(cldSetImages.galleryWidget.options); // eslint-disable-line no-undef
            cldGallery.render(); // eslint-disable-line no-undef
        }
    });
};

window.renderCloudinaryVideoPlayer = function () {
    var videoPlayerID;
    var cldObj;
    var cldURLs = [];

    $('.cloudinary-data-container').each(function () {
        cldObj = $(this).data('cloudinary');
        videoPlayerID = $(this).data('cloudinary-video-player-id');

        if (cldObj && cldObj.video && cldObj.video.videoURL &&
            cldObj.video.videoURL !== '' && cldObj.video.videoURL !== 'null') {
            if (cldObj.videoPlayerEnabled && typeof cloudinary !== 'undefined') {
                var cld = cloudinary.Cloudinary.new({ cloud_name: cldObj.cloudName }); // eslint-disable-line no-undef
                var player = cld.videoPlayer('cld-video-player' + (videoPlayerID ? '-' + videoPlayerID : ''), cldObj.video.widgetOptions);
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
    var $cldResponsiveImgTags = $('.cld-responsive');
    if ($cldResponsiveImgTags && $cldResponsiveImgTags.length > 0) {
        window.cldObj = window.cldObj || cloudinary.Cloudinary.new(); // eslint-disable-line no-undef
        window.cldObj.responsive(); // eslint-disable-line no-undef
    }
};

$(document).ready(function () {
    window.renderCloudinaryGalleryWidget();
    window.renderCloudinaryVideoPlayer();
    window.renderCloudinarySetGalleryWidgets();
    window.makeCloudinaryImagesResponsive();
});
