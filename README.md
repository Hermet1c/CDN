# CDN For ShareX
This cdn also supports link embeds

## How to setup
- Download [ShareX](https://getsharex.com)
 - Download the 2 .sxcu Files (These are the configuration files for ShareX)
- Import the files into ShareX
- Change the link at the top
  - For the Media.sxcu, the link should be https://yourdomain.name/ . This is used to upload media files such as images, videos, and text
  - for the LinkShortner.sxcu, The link should be https://youdomain.name/links . This is used to create shortlinks
- Fill out the fields found in the headers box, the passphrase header will be used to authenticate your connection to the server so you can upload media
- Open the index.js file and edit the first 4 lines
  - For the passphrase, this can be anything, but this has to be the same value as the passphrase in the ShareX uploader header settings
  - Change TLS to true if you want to use a secure connection to transfer data
  - If TLS is true, you will need to change the second two lines to the private key of the certificates and the full certificate chain
- Upload this code to the server and run 'npm i', then 'node .' to start the server then you can begin using the CDN for your own use


