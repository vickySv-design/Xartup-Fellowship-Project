export function exportToCSV(data: any[], filename: string) {
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(","),
    ...data.map(row => headers.map(h => row[h]).join(","))
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
