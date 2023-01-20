import clsx from "clsx";
import { ReactNode, useEffect, useState } from "react";
import imageCompression from "browser-image-compression";
import { FileBase64 } from "~/application/dtos/shared/FileBase64";
import { useTranslation } from "react-i18next";

interface Props {
  title?: string;
  accept?: string;
  multiple?: boolean;
  description?: string;
  icon?: ReactNode;
  onDropped?: (base64: string, file: File) => void;
  onDroppedFiles?: (fileBase64: FileBase64[], files: any[]) => void;
}

export default function UploadDocuments({ title = "", accept, multiple, description, icon = "", onDropped, onDroppedFiles }: Props) {
  const { t } = useTranslation("translations");

  const [isDragging, setIsDragging] = useState(false);
  const [loading] = useState(false);
  const [customClasses, setCustomClasses] = useState("");

  function dragOver(e: any) {
    e.preventDefault();
    if (!loading) {
      setIsDragging(true);
    }
  }
  function dragLeave() {
    setIsDragging(false);
  }
  async function compressFile(imageFile: File): Promise<any> {
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1920 / 2,
      useWebWorker: true,
    };
    try {
      const file = await imageCompression(imageFile, options);
      return Promise.resolve(file);
    } catch (error) {
      return Promise.reject(error);
    }
  }
  async function compressFileNotImage(imageFile: File): Promise<any> {
    return Promise.resolve(imageFile);
  }
  async function drop(e: any) {
    try {
      e.preventDefault();
    } catch {
      // ignore
    }
    let files: File[] = [...e.dataTransfer.files];
    const newImagesPromises: any[] = [];
    await files.forEach((element: File) => {
      if (element.type.includes("image")) {
        newImagesPromises.push(compressFile(element));
      } else {
        newImagesPromises.push(compressFileNotImage(element));
      }
    });
    files = await Promise.all(newImagesPromises);
    const filesArray: FileBase64[] = [];
    const promises: any[] = [];

    files.forEach((file) => {
      const promise = getBase64(file);
      promises.push(promise);
      promise
        .then((response: string) => {
          filesArray.push({
            file,
            base64: response,
          });
          if (onDropped) {
            onDropped(response, file);
          }
        })
        .catch((e) => {
          console.error(e);
        });
    });
    await Promise.all(promises).then(() => {
      if (onDroppedFiles) {
        onDroppedFiles(filesArray, files);
      }
    });
    setIsDragging(false);
  }
  function requestUploadFile() {
    const src = document.querySelector("#uploadmyfile");
    drop({ dataTransfer: src });
  }
  function getBase64(file: File): Promise<string> {
    const reader = new FileReader();
    return new Promise((resolve) => {
      reader.onload = (ev) => {
        resolve(ev?.target?.result?.toString() ?? "");
      };
      reader.readAsDataURL(file);
    });
  }

  useEffect(() => {
    setCustomClasses(isDragging && !loading ? "bg-theme-200 border-2 border-dashed border-theme-800" : "");
  }, [isDragging, loading]);

  return (
    <div
      className={clsx("text-gray-600 overflow-hidden drop text-center flex border-2 border-dashed border-gray-300 rounded-md items-center", customClasses)}
      onDragOver={dragOver}
      onDragLeave={dragLeave}
      onDrop={drop}
    >
      {(() => {
        if (loading) {
          return <div className="mx-auto font-medium text-base">{t("shared.loading")}...</div>;
        } else {
          return (
            <div>
              <h1 className="mx-auto font-bold text-lg text-theme-500">{title}</h1>
              <div className="manual">
                <div className="space-y-1 text-center">
                  {icon}
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="uploadmyfile"
                      className="relative cursor-pointer rounded-md font-medium text-theme-600 hover:text-theme-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-theme-500"
                    >
                      <span></span>
                      <label htmlFor="uploadmyfile">
                        <p className="font-semibold text-sm underline cursor-pointer hover:text-theme-500">{t("app.shared.buttons.uploadDocument")}</p>
                      </label>
                      <input type="file" id="uploadmyfile" accept={accept} multiple={multiple} onChange={requestUploadFile} />
                    </label>
                    <p className="pl-1 lowercase">
                      {t("shared.or")} {t("shared.dragAndDrop")}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">{description}</p>
                </div>
              </div>
            </div>
          );
        }
      })()}
    </div>
  );
}
