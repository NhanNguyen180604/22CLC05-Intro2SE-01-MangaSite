const cloudinary = require('cloudinary');
const asyncHandler = require('express-async-handler');

// upload images of a chapter to the cloud
const uploadImages = asyncHandler(async function cloudinaryUploadWrapper(images, folder) {
    cloudinary.v2.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_KEY,
        api_secret: process.env.CLOUDINARY_SECRET
    });

    const urls = await Promise.all(images.map(async (image) => {
        try {
            // Remove the data URL prefix if present
            const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, 'base64');

            // Upload the image using a stream
            const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.v2.uploader.upload_stream(
                    { folder },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        }
                        else {
                            resolve(result);
                        }
                    }
                );
                stream.end(buffer);
            });

            // Return the secure URL
            return uploadResult.secure_url;
        }
        catch (error) {
            for (const [key, value] of Object.entries(error)) {
                console.error(`${key}:`);
            }
            throw new Error(error.error);
        }
    }));

    return urls;
});

// delete all resources by prefix on the cloud
const deleteByPrefix = asyncHandler(async function cloudinaryDeleteWrapper(folder) {
    cloudinary.v2.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_KEY,
        api_secret: process.env.CLOUDINARY_SECRET
    });

    try {
        await cloudinary.v2.api.delete_resources_by_prefix(folder);
    }
    catch (error) {
        throw new Error(error.error);
    }
});

// upload an image to the cloud
const uploadSingleImage = asyncHandler(async function cloudinaryUploadWrapper(image, folder) {
    cloudinary.v2.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_KEY,
        api_secret: process.env.CLOUDINARY_SECRET
    });

    try {
        // Remove the data URL prefix if present
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');

        // Upload the image using a stream
        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.v2.uploader.upload_stream(
                { folder },
                (error, result) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(result);
                    }
                }
            );
            stream.end(buffer);
        });

        // Return the secure URL
        return [uploadResult.public_id, uploadResult.secure_url];
    }
    catch (error) {
        throw new Error(error.error);
    }
});

// delete resources on the cloud
const deleteResources = asyncHandler(async function cloudinaryDeleteResourcesWrapper(publicIDs) {
    cloudinary.v2.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_KEY,
        api_secret: process.env.CLOUDINARY_SECRET
    });

    try {
        await cloudinary.v2.api.delete_resources(publicIDs);
    }
    catch (error) {
        throw new Error(error.error);
    }
});

// delete a folder
const deleteFolder = asyncHandler(async function cloudinaryDeleteFolderWrapper(folder) {
    cloudinary.v2.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_KEY,
        api_secret: process.env.CLOUDINARY_SECRET
    });

    try {
        await cloudinary.v2.api.delete_folder(folder);
    }
    catch (error) {
        throw new Error(error.error);
    }
});

module.exports = { uploadImages, uploadSingleImage, deleteResources, deleteByPrefix, deleteFolder };