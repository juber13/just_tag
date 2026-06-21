import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? process.env.CLODINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY ?? process.env.CLODINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET ?? process.env.CLODINARY_API_SECRET,
});

function publicIdFromCloudinaryUrl(url) {
    if (!url || !url.includes('res.cloudinary.com')) return null;
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^/]+$/);
    return match?.[1] ?? null;
}

export async function deleteCloudinaryImage(imageUrl) {
    const publicId = publicIdFromCloudinaryUrl(imageUrl);
    if (!publicId) return;

    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    } catch (error) {
        console.error('Error deleting Cloudinary image:', error);
    }
}

export async function uploadImageBuffer(buffer, folder = 'justtag/profiles') {
    if (!buffer?.length) return null;

    return new Promise((resolve) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: 'image' },
            (error, result) => {
                if (error) {
                    console.error('Error uploading image to Cloudinary:', error);
                    resolve(null);
                    return;
                }
                resolve(result.secure_url);
            },
        );
        stream.end(buffer);
    });
}

export async function uploadImage(image) {
    try {
        const result = await cloudinary.uploader.upload(image, {
            folder: 'justtag/profiles',
            resource_type: 'image',
        });
        return result.secure_url;
    } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        return null;
    }
}
