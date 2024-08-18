# Subsistem Penilaian Kompetensi Berbahasa Inggris

Subsistem penilaian kompetensi menggunakan framework PyTorch dan FastAPI.

Cara menjalankan: ```uvicorn src.main:app``` di direktori ini.

Subsistem diimplementasikan menggunakan fungsi akuisisi PowerBALD, dengan konfigurasi pembelajaran aktif diatur dalam file `param_config.json`.

Model pre-trained yang digunakan ditaruh dalam folder `models`. Pelatihan model dalam subsistem akan menyimpan parameter model baru dalam folder `states`. Hal pemilihan model yang digunakan dan path dapat diatur dalam file `config.json`.

Subsistem terhubung langsung pada basis data. Konfigurasi basis data dapat diatur dalam file `.env`.
