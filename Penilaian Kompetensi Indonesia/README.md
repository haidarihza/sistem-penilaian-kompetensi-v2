1. Download/Clone Repository ini
2. Buka Windows Powershell / Bash
3. Masuk ke directory src
4. Buat virtual environtment apabila belum ada
   ```bash
   py -m venv venv
   ```
5. Masuk kedalam virtual environtment
   ```bash
   source venv/Scripts/activate
   ```
6. Install library
   ```bash
   pip install Flask
   pip install psycopg2
   pip install torch
   pip install transformers
   pip install numpy
   ```
7. Jalankan command

   ```bash
   py app.py
   ```

   ps. Ingat mengganti kredential database sebelum melakukan training

8. Apabila menggunakan kakas VSCode untuk melakukan pengembangan, ingat untuk melakukan select interpreter dan pilih venv yang telah dibuat
