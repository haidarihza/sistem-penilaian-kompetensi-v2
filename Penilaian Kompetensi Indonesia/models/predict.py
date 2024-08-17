import torch
import os
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from models.model import semisupervised
from flask import jsonify, request

# t = [
#     """Kandidat adalah seorang sales manager di produk pembiayaan UMKM Perempuan. Pada saat ia bergabung, anggota tim nya terdiri dari 10 orang "sales junior" yang merupakan "fresh-graduates" ataupun memiliki pengalaman di bawah 3 tahun, dengan latar belakang dari industri yang berbeda. Adapun anggota tim sales yang lebih senior hanya berjumlah 3 orang. Untuk mengembangkan diri dan timnya, ia membuat sesi sharing-session setiap 1 minggu sekali dengan mengundang tim sales senior dan juga direktur untuk memberikan "product-knowledge" dan juga kompetensi yang dibutuhkan agar ia dan tim bisa segera melakukan proses penjualan dengan segera. Ia juga meminta sesi mentoring dengan atasannya, Direktur Bisnis, untuk membantunya memenuhi informasi dan kompetensi yang ia butuhkan. Ia juga membuat "buddy-program" antara tim sales senior dan junior di tim agar terjadi percepatan proses belajar. Selama 2 bulan pertama cara ini cukup berat bagi semua orang yang terlibat karena sales senior merasa hal ini menjadi beban pekerjaan tambahan untuk mereka. Namun kandidat konsisten dengan caranya ini dan terus memberikan pengertian kepada timnya. Hasilnya baru terlihat setelah bulan ketiga dimana penjualan meningkat sebesar 30% dan seluruh junior sales sudah berhasil melakukan penjualan. Saat ini seluruh tim sales di bawahnya sudah bisa menjalankan proses penjualan secara mandiri.""",
#     """Saat mengetahui dirinya dipromosikan mejadi "Head Marketing & Business Development", setelah sebelumnya bekerja sebagai Sales, yang pertama kali dilakukan kandidat adalah mendaftarkan diri pada program pelatihan eksekutif terkait strategi Pemasaran Digital ("Digital Marketing Strategy"). Hal ini dilakukannya karena ia menyadari bahwa ia tidak memiliki latar-belakang yang cukup kuat di bidang pemasaran, padahal ini merupakan bidang yang penting di pekerjaannya saat ini. Adapun untuk timnya, ia melakukan asesmen dan evaluasi dengan bantuan dari HR Department. Berdasarkan hasil ini, ia meminta dilakukannya program pengembangan baik yang bersifat teknis (hard-skills) maupun non-teknis (soft-skills) untuk memastikan anggota timnya memiliki kompetensi yang mumpuni dan diperlukan di fungsinya masing-masing. Ia pun juga melakukan beberapa rotasi pekerjaan berdasarkan hasil evaluasi dan asesmen tersebut, maupun hasil kinerja tim tahun sebelumnya."""
# ]
# cs = [
#     [
#         """Memiliki informasi terkait kesempatan untuk belajar dan meningkatkan keterampilan baru untuk meningkatkan kinerja individu, kelompok, dan institusi. Mampu mencari sumber-sumber pengetahuan baru yang dibutuhkan untuk meningkatkan kinerja. Mampu mengidentifikasi kebutuhan pribadi untuk berkembang. Memahami gaya belajar diri sendiri dan menggunakannya untuk belajar dengan efektif dan efisien.""",
#         """Mampu melakukan pembelajaran berkelanjutan untuk meningkatkan kinerja individu. Meminta masukan atau umpan-balik terhadap kinerja individu yang dihasilkan, untuk menentukan perbaikan yang perlu dilakukan. Mencari dan melaksanakan metode-metode pembelajaran yang sesuai dengan kebutuhan peningkatan kinerja individu.""",
#         """Mampu melakukan proses belajar yang berkelanjutan untuk meningkatkan kinerja kelompok atau unit kerja. Mengidentifikasi kebutuhan pengembangan atau pembelajaran kelompok berdasarkan hasil kinerja kelompok. Mengidentifikasi kebutuhan pembelajaran pada posisi jabatan saat ini, yang mendukung peningkatan kinerja kelompok.""",
#         """Mampu melakukan pembelajaran berkelanjutan untuk meningkatkan kinerja institusi. Mengidentifikasi kebutuhan pengembangan atau pembelajaran individu atau kelompok berdasarkan evaluasi kinerja institusi. Mengidentifikasi kebutuhan pembelajaran pada posisi jabatan saat ini, yang mendukung peningkatan kinerja institusi."""
#     ],
#     [
#         """Memiliki informasi terkait kesempatan untuk belajar dan meningkatkan keterampilan baru untuk meningkatkan kinerja individu, kelompok, dan institusi. Mampu mencari sumber-sumber pengetahuan baru yang dibutuhkan untuk meningkatkan kinerja. Mampu mengidentifikasi kebutuhan pribadi untuk berkembang. Memahami gaya belajar diri sendiri dan menggunakannya untuk belajar dengan efektif dan efisien.""",
#         """Mampu melakukan pembelajaran berkelanjutan untuk meningkatkan kinerja individu. Meminta masukan atau umpan-balik terhadap kinerja individu yang dihasilkan, untuk menentukan perbaikan yang perlu dilakukan. Mencari dan melaksanakan metode-metode pembelajaran yang sesuai dengan kebutuhan peningkatan kinerja individu.""",
#         """Mampu melakukan proses belajar yang berkelanjutan untuk meningkatkan kinerja kelompok atau unit kerja. Mengidentifikasi kebutuhan pengembangan atau pembelajaran kelompok berdasarkan hasil kinerja kelompok. Mengidentifikasi kebutuhan pembelajaran pada posisi jabatan saat ini, yang mendukung peningkatan kinerja kelompok.""",
#         """Mampu melakukan pembelajaran berkelanjutan untuk meningkatkan kinerja institusi. Mengidentifikasi kebutuhan pengembangan atau pembelajaran individu atau kelompok berdasarkan evaluasi kinerja institusi. Mengidentifikasi kebutuhan pembelajaran pada posisi jabatan saat ini, yang mendukung peningkatan kinerja institusi."""
#     ]
# ]

