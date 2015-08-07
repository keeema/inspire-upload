declare var getUploadCore: (options: IUploadOptions) => IUploadCore;

interface IUploadCore {
    upload(fileList: File[]| Object): void
}

interface IUploadStatus {
    queued: IUploadStatus,
    uploading: IUploadStatus,
    uploaded: IUploadStatus,
    failed: IUploadStatus,
    canceled: IUploadStatus,
    removed: IUploadStatus;
}

declare var uploadStatus: IUploadStatus;

interface IUploadFile extends File {
    uploadStatus: IUploadStatus;
    responseCode: number;
    responseText: string;
    progress: number;
    sentBytes: number;

    cancel: () => void;
    remove: () => void;
    start: () => void;
}

interface IUploadOptions {
    url: string;
    method: string;
    withCredentials?: boolean;
    headers?: {[key:string]:any}
    params?: {[key:string]:any}

    onProgressCallback?: (file: IUploadFile) => void;
    onCancelledCallback?: (file: IUploadFile) => void;
    onFinishedCallback?: (file: IUploadFile) => void;
    onUploadedCallback?: (file: IUploadFile) => void;
    onErrorCallback?: (file: IUploadFile) => void;
    onUploadStartedCallback?: (file: IUploadFile) => void;
}

interface IUploadArea {
  targetElement: Element;
  uploadCore: IUploadCore;
  uploadAreaOptions: IUploadAreaOptions;
  uploader: IUploader;

  init() : void;
}

interface IUploadAreaOptions extends IUploadOptions {
  maxFileSize: number;
  allowDragDrop: boolean;
  clickable: boolean;
  accept: string;
  multiple: boolean;
}

declare var getUploader: (options: IUploadQueueOptions) => IUploader;

interface IUploader {
  uploadAreas: IUploadArea[];
  queue: IUploadQueue;
  uploaderOptions: IUploadQueueOptions;

  registerArea(element: Element, options: IUploadAreaOptions) : void;
  unregisterArea(area: IUploadArea) : void;
  setOptions(options: IUploadQueueOptions) : void;
}

interface IUploadQueue {
  options:IUploadQueueOptions;
  queuedFiles: IUploadFile[];

  addFiles(files: IUploadFile[]);
  removeFile(file: IUploadFile);
  filesChanged();
  clearFiles();
}

interface IUploadQueueOptions {
    maxParallelUploads?: number;
    autoStart?: boolean;
    autoRemove?: boolean;

    onFileAddedCallback?: (file: IUploadFile) => void;
    onFileRemovedCallback?: (file: IUploadFile) => void;
    onAllFinishedCallback?: () => void;
    onQueueChangedCallback?: (queue: IUploadFile[]) => void;
}