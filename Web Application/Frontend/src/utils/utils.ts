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