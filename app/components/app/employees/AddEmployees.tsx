import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Loading from "~/components/ui/loaders/Loading";
import clsx from "~/utils/shared/ClassesUtils";
import { FileBase64 } from "~/application/dtos/shared/FileBase64";
import IconEmployees from "~/components/layouts/icons/IconEmployees";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import SuccessModal, { RefSuccessModal } from "~/components/ui/modals/SuccessModal";
import UploadDocument from "~/components/ui/uploaders/UploadDocument";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Form, useSubmit } from "remix";
import { updateItemByIdx } from "~/utils/shared/ObjectUtils";

export default function AddEmployees() {
  const { t } = useTranslation("translations");
  const navigate = useNavigate();
  const submit = useSubmit();

  const errorModal = useRef<RefErrorModal>(null);
  const successModal = useRef<RefSuccessModal>(null);
  const confirmCreate = useRef<RefConfirmModal>(null);
  const inputFirstName = useRef<HTMLInputElement>(null);

  const [importingEmployees, setImportingEmployees] = useState(false);
  const [loading, setLoading] = useState(false);

  const [employeesFile, setEmployeesFile] = useState("");
  const [employees, setEmployees] = useState<
    {
      email: string;
      firstName: string;
      lastName: string;
    }[]
  >([]);

  const showImportEmployees = true;

  useEffect(() => {
    addEmployee();
  }, []);

  function removeEmployee(index: number) {
    setEmployees(employees.filter((_x, i) => i !== index));
    if (employees.length === 0) {
      setEmployeesFile("");
    }
  }
  function save(e: FormEvent) {
    e.preventDefault();
    confirmCreate.current?.show(t("shared.confirmSave"), t("shared.confirm"), t("shared.back"));
  }
  function cancel() {
    navigate("/app/employees");
  }
  function confirmSave() {
    const form = new FormData();
    employees.forEach((item) => {
      form.append("employees[]", JSON.stringify(item));
    });
    submit(form, {
      method: "post",
    });
  }
  function goToProfile() {
    navigate("/app/employees");
  }
  function addEmployee() {
    setEmployees([
      ...employees,
      {
        email: "",
        firstName: "",
        lastName: "",
      },
    ]);
  }
  function downloadEmployeesFileTemplate() {
    const rows = [
      [
        t("models.employee.firstName").toString().toUpperCase(),
        t("models.employee.lastName").toString().toUpperCase(),
        t("models.employee.email").toString().toUpperCase(),
      ],
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "plantilla.csv");
    document.body.appendChild(link);

    link.click();
  }
  function droppedEmployeesFile(filesBase64: FileBase64[], files: File[]) {
    const newEmployees: any[] = [];
    if (files.length > 0) {
      setEmployeesFile(filesBase64[0].base64);
      const _employeesFile = files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const employeesArr: any[] = csvToArray(e.target.result);
        employeesArr.forEach((employeeObject) => {
          const employee: string[] = Object.values(employeeObject);
          const firstName = employee.length > 0 ? employee[0].toString().replace("\r", "") : "";
          if (firstName === "NOMBRE" || firstName === "FIRST NAME" || firstName === "NAME") {
            return;
          }
          const lastName = employee.length > 1 ? employee[1].toString().replace("\r", "") : "";
          const email = employee.length > 2 ? employee[2].toString().replace("\r", "") : "";
          const newEmployee = {
            firstName: firstName,
            lastName: lastName,
            email: email,
          };

          newEmployees.push(newEmployee);
        });

        if (newEmployees.length > 0) {
          setEmployees(newEmployees);
        }
      };
      reader.readAsText(_employeesFile);
    }
  }
  function clearEmptyEmployees() {
    employees.forEach((employee, index) => {
      if (!employee.firstName || employee.firstName.trim() === "") {
        setEmployees(employees.filter((_x, i) => i !== index));
      }
    });
  }
  function csvToArray(str: string, delimiter = ",") {
    const headers: any[] = str.slice(0, str.indexOf("\n")).split(delimiter);

    let rows = str.slice(str.indexOf("\n") + 1).split("\n");
    const header = headers[0].trim().toUpperCase();
    if (header === "NOMBRE" || header === "FIRST NAME" || header === "NAME") {
      rows = str.split("\n");
    }
    const arr = rows.map((row) => {
      const values = row.split(delimiter);
      const el = headers.reduce((object, _header, index) => {
        object[index] = values[index];
        return object;
      }, {});
      return el;
    });
    return arr;
  }

  return (
    <div>
      {(() => {
        if (loading) {
          return <Loading />;
        } else {
          return (
            <form onSubmit={save}>
              <div className="bg-white py-6 px-8 shadow-lg border border-gray-200">
                <div className="flex items-center space-x-3 justify-between">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">{t("models.employee.plural")}</h3>
                  </div>
                </div>
                <div className="mt-6">
                  {!employeesFile && importingEmployees && showImportEmployees && (
                    <div>
                      <div className="flex items-center justify-between space-x-3">
                        <label htmlFor="file" className="block text-sm font-normal text-gray-700 truncate">
                          {t("app.employees.actions.uploadCsv")}{" "}
                          <span className="font-bold italic truncate">{t("app.employees.actions.uploadCsvColumns")}</span>
                        </label>
                        <button
                          type="button"
                          onClick={downloadEmployeesFileTemplate}
                          className="inline-flex items-center space-x-1 text-theme-500 hover:text-theme-700 underline text-sm truncate"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                          <div>{t("app.employees.actions.uploadCsvTemplate")}</div>
                        </button>
                      </div>
                      <div className="mt-1">
                        <UploadDocument
                          accept=".csv"
                          description={t("app.employees.actions.onlyCsv")}
                          onDroppedFiles={droppedEmployeesFile}
                          icon={<IconEmployees className="mx-auto h-10 w-10 text-gray-400" />}
                        />
                      </div>
                    </div>
                  )}
                  <div>
                    {employees.map((employee, idxEmployee) => {
                      return (
                        <div key={idxEmployee} className="relative mt-1 grid gap-1 grid-cols-6 py-2">
                          <div className="col-span-3 sm:col-span-2">
                            {idxEmployee === 0 && (
                              <label htmlFor="first-name" className="block text-xs font-medium text-gray-700 truncate">
                                {t("models.employee.firstName")}
                              </label>
                            )}
                            <div className="mt-1">
                              <input
                                autoComplete="off"
                                type="text"
                                ref={inputFirstName}
                                name={"employee-first-name-" + idxEmployee}
                                id={"employee-first-name-" + idxEmployee}
                                placeholder={t("models.employee.firstName") + " " + (idxEmployee + 1)}
                                value={employee.firstName}
                                onChange={(e) => {
                                  updateItemByIdx(employees, setEmployees, idxEmployee, {
                                    firstName: e.target.value,
                                  });
                                }}
                                required
                                className="shadow-sm focus:ring-theme-500 focus:border-theme-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                          </div>
                          <div className="col-span-3 sm:col-span-2">
                            {idxEmployee === 0 && (
                              <label htmlFor="last-name" className="block text-xs font-medium text-gray-700 truncate">
                                {t("models.employee.lastName")}
                              </label>
                            )}
                            <div className="mt-1">
                              <input
                                autoComplete="off"
                                type="text"
                                name={"employee-last-name-" + idxEmployee}
                                id={"employee-last-name-" + idxEmployee}
                                placeholder={t("models.employee.lastName") + " " + (idxEmployee + 1)}
                                value={employee.lastName}
                                onChange={(e) => {
                                  updateItemByIdx(employees, setEmployees, idxEmployee, {
                                    lastName: e.target.value,
                                  });
                                }}
                                required
                                className="shadow-sm focus:ring-theme-500 focus:border-theme-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                          </div>
                          <div className="col-span-6 sm:col-span-2">
                            {idxEmployee === 0 && (
                              <label htmlFor="employee-email" className="block text-xs font-medium text-gray-700 truncate">
                                {t("models.employee.email")}
                              </label>
                            )}
                            <div className="mt-1 flex items-center space-x-2">
                              <input
                                autoComplete="off"
                                type="email"
                                name={"employee-email" + idxEmployee}
                                id={"employee-email" + idxEmployee}
                                placeholder={t("models.employee.email") + " " + (idxEmployee + 1)}
                                value={employee.email}
                                onChange={(e) => {
                                  updateItemByIdx(employees, setEmployees, idxEmployee, {
                                    email: e.target.value,
                                  });
                                }}
                                required
                                className="shadow-sm focus:ring-theme-500 focus:border-theme-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                              <button
                                type="button"
                                className={clsx(
                                  "text-gray-700 hover:bg-gray-50 inline-flex items-center px-1.5 py-1.5 border-gray-300 text-xs font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-theme-500",
                                  idxEmployee === 0 && "top-0",
                                  idxEmployee > 0 && "-top-3"
                                )}
                                onClick={() => removeEmployee(idxEmployee)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex items-center space-x-3">
                      <button type="button" onClick={addEmployee} className="mt-6 flex items-center space-x-1 text-xs text-theme-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="uppercase font-medium">{t("app.employees.actions.add")}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setImportingEmployees(!importingEmployees)}
                        className="mt-6 flex items-center space-x-1 text-xs text-theme-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="uppercase font-medium">{t("app.employees.actions.import")}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="my-4 flex items-center justify-end space-x-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={cancel}
                    type="button"
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm sm:text-sm font-medium sm:rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500"
                  >
                    {t("shared.cancel")}
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center space-x-2 px-3 py-2 border border-transparent shadow-sm sm:text-sm font-medium sm:rounded-md text-white bg-theme-600 hover:bg-theme-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t("shared.save")}</span>
                  </button>
                </div>
              </div>
            </form>
          );
        }
      })()}
      <ConfirmModal ref={confirmCreate} onYes={confirmSave} />
      <SuccessModal ref={successModal} onClosed={goToProfile} />
      <ErrorModal ref={errorModal} />
    </div>
  );
}
