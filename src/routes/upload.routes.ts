import { Router } from "express";
import crypto from "crypto";

const router = Router();

// Returns a Cloudinary signature for direct-from-browser uploads.
// Client uploads file directly to Cloudinary, then sends secure_url to our API for DB persistence.
router.get("/cloudinary-signature", (req, res) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(500).json({
      status: "error",
      message: "Cloudinary is not configured",
    });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "anycomp/specialists";

  // Cloudinary signature: sha1 of "folder=...&timestamp=...<api_secret>"
  const toSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash("sha1").update(toSign).digest("hex");

  return res.status(200).json({
    status: "success",
    data: {
      cloudName,
      apiKey,
      timestamp,
      folder,
      signature,
    },
  });
});

export default router;
