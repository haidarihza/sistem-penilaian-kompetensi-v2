import { FormOptions } from "../interface/utils";

export const orgPosition: Array<string> = [
  "Direksi",
  "Manajerial",
  "Divisi IT",
  "Divisi HR",
  "Divisi Keuangan",
  "Divisi Pemasaran",
  "Divisi Produksi"
];

export const languageOptions: Array<FormOptions> = [
  {
    value: "ENGLISH",
    label: "Inggris"
  },
  {
    value: "INDONESIAN",
    label: "Indonesia"
  }
]

export const statusColors = [{
  status: "WAITING ANSWER",
  color: "main_beige"
}, {
  status: "WAITING REVIEW",
  color: "#E6F4F1"
}, {
  status: "REJECTED",
  color: "#8CBCFF"
}, {
  status: "ACCEPTED",
  color: "#8CBCFF"
}];

export const formatDateTime = (dateTimeString?: string) => {
  if (!dateTimeString) return "-";
  const date = new Date(dateTimeString);
  const day = String(date.getDate()).padStart(2, '0');
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year}, ${hours}:${minutes}`;
};