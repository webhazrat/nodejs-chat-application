// external imports
import multer from "multer";
import path from "path";
import createError from "http-errors";

const __dirname = path.resolve();

export default function uploader(
  subfolderPath,
  allowedFileTypes,
  maxFileSize,
  maxNumberOfFiles,
  errorMsg
) {
  // file upload folder
  const UPLOADS_FOLDER = `${__dirname}/public/uploads/${subfolderPath}`;

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, UPLOADS_FOLDER);
    },
    filename: (req, file, cb) => {
      const fileExt = path.extname(file.originalname);
      const fileName =
        file.originalname
          .replace(fileExt, "")
          .toLowerCase()
          .split(" ")
          .join("-") +
        "-" +
        Date.now();
      cb(null, fileName + fileExt);
    },
  });

  // prepare the final multer upload object
  const upload = multer({
    storage: storage,
    limits: {
      fileSize: maxFileSize,
    },
    fileFilter: (req, file, cb) => {
      if (req.files.length > maxNumberOfFiles) {
        cb(
          createError(
            `Maximum ${maxNumberOfFiles} files are allowed to upload!`
          )
        );
      } else {
        if (allowedFileTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(createError(errorMsg));
        }
      }
    },
  });

  return upload;
}
