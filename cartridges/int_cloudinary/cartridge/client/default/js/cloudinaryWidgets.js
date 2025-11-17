'use strict';

window.renderCloudinaryGalleryWidget = function () {
    let imgUrls;
    const cldElements = document.getElementsByClassName('cloudinary-data-container');

    for (const el of cldElements) {
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
    };

    return imgUrls;
};

window.renderCloudinarySetGalleryWidgets = function () {
    const dataContainer = document.getElementsByClassName('cloudinary-set-data-container')
    for (const el of dataContainer) {
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
    };
};

window.renderCloudinaryVideoPlayer = function () {
    let cldURLs = [];
    const dataContainer = document.getElementsByClassName('cloudinary-data-container')
    for (const el of dataContainer) {
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
                player.source(cldObj.video.videoURL.publicId, {});
            } else {
                cldURLs.push(cldObj.video.videoURL);
            }
        }
    };

    return cldURLs;
};

window.makeCloudinaryImagesResponsive = function () {
    const cldResponsiveImgTags = document.querySelectorAll('.cld-responsive');
    const cldEl = document.getElementsByClassName('cloudinary-data-container');
    const cloudinaryObj = cldEl[0].dataset.cloudinary;

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
