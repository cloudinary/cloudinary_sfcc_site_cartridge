Cloudinary
==========

Cloudinary is a cloud service that offers a solution to any application's entire media management pipeline. 

Easily upload images and videos to the cloud.  Automatically perform smart media resizing, cropping and conversion without installing any complex software.  Collaborate with Marketing and other teams on the same physical asset that gets displayed on your website or the app, so there’s no mistakes due to copying or emailing content around.  Media is seamlessly delivered through a fast CDN, and much much more. 

Cloudinary offers a video component for the Salesforce B2C Commerce Page Designer.  Using this component and an accompanying Cloudinary account, you can add videos to your website pages with the click of a mouse.  Common operations such as changing video sizes, adding overlays, adapting to mobile devices are easily done through the cartridge using Cloudinary’s AI based media transformation capabilities.  Such videos are automatically transcoded to work on all popular browsers and mobile devices.  Cloudinary will optimize the videos to deliver the best quality with the least amount of bandwidth and time consumed, for a great user experience. Our comprehensive APIs and administration capabilities makes it easy to extend the cartridge functionality.

## Setup ######################################################################

### Get your Cloudinary account information 

If you don’t have a Cloudinary account, sign up for a [free account](https://cloudinary.com/users/register/free) so you can try out image and video transformations and seamless delivery through CDN.

Get your cloudname, api_key and api_secret from your Cloudinary account [as described here](https://cloudinary.com/documentation/solution_overview#access_identifiers) 

### Configuring the cartridges

Follow the [integration guides available in this repository](documentation). There are distinct integration guides for the LINK cartridge (integrating content libraries with Cloudinary) and for Page Designer. 

## Using the Page Designer cartridge ######################################################################

### Tagging content in Cloudinary
* Login to your cloudinary account and upload some videos and images to use as overlay logos.
* Make sure you add a tag called "SFCCPageDesigner" to these videos and images.  
  - This tag is used by default, but you can use any tag you want to.  But make sure you use this tag in the custom site preferences. 
* Any assets with this tag will now be available inside the page designer interface.

### Using the Cloudinary Video component
* In the page designer, browse the availalbe components, pick the Cloudinary Video component and place it on the page. 
* Open up the properties pane for the component.  
  - Pick the video you want to use.
  - Pick any presentation options you want to use.
  - For overlays, choose to insert overlays and then select the image you want to overlay.
  - Finally, chose options for the video player.
* Save the settings and preview the page with gorgeous video


## Additional resources ##########################################################

Additional resources are available at:

* [Website](https://cloudinary.com)
* [Interactive demo](https://demo.cloudinary.com/default)
* [Documentation](https://cloudinary.com/documentation)
* [Knowledge Base](https://support.cloudinary.com/hc/en-us)
* [Video transformations documentation](https://cloudinary.com/documentation/video_manipulation_and_delivery)
* [Image transformations documentation](https://cloudinary.com/documentation/image_transformations)

## Support

You can [open an issue through Cloudinary's GitHub](https://github.com/cloudinary/cloudinary_sfcc_pagedesigner/issues).

Contact us [https://cloudinary.com/contact](https://cloudinary.com/contact)

Stay tuned for updates, tips and tutorials: [Blog](https://cloudinary.com/blog), [Twitter](https://twitter.com/cloudinary), [Facebook](https://www.facebook.com/Cloudinary).

## Join the Community ##########################################################

Impact the product, hear updates, test drive new features and more! Join [here](https://www.facebook.com/groups/CloudinaryCommunity).
