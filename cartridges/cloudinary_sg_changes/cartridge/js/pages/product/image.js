'use strict';
var dialog = require('../../dialog');
var util = require('../../util');
var qs = require('qs');
var url = require('url');
var _ = require('lodash');

var zoomMediaQuery = matchMedia('(min-width: 960px)');

/**
 * @description Enables the zoom viewer on the product detail page
 * @param zmq {Media Query List}
 */
function loadZoom (zmq) {
    var $imgZoom = $('#pdpMain .main-image'),
        hiresUrl;
    if (!zmq) {
        zmq = zoomMediaQuery;
    }
    if ($imgZoom.length === 0 || dialog.isActive() || util.isMobile() || !zoomMediaQuery.matches) {
        // remove zoom
        $imgZoom.trigger('zoom.destroy');
        return;
    }
    hiresUrl = $imgZoom.attr('href');

    if (hiresUrl && hiresUrl !== 'null' && hiresUrl.indexOf('noimagelarge') === -1 && zoomMediaQuery.matches) {
        $imgZoom.zoom({
            url: hiresUrl
        });
    }
}

zoomMediaQuery.addListener(loadZoom);

/**
 * @description Sets the main image attributes and the href for the surrounding <a> tag
 * @param {Object} atts Object with url, alt, title and hires properties
 */
function setMainImage (atts) {
    $('#pdpMain .primary-image').attr({
        src: atts.url,
        alt: atts.alt,
        title: atts.title
    });
    updatePinButton(atts.url);
    if (!dialog.isActive() && !util.isMobile()) {
        $('#pdpMain .main-image').attr('href', atts.hires);
    }
    loadZoom();
}

function updatePinButton (imageUrl) {
    var pinButton = document.querySelector('.share-icon[data-share=pinterest]');
    if (!pinButton) {
        return;
    }
    var newUrl = imageUrl;
    if (!imageUrl) {
        // Custom Start: Replace pinterest button url //
        var primaryImg = document.querySelector('#pdpMain .primary-image');
        if (primaryImg && primaryImg.length > 0) {
            newUrl = primaryImg.getAttribute('src');
        } else {
            newUrl = document.querySelector('.share-icon[data-share=pinterest]').getAttribute('href');
        }
        // Custom End: Replace pinterest button url //
    }
    var href = url.parse(pinButton.href);
    var query = qs.parse(href.query);
    query.media = url.resolve(window.location.href, newUrl);
    query.url = window.location.href;
    var newHref = url.format(_.extend({}, href, {
        query: query, // query is only used if search is absent
        search: qs.stringify(query)
    }));
    pinButton.href = newHref;
}

/**
 * @description Replaces the images in the image container, for eg. when a different color was clicked.
 */
function replaceImages () {
    var $newImages = $('#update-images'),
        $imageContainer = $('#pdpMain .product-image-container');
    if ($newImages.length === 0) { return; }

 // Custom start: Update cloudinary PGW //
    var cloudinary = $newImages.data('cld');
    if (cloudinary && cloudinary.isEnabled && cloudinary.isGalleryEnabled) {
        if (typeof cldGallery !== 'undefined' && cldGallery && cloudinary.galleryWidgetOptions && cloudinary.galleryWidgetOptions.mediaAssets) {
            var galleryOptions = cloudinary.galleryWidgetOptions;
            if (cloudinary.container) {
                galleryOptions.container = cloudinary.container;
            }
            cldGallery.update(galleryOptions);
        }
    } else {
        $imageContainer.html($newImages.html());
    }
    // Custom end: Update cloudinary PGW //

    $newImages.remove();
    loadZoom();
}

/* @module image
 * @description this module handles the primary image viewer on PDP
 **/

/**
 * @description by default, this function sets up zoom and event handler for thumbnail click
 **/
module.exports = function () {
    if (dialog.isActive() || util.isMobile()) {
        $('#pdpMain .main-image').removeAttr('href');
    }
    updatePinButton();
    loadZoom();
    // handle product thumbnail click event
    $('#pdpMain').on('click', '.productthumbnail', function () {
        // switch indicator
        $(this).closest('.product-thumbnails').find('.thumb.selected').removeClass('selected');
        $(this).closest('.thumb').addClass('selected');

        setMainImage($(this).data('lgimg'));
    });
};
module.exports.loadZoom = loadZoom;
module.exports.setMainImage = setMainImage;
module.exports.replaceImages = replaceImages;
