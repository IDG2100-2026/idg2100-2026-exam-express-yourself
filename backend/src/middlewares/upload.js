import multer from "multer";
import { ALLOWED_IMAGE_MIME_TYPES, MAX_IMAGE_FILE_SIZE } from "../config/constants.js";

// Only allow image files up to 2mb. Rejects anything else before it hits the server.
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: MAX_IMAGE_FILE_SIZE },
  fileFilter: function (req, file, acceptFile) {
    if (ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
      acceptFile(null, true);
    } else {
      acceptFile(new Error("Only image files are allowed."), false);
    }
  },
});

export default upload;
