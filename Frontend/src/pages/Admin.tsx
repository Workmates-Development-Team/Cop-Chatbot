import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import Helplines from '@/components/Helplines';

const Admin = () => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [fileUrls, setFileUrls] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (files: FileList) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    Array.from(files).forEach((file) => {
      if (validTypes.includes(file.type)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      toast({
        title: 'Invalid File Type(s)',
        description: `The following files are not PDFs or images (JPEG, PNG, GIF): ${invalidFiles.join(', ')}`,
        variant: 'destructive',
      });
    }

    if (validFiles.length > 0) {
      setUploadedFiles((prev) => [...prev, ...validFiles]);
      setFileUrls((prev) => [...prev, ...validFiles.map((file) => URL.createObjectURL(file))]);
      toast({
        title: 'Files Selected',
        description: `${validFiles.map((file) => file.name).join(', ')} uploaded.`,
      });
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleFileUpload(files);
      event.target.value = ''; // Reset input
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const files = event.dataTransfer.files;
    if (files) {
      handleFileUpload(files);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUpdateKnowledgeBase = async () => {
    if (uploadedFiles.length === 0) return;
    setIsUpdating(true);
    try {
      const formData = new FormData();
      uploadedFiles.forEach((file) => {
        formData.append('files', file); // Append each file under 'files'
      });

      // Placeholder API endpoint
      const response = await fetch('https://your-backend-api/update-knowledge-base', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update knowledge base');
      }

      toast({
        title: 'Knowledge Base Updated',
        description: `Knowledge base updated with ${uploadedFiles.length} file(s): ${uploadedFiles
          .map((file) => file.name)
          .join(', ')}!`,
      });
      setUploadedFiles([]);
      setFileUrls([]);
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'An error occurred while updating the knowledge base.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    const newUrls = fileUrls.filter((_, i) => i !== index);
    URL.revokeObjectURL(fileUrls[index]); // Clean up URL
    setUploadedFiles(newFiles);
    setFileUrls(newUrls);
    if (newFiles.length === 0) {
      toast({
        title: 'File Removed',
        description: 'All files have been removed.',
      });
    }
  };

  return (
    <div className="bg-white">
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <Card className="w-full max-w-lg shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Admin File Upload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!uploadedFiles.length && (
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Button
                    variant="default"
                    size="icon"
                    className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 mb-4"
                    disabled={isUploading}
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('file-upload') as HTMLInputElement | null;
                      if (input) input.click();
                    }}
                  >
                    <Upload className="w-7 h-7" />
                  </Button>
                  <p className="text-sm text-gray-600">
                    Drag and drop PDFs or images here, or click to select
                  </p>
                  <input
                    id="file-upload"
                    type="file"
                    accept="application/pdf,image/jpeg,image/png,image/gif"
                    onChange={handleInputChange}
                    className="hidden"
                    disabled={isUploading}
                    multiple
                  />
                </label>
                {isUploading && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Uploading...</span>
                  </div>
                )}
              </div>
            )}

            {uploadedFiles.length > 0 && (
              <div className="space-y-4">
                <div className="flex flex-col items-center">
                  {/* Show upload button even after files are uploaded */}
                  <label htmlFor="file-upload" className="cursor-pointer mb-2">
                    <Button
                      variant="default"
                      size="icon"
                      className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700"
                      disabled={isUploading}
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('file-upload') as HTMLInputElement | null;
                        if (input) input.click();
                      }}
                    >
                      <Upload className="w-7 h-7" />
                    </Button>
                    <input
                      id="file-upload"
                      type="file"
                      accept="application/pdf,image/jpeg,image/png,image/gif"
                      onChange={handleInputChange}
                      className="hidden"
                      disabled={isUploading}
                      multiple
                    />
                  </label>
                </div>
                <p className="text-sm text-green-600 text-center">
                  {uploadedFiles.length} file(s) uploaded: {uploadedFiles.map((file) => file.name).join(', ')}
                </p>
                <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="relative">
                      {file.type === 'application/pdf' ? (
                        <iframe
                          src={fileUrls[index]}
                          title={`PDF Preview ${file.name}`}
                          className="w-full h-40 border rounded-lg shadow-sm"
                        />
                      ) : (
                        <img
                          src={fileUrls[index]}
                          alt={`Uploaded Preview ${file.name}`}
                          className="w-full h-40 object-contain border rounded-lg shadow-sm"
                        />
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 rounded-full"
                        onClick={() => handleRemoveFile(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={handleUpdateKnowledgeBase}
                  disabled={isUpdating}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isUpdating ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </span>
                  ) : (
                    `Update Knowledge Base (${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''})`
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    fileUrls.forEach((url) => URL.revokeObjectURL(url)); // Clean up all URLs
                    setUploadedFiles([]);
                    setFileUrls([]);
                    toast({
                      title: 'Files Cleared',
                      description: 'All uploaded files have been removed.',
                    });
                  }}
                  className="w-full"
                >
                  Clear All
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Helplines />
    </div>
  );
};

export default Admin;