def get_pseudo_label_predictions():
    # GET DATA FROM REQUEST
    data = request.get_json(force=True)
    t = data['transcripts']
    cs = data['competence_sets']

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

    # LOAD PSEUDOLABEL MODEL
    pseudo_model_dir = os.path.abspath("./models/trained_models/pseudolabel")
    pseudo_tokenizer = AutoTokenizer.from_pretrained(pseudo_model_dir)
    pseudo_model = AutoModelForSequenceClassification.from_pretrained(pseudo_model_dir)

    pseudo_label = semisupervised(pseudo_model, pseudo_tokenizer, device)

    with torch.no_grad():
        logits = pseudo_label(t, cs)
        predictions = logits.exp()
        # print("Predictions with pseudo label model: \n", predictions)

    response = {
        'scores': predictions.tolist()
    }

    return jsonify(response)

def get_ladder_network_predictions():
    # GET DATA FROM REQUEST
    data = request.get_json(force=True)
    t = data['transcripts']
    cs = data['competence_sets']

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

    # LOAD LADDER NETWORK MODEL
    ladder_model_dir = os.path.abspath("./models/trained_models/laddernetwork")
    ladder_tokenizer = AutoTokenizer.from_pretrained(ladder_model_dir)
    ladder_model = AutoModelForSequenceClassification.from_pretrained(ladder_model_dir)

    ladder_network = semisupervised(ladder_model, ladder_tokenizer, device)

    with torch.no_grad():
        logits = ladder_network(t, cs)
        predictions = logits.exp()

    response = {
        'scores': predictions.tolist()
    }

    return jsonify(response)