import UploadDocuments from "./UploadDocument";

export default function PreviewUploadersDocument() {
  function droppedDocuments(files) {
    alert(`@droppedDocuments ${files.length} files: ` + files.map((f) => f.base64.substr(0, 30) + "..."));
  }
  function droppedDocument(base64, file) {
    alert(`@droppedDocument: base64 [${base64.substr(0, 30)}...], file [name (${file.name}), size (${file.size})]`);
  }
  return (
    <div className="space-y-2 w-full">
      <UploadDocuments multiple={true} onDroppedFiles={droppedDocuments} onDropped={droppedDocument} />
    </div>
  );
}
