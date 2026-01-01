# Image Storage Configuration

## Overview

This application supports two image storage methods:
1. **Local Storage** (Development) - Images stored in `backend/uploads/` folder
2. **Cloudinary** (Production) - Images stored in cloud storage

## Development Setup (Local Storage)

By default, images are stored locally in the `backend/uploads/` folder.

### How it works:
- Images are saved to `backend/uploads/` directory
- Files are served via `/uploads` endpoint
- File paths stored in database: `/uploads/filename.jpg`

### Requirements:
- No additional setup needed
- Works only in development environment

## Production Setup (Cloudinary)

For production, use Cloudinary for reliable cloud storage.

### Step 1: Create Cloudinary Account

1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Get your credentials from the dashboard:
   - Cloud Name
   - API Key
   - API Secret

### Step 2: Configure Environment Variables

Add these to your production environment (Vercel, Railway, etc.):

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NODE_ENV=production
```

### Step 3: How it works

- Images are automatically uploaded to Cloudinary
- Cloudinary URLs are stored in database: `https://res.cloudinary.com/...`
- Images are optimized automatically (resize, compression)
- CDN delivery for fast loading

## Automatic Selection

The system automatically chooses storage method:

- **Development**: Uses local storage if `CLOUDINARY_CLOUD_NAME` is not set
- **Production**: Uses Cloudinary if `CLOUDINARY_CLOUD_NAME` is set and `NODE_ENV=production`

## Image Features

- **Max file size**: 4MB
- **Allowed formats**: JPEG, PNG, GIF, WebP
- **Max images per specialist**: 10
- **Auto optimization**: Images are automatically resized and optimized
- **CDN delivery**: Cloudinary provides global CDN

## Cloudinary Free Tier

- **Storage**: 25GB
- **Bandwidth**: 25GB/month
- **Transformations**: Unlimited
- **Perfect for**: Small to medium applications

## Migration from Local to Cloudinary

If you have existing images in local storage:

1. Set up Cloudinary credentials
2. Upload existing images to Cloudinary
3. Update database `file_path` values to Cloudinary URLs
4. Deploy with Cloudinary configuration

## Troubleshooting

### Images not uploading in production
- Check Cloudinary credentials are set correctly
- Verify `NODE_ENV=production`
- Check Cloudinary dashboard for upload errors

### Images not displaying
- Verify `file_path` in database contains valid URL
- Check CORS settings if using Cloudinary
- Ensure frontend can access Cloudinary CDN

## Alternative Storage Options

If you prefer other cloud storage:

1. **AWS S3**: Use `multer-s3` package
2. **Google Cloud Storage**: Use `@google-cloud/storage`
3. **Azure Blob Storage**: Use `@azure/storage-blob`

Modify `backend/src/middleware/upload-cloudinary.ts` to use your preferred storage.

