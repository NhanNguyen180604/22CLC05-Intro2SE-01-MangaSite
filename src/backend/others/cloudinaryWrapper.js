const cloudinary = require('cloudinary');

// upload images of a chapter to the cloud
const upload = async function cloudinaryUploadWrapper(images, folder) {
    cloudinary.v2.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_KEY,
        api_secret: process.env.CLOUDINARY_SECRET
    });

    const urls = await Promise.all(images.map(async (image) => {
        const uploadResult = await cloudinary.v2.uploader.upload(
            image,
            { folder: folder }
        );
        return uploadResult.secure_url;
    }));

    return urls;
};

// delete all images of a chapter on the cloud
const deleteImages = async function cloudinaryDeleteWrapper(folder) {
    cloudinary.v2.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_KEY,
        api_secret: process.env.CLOUDINARY_SECRET
    });

    await cloudinary.v2.api.delete_resources_by_prefix(folder);
};

// upload a cover of a manga to the cloud
const uploadCover = async function cloudinaryUploadWrapper(image, folder) {
    cloudinary.v2.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_KEY,
        api_secret: process.env.CLOUDINARY_SECRET
    });

    const url = await cloudinary.v2.uploader.upload(image, { folder: folder });
    return [url.public_id, url.secure_url];
};

// delete resources on the cloud
const deleteResources = async function cloudinaryDeleteResourcesWrapper(publicIDs) {
    cloudinary.v2.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_KEY,
        api_secret: process.env.CLOUDINARY_SECRET
    });

    await cloudinary.v2.api.delete_resources(publicIDs);
};

// delete a folder
const deleteFolder = async function cloudinaryDeleteFolderWrapper(folder) {
    cloudinary.v2.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_KEY,
        api_secret: process.env.CLOUDINARY_SECRET
    });

    await cloudinary.v2.api.delete_folder(folder);
}

module.exports = { upload, uploadCover, deleteResources, deleteImages, deleteFolder };