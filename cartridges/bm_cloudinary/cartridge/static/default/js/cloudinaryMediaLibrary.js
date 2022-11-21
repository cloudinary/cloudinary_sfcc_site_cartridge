document.addEventListener("DOMContentLoaded", function(event) {
    var mediaLibraryContainer = document.querySelector('.clodinary-media-library');
    var mloptions = JSON.parse(mediaLibraryContainer.dataset.cloudinaryml);
    mloptions.inline_container = '.clodinary-media-library';
    mloptions.insert_caption = '';

    if (typeof cloudinary !== 'undefined') {
        window.ml = cloudinary.createMediaLibrary(mloptions, {
            integration: {
               type: mloptions.integration.type,
               platform: mloptions.integration.platform,
               version: mloptions.integration.version,
               environment: mloptions.integration.environment
            }    
        });
        window.ml.show();
    }
});
