// utilities.ts
export function FormDataMaker(obj: any): FormData {
  const data = new FormData();
  const propertiesToAppend = Object.keys(obj);

  propertiesToAppend.forEach((key) => {
    const value = obj[key];
    if (value !== null && value !== undefined && value !== "") {
      if (key === "image" && value instanceof File) {
        data.append(key, value);
      } else {
        data.append(key, value.toString());
      }
    }
  });

  return data;
}
