import { IMAGE_BASE_URL } from './config';

export const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http') || imagePath.startsWith('blob:')) {
        return imagePath;
    }
    return `${IMAGE_BASE_URL}${imagePath}`;
};
