import fs from 'fs';
import path from 'path';

function toDataUri(imgPath) {
    try {
        if (!fs.existsSync(imgPath)) {
            throw new Error(`File does not exist: ${imgPath}`);
        }

        const bitmap = fs.readFileSync(imgPath);
        
        if (bitmap.length === 0) {
            throw new Error(`File is empty: ${imgPath}`);
        }

        const base64Image = Buffer.from(bitmap).toString('base64');
        
        const ext = path.extname(imgPath).toLowerCase();
        
        const mimeTypeMap = {
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.bmp': 'image/bmp',
            '.svg': 'image/svg+xml',
            '.heic': 'image/heif',
            '.heif': 'image/heif',
            '.tiff': 'image/tiff',
            '.tif': 'image/tiff'
        };

        const mimeType = mimeTypeMap[ext];
        
        if (!mimeType) {
            throw new Error(`Unsupported image format: ${ext} for file: ${imgPath}`);
        }

        // Complete data URI
        const uri = {
            datatype: mimeType,
            encodeas: 'base64',
            filedata: base64Image,
            originalPath: imgPath
        };

        return uri;
    } catch (error) {
        console.error(`Error processing ${imgPath}:`, error.message);
        throw error;
    }
}

export default toDataUri;