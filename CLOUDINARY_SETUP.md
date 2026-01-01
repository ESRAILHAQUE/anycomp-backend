# Cloudinary Image Upload Setup

## ✅ Cloudinary Configuration

Cloudinary image upload এখন fully functional। 

### How it Works:

1. **Automatic Detection**: 
   - Production environment (`NODE_ENV=production` বা `VERCEL=true`) এবং `CLOUDINARY_CLOUD_NAME` set থাকলে Cloudinary use হবে
   - Otherwise local storage use হবে (development)

2. **File Upload Process**:
   - Images upload হলে Cloudinary-তে automatically save হবে
   - Cloudinary URL (`secure_url` বা `url`) database-এ `file_path` field-এ store হবে
   - Format: `https://res.cloudinary.com/{cloud_name}/image/upload/...`

3. **Image Optimization**:
   - Auto resize: Max 1200x1200px
   - Auto format optimization
   - Quality: Auto
   - Folder: `anycomp/specialists`

### Environment Variables Required:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NODE_ENV=production
```

### File Object Structure (Cloudinary):

When using Cloudinary, the file object contains:
- `file.secure_url` - Secure HTTPS URL (preferred)
- `file.url` - Regular URL (fallback)
- `file.path` - May contain URL if starts with 'http'
- `file.originalname` - Original filename
- `file.size` or `file.bytes` - File size

### Testing:

1. **Check Environment Variables**:
   ```bash
   echo $CLOUDINARY_CLOUD_NAME
   echo $CLOUDINARY_API_KEY
   ```

2. **Upload an Image**:
   - Create a specialist with images
   - Check database `media` table
   - `file_path` should contain Cloudinary URL

3. **Verify in Cloudinary Dashboard**:
   - Go to Cloudinary Media Library
   - Check `anycomp/specialists` folder
   - Images should be there

### Troubleshooting:

1. **Images not uploading**:
   - Check Cloudinary credentials are correct
   - Verify `NODE_ENV=production` or `VERCEL=true`
   - Check Cloudinary dashboard for errors

2. **URL not saving**:
   - Check controller logs
   - Verify `file.secure_url` or `file.url` exists
   - Check database connection

3. **Images not displaying**:
   - Verify Cloudinary URL is accessible
   - Check CORS settings
   - Ensure frontend can access Cloudinary CDN

### Code Location:

- **Config**: `backend/src/config/cloudinary.ts`
- **Middleware**: `backend/src/middleware/upload-cloudinary.ts`
- **Controller**: `backend/src/controllers/specialist.controller.ts` (lines 181-212)
- **Routes**: `backend/src/routes/specialist.routes.ts` (line 53)

