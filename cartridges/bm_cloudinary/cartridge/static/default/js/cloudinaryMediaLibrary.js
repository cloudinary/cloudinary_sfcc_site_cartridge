document.addEventListener("DOMContentLoaded", function(event) {
    var mediaLibraryContainer = document.querySelector('.clodinary-media-library');
    var mloptions = JSON.parse(mediaLibraryContainer.dataset.cloudinaryml);
    mloptions.inline_container = '.clodinary-media-library';
    mloptions.insert_caption = '';

    if (typeof cloudinary !== 'undefined') {
        window.ml = cloudinary.createMediaLibrary(mloptions, {});
        window.ml.show();
    }
});
