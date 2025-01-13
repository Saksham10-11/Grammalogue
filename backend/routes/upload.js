import express from 'express';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3-v3';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Configure S3 client
const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  region: process.env.AWS_REGION
});

// Configure multer to use S3 for storage
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, {
        fieldName: file.fieldname,
        questionIndex: req.body.questionIndex
      });
    },
    key: function (req, file, cb) {
      const fileName = `AI-interview/video/${Date.now()}_question_${req.body.questionIndex}_${file.originalname}`;
      cb(null, fileName);
    }
  }),
  fileFilter: (req, file, cb) => {
    // Accept video files
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max file size
  }
});

// Health check endpoint
router.get('/', (req, res) => {
  res.json({ message: 'Upload API is running' });
});

// Video upload endpoint
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log("File uploaded successfully to S3:", req.file.location);
    console.log("Question index:", req.body.questionIndex);

    // Return the S3 URL and additional metadata
    res.status(200).json({
      success: true,
      url: req.file.location,
      key: req.file.key,
      questionIndex: req.body.questionIndex
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      error: 'Failed to upload file',
      details: error.message
    });
  }
});

// Error handling middleware
router.use((error, req, res, next) => {
  console.error('Upload route error:', error);
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large. Maximum size is 50MB'
      });
    }
    return res.status(400).json({
      error: error.message
    });
  }
  res.status(500).json({
    error: error.message || 'Internal server error'
  });
});

export default router;