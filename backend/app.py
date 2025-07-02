import os
from flask import Flask, request, jsonify
from flask_cors import CORS # CORS izinlerini yönetmek için
import google.generativeai as genai # Gemini API için
from dotenv import load_dotenv # Ortam değişkenlerini .env dosyasından yüklemek için (yerel geliştirme için)

# .env dosyasındaki ortam değişkenlerini yükle
load_dotenv()

app = Flask(__name__)
# Geliştirme aşamasında tüm kökenlerden gelen isteklere izin veriyoruz.
# Üretim ortamında SADECE frontend'inizin alan adına izin vermeniz GÜVENLİK İÇİN ŞARTTIR:
# Örneğin: CORS(app, origins="https://berklast.github.io")
CORS(app)

# Google Gemini API anahtarınızı ortam değişkenlerinden alın.
# Yerel geliştirme için .env dosyasına GOOGLE_API_KEY="YOUR_API_KEY" ekleyebilirsiniz.
# Dağıtım ortamlarında (Heroku, Render vb.) ilgili platformun "Environment Variables" ayarlarından yapın.
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    print("UYARI: GOOGLE_API_KEY ortam değişkeni ayarlanmamış.")
    print("Lütfen .env dosyanıza veya sistem ortam değişkenlerinize GOOGLE_API_KEY'inizi ekleyin.")
    print("Örnek: GOOGLE_API_KEY=AIzaSy... (kendi anahtarınız)")
    exit("API anahtarı olmadan uygulama başlatılamıyor.") # API anahtarı yoksa uygulamayı sonlandır

genai.configure(api_key=GOOGLE_API_KEY)

# Gemini modelini başlat
# Sizin "gemini-2.0-flash" modelini kullandığınızı varsayarak:
model = genai.GenerativeModel('gemini-2.0-flash')

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message')

    if not user_message:
        return jsonify({'error': 'Mesaj bulunamadı.'}), 400

    try:
        # Gemini modeline mesajı gönderiyoruz
        # model.generate_content varsayılan olarak genel bir bilgi tabanına sahiptir.
        # Canlı internet araması için, Gemini'nin "Function Calling" özelliğini kullanarak
        # ayrı bir arama motoru API'sini (örneğin Google Custom Search API) entegre etmeniz gerekebilir.
        # Şu anki haliyle model kendi genel bilgisiyle cevap verecektir.
        response = model.generate_content(user_message)

        # Gemini yanıtının metin kısmını alıyoruz
        ai_response = response.text

        return jsonify({'response': ai_response})

    except Exception as e:
        print(f"Gemini API'den yanıt alınırken hata oluştu: {e}")
        # Hata mesajını kullanıcıya geri döndürürken hassas bilgileri gizle
        return jsonify({'error': 'Üzgünüm, bir sorun oluştu. Lütfen daha sonra tekrar deneyin.'}), 500

if __name__ == '__main__':
    # Geliştirme ortamında çalıştırmak için
    # app.run(debug=True) komutu ile otomatik yeniden başlatma ve hata ayıklama modu
    app.run(debug=True, port=5000)
