import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  IconButton,
  Typography,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import * as mammoth from 'mammoth';

interface DocxPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  file: File | string; // Can be a File object or a URL string
  title?: string;
}

const DocxPreviewDialog: React.FC<DocxPreviewDialogProps> = ({
  open,
  onClose,
  file,
  title = 'Document Preview',
}) => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      // Reset state when dialog closes
      setHtmlContent('');
      setError(null);
      return;
    }

    const previewDocx = async () => {
      setLoading(true);
      setError(null);

      try {
        let arrayBuffer: ArrayBuffer;

        if (typeof file === 'string') {
          // Handle URL case
          const response = await fetch(file);
          if (!response.ok) {
            throw new Error(`Failed to fetch document: ${response.statusText}`);
          }
          arrayBuffer = await response.arrayBuffer();
        } else {
          // Handle File case
          arrayBuffer = await file.arrayBuffer();
        }

        const result = await mammoth.convertToHtml({ arrayBuffer });
        // For better formatting, you could use convertToHtml instead of extractRawText
        // const result = await mammoth.convertToHtml({ arrayBuffer });
        // Apply some basic styling to tables if needed
        const resHtml = `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Admission Requirements</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                max-width: 800px;
                margin: 0 auto;
              }
              h1, h2, h3 {
                color: #2c3e50;
              }
              table {
                border-collapse: collapse;
                width: 100%;
                margin: 20px 0;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
              }
              th {
                background-color: #f2f2f2;
              }
              ul, ol {
                padding-left: 20px;
              }
            </style>
          </head>
          <body>
            ${result.value}
          </body>
        </html>`
        setHtmlContent(resHtml);
      } catch (err) {
        console.error('Error processing DOCX file:', err);
        setError('Failed to load document. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    previewDocx();
  }, [open, file]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: '80vh',
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h6">{title}</Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </div>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <div
            style={{
              overflowY: 'auto',
              height: '100%',
              padding: '8px',
            }}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
        <Button
          onClick={() => {
            // Implement download functionality if needed
            if (typeof file === 'string') {
              window.open(file, '_blank');
            } else {
              const url = URL.createObjectURL(file);
              const a = document.createElement('a');
              a.href = url;
              a.download = file.name;
              a.click();
              URL.revokeObjectURL(url);
            }
          }}
          color="primary"
        >
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocxPreviewDialog;