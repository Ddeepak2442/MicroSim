import React from "react";

function ImageUploader(props) {
  const {
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleFileChange,
    preview,
    uploadProgress,
    handleSubmit,
    statusMessage,
    analysisresult,
    dragOver,
    selectVal, 
    selectChange, 
    Controls,
  } = props;

  return (
    <div className="rounded-md border border-gray-100 shadow-md shadow-emerald-600/30 bg-white p-3">
      <div className="flex justify-between xs:mb-2">
          <h3 className="font-semibold text-gray-500">Image Prompt</h3>
          <select 
            name="examples" 
            id="eg-select" 
            value={selectVal}
            className="bg-emerald-100 rounded text-sm px-1 text-gray-600"
            onChange={selectChange}
            >
              <option value="">Controls</option>
              {Controls?.map((eg, index) => {
                  return <option value={eg.value} key={index}>{eg.value}</option>
                }
              )}
          </select>
        </div>
        <div
          className={`border-2 border-dashed border-gray-400 rounded-lg p-10 cursor-pointer mb-5 ${dragOver ? 'border-blue-300 bg-gray-100' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('fileUpload')?.click()}
        >
          <input
            id="fileUpload"
            type="file"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileChange(e.target.files[0]);
              }
            }}
            accept="image/*"
            className="hidden"
          />
          {preview ? (
            <img src={preview} alt="Preview" className="max-w-full max-h-48 mb-5 mx-auto" />
          ) : (
            <p>Drag and drop an image here, or click to select an image to upload.</p>
          )}
        </div>
        <div className="flex justify-center items-center mb-5">
          {uploadProgress === 0 || uploadProgress === 100 ? (
            <button onClick={handleSubmit} className="bg-emerald-500 p-2 rounded w-full text-white text-sm px-3 cursor-pointer">
              Get prompt from Image
            </button>
          ) : (
            <progress value={uploadProgress} max="100" className="w-1/2"></progress>
          )}
        </div>
        {statusMessage && <p className="text-gray-600 mb-5">{statusMessage}</p>}
        {analysisresult && (
          <div className="mt-5">
            <strong>Prompt in Flashcard</strong>
            <textarea value={analysisresult} className="w-full h-36 p-2 mt-2 border border-gray-300 rounded-lg resize-y" />
            
        <button className="bg-emerald-500 p-2 rounded w-full text-white text-sm px-3 cursor-pointer" type="submit">Generate MicroSim</button> 
          </div>
        )}
    </div>
  );
}

export default ImageUploader;