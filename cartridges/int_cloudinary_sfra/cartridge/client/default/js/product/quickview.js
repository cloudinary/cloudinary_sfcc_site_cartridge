'use strict';

var baseQuickView = require('base/product/quickView');
var cloudinary = require('../cloudinary/cloudinary');

/**
 * Generates the modal window on the first call.
 *
 */
function getModalHtmlElement() {
    if ($('#quickViewModal').length !== 0) {
        $('#quickViewModal').remove();
    }
    var htmlString = '<!-- Modal -->'
        + '<div class="modal fade" id="quickViewModal" role="dialog">'
        + '<span class="enter-message sr-only" ></span>'
        + '<div class="modal-dialog quick-view-dialog">'
        + '<!-- Modal content-->'
        + '<div class="modal-content">'
        + '<div class="modal-header">'
        + '    <a class="full-pdp-link" href=""></a>'
        + '    <button type="button" class="close pull-right" data-dismiss="modal">'
        + '        <span aria-hidden="true">&times;</span>'
        + '        <span class="sr-only"> </span>'
        + '    </button>'
        + '</div>'
        + '<div class="modal-body"></div>'
        + '<div class="modal-footer"></div>'
        + '</div>'
        + '</div>'
        + '</div>';
    $('body').append(htmlString);
}

/**
 * @typedef {Object} QuickViewHtml
 * @property {string} body - Main Quick View body
 * @property {string} footer - Quick View footer content
 */

/**
 * Parse HTML code in Ajax response
 *
 * @param {string} html - Rendered HTML from quickview template
 * @return {QuickViewHtml} - QuickView content components
 */
function parseHtml(html) {
    var $html = $('<div>').append(html);
    var body = $html.find('.product-quickview');
    var footer = $html.find('.modal-footer').children();

    return { body: body, footer: footer };
}

/**
 * replaces the content in the modal window on for the selected product variation.
 * @param {string} selectedValueUrl - url to be used to retrieve a new product model
 */
function fillModalElement(selectedValueUrl) {
    $('.modal-body').spinner().start();
    $.ajax({
        url: selectedValueUrl,
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            var parsedHtml = parseHtml(data.renderedTemplate);

            $('#quickViewModal .modal-body').empty();
            $('#quickViewModal .modal-body').html(parsedHtml.body);
            $('#quickViewModal .modal-footer').html(parsedHtml.footer);
            $('#quickViewModal .full-pdp-link').text(data.quickViewFullDetailMsg);
            $('#quickViewModal .full-pdp-link').attr('href', data.productUrl);
            $('#quickViewModal .size-chart').attr('href', data.productUrl);
            $('#quickViewModal .modal-header .close .sr-only').text(data.closeButtonText);
            $('#quickViewModal .enter-message').text(data.enterDialogMessage);
            $('#quickViewModal').modal('show');
            // Custom start: add cloudinary PGW
            if (data.cloudinary && data.cloudinary.isEnabled) {
                if (data.cloudinary.isSetBundle && typeof window.renderCloudinarySetGalleryWidgets !== 'undefined') {
                    window.renderCloudinarySetGalleryWidgets();
                } else if (typeof window.renderCloudinaryGalleryWidget !== 'undefined') {
                    window.renderCloudinaryGalleryWidget();
                }
            }
            // Custom end: add cloudinary PGW

            $.spinner().stop();
        },
        error: function () {
            $.spinner().stop();
        }
    });
}

baseQuickView.showQuickview = function () {
    $('body').off('click').on('click', '.quickview', function (e) {
        e.preventDefault();
        var selectedValueUrl = $(this).closest('a.quickview').attr('href');
        $(e.target).trigger('quickview:show');
        getModalHtmlElement();
        fillModalElement(selectedValueUrl);
    });
};

baseQuickView.updateAttribute = function () {
    $('body').off('product:afterAttributeSelect').on('product:afterAttributeSelect', function (e, response) {
        // custom start: update cloudinary PGW
        cloudinary.updateCloudinaryGalleryWidget(response.data.cloudinary);
        // custom end: update cloudinary PGW
        if ($('.modal.show .product-quickview>.bundle-items').length) {
            $('.modal.show').find(response.container).data('pid', response.data.product.id);
            $('.modal.show').find(response.container)
                .find('.product-id').text(response.data.product.id);
        } else if ($('.set-items').length) {
            response.container.find('.product-id').text(response.data.product.id);
        } else {
            $('.modal.show .product-quickview').data('pid', response.data.product.id);
            $('.modal.show .full-pdp-link')
                .attr('href', response.data.product.selectedProductUrl);
        }
    });
};

module.exports = baseQuickView;
