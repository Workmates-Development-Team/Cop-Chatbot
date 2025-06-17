import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Loader2, Send } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import Helplines from '@/components/Helplines';
import { backend_url } from '@/components/Constant';

// const backend_url = backend_url;

const Admin = () => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isChatting, setIsChatting] = useState(false);
  const chatContainerRef = useRef(null);

  // Scroll to bottom of chat when messages update
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileUpload = (files: FileList | File[]) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    Array.from(files).forEach((file: File) => {
      if (validTypes.includes(file?.type)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file?.name);
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
      toast({
        title: 'Files Selected',
        description: `${validFiles.map((file) => file.name).join(', ')} selected.`,
      });
    }
  };

  const handleInputChange = (event) => {
    const files = event.target.files;
    if (files) {
      handleFileUpload(files);
      event.target.value = '';
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const files = event.dataTransfer.files;
    if (files) {
      handleFileUpload(files);
    }
  };

  const handleDragOver = (event) => {
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
      let successCount = 0;
      for (const file of uploadedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch(`${backend_url}/embed`, {
          method: 'POST',
          body: formData,
        });
        if (response.ok) {
          successCount++;
        } else {
          const data = await response.json().catch(() => ({}));
          toast({
            title: 'Upload Failed',
            description: data.error || `Failed to upload ${file.name}`,
            variant: 'destructive',
          });
        }
      }
      if (successCount > 0) {
        toast({
          title: 'Knowledge Base Updated',
          description: `Successfully uploaded and embedded ${successCount} file(s).`,
        });
        setUploadedFiles([]);
      }
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

  const handleRemoveFile = (index) => {
    URL.revokeObjectURL(URL.createObjectURL(uploadedFiles[index]));
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    if (newFiles.length === 0) {
      toast({
        title: 'File Removed',
        description: 'All files have been removed.',
      });
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    
    // Add user message to chat
    setMessages((prev) => [...prev, { role: 'user', content: chatInput }]);
    setChatInput('');
    setIsChatting(true);

    try {
      const response = await fetch(`${backend_url}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: chatInput }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        toast({
          title: 'Chat Failed',
          description: data.error || 'Failed to get a response from the chatbot.',
          variant: 'destructive',
        });
        setIsChatting(false);
        return;
      }

      // Streamed response handling
      const reader = response.body?.getReader();
      if (reader) {
        const decoder = new TextDecoder();
        let result = '';
        setMessages((prev) => [...prev, { role: 'bot', content: '', isStreaming: true }]);

        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            setMessages((prev) => 
              prev.map((msg, idx) => 
                idx === prev.length - 1 ? { ...msg, isStreaming: false } : msg
              )
            );
            break;
          }
          const chunk = decoder.decode(value, { stream: true });
          result += chunk;
          setMessages((prev) => 
            prev.map((msg, idx) => 
              idx === prev.length - 1 ? { ...msg, content: result } : msg
            )
          );
        }
      } else {
        const data = await response.json();
        setMessages((prev) => [...prev, { role: 'bot', content: data.response || 'No response received.', isStreaming: false }]);
      }
    } catch (error) {
      toast({
        title: 'Chat Error',
        description: 'An error occurred while communicating with the chatbot.',
        variant: 'destructive',
      });
      setMessages((prev) => [...prev, { role: 'bot', content: 'Error: Could not connect to the chatbot.', isStreaming: false }]);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="bg-white">
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Admin Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload Section */}
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
                      const input = document.getElementById('file-upload');
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
                  <label htmlFor="file-upload" className="cursor-pointer mb-2">
                    <Button
                      variant="default"
                      size="icon"
                      className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700"
                      disabled={isUploading}
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('file-upload');
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {uploadedFiles.map((file, index) => {
                    const url = URL.createObjectURL(file);
                    return (
                      <div key={index} className="relative">
                        {file.type === 'application/pdf' ? (
                          <iframe
                            src={url}
                            title={`PDF Preview ${file.name}`}
                            className="w-full h-40 border rounded-lg shadow-sm"
                          />
                        ) : (
                          <img
                            src={url}
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
                    );
                  })}
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
                    uploadedFiles.forEach((file) => URL.revokeObjectURL(URL.createObjectURL(file)));
                    setUploadedFiles([]);
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

            {/* Chat UI */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-2">Chat with Knowledge Base</h2>
              <div
                ref={chatContainerRef}
                className="min-h-[300px] max-h-[400px] border rounded-lg p-4 bg-gray-50 overflow-y-auto space-y-4"
              >
                {messages.length === 0 && (
                  <div className="text-center text-gray-400">Start a conversation...</div>
                )}
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                      {message.isStreaming && (
                        <div className="flex items-center gap-1 mt-1">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-xs">Typing...</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  className="flex-1 border rounded px-3 py-2"
                  placeholder="Ask a question about your uploaded documents..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={isChatting}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleChat();
                  }}
                />
                <Button
                  onClick={handleChat}
                  disabled={isChatting || !chatInput.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Helplines />
    </div>
  );
};

export default Admin;
