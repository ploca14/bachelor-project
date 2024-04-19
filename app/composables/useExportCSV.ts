const arrayToCSV = (data: Array<Record<string, any>>) => {
  const keys = Object.keys(data[0]);

  const rows = data
    .map((obj) => {
      return keys
        .map((key) => obj[key])
        .map(String)
        .map((value) => value.replaceAll('"', '""'))
        .map((value) => `"${value}"`)
        .join(",");
    })
    .join("\n");

  return rows;
};

export const useExportCSV = () => {
  const exportCSV = (data: Array<Record<string, any>>, filename: string) => {
    const tempLink = document.createElement("a");
    const taBlob = new Blob([arrayToCSV(data)], {
      type: "text/csv",
    });
    tempLink.setAttribute("href", URL.createObjectURL(taBlob));
    tempLink.setAttribute("download", `${filename}.csv`);
    tempLink.click();

    URL.revokeObjectURL(tempLink.href);
  };

  return {
    exportCSV,
  };
};
