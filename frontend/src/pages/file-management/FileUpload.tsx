import React from "react";
import FileUpload from "../../components/FileUpload";

const FileUploadPage: React.FC = () => {
  const handleUploadComplete = (files: File[]) => {
    console.log("上传完成:", files);
  };

  return (
    <div className="ml-24!">
      <FileUpload
        onUploadComplete={handleUploadComplete}
        maxFiles={10}
        maxSize={100}
      />
    </div>
  );
};

export default FileUploadPage;
