from aip import AipOcr

APP_ID = '122268094'
API_KEY = 'AdAKkkvGRpQfkeY0sWxcI3MG'
SECRET_KEY = 'WQdf5ObrbE1nsJdgwRzzqjr1Rj97NXZu'

client = AipOcr(APP_ID, API_KEY, SECRET_KEY)

with open('C:/Users/y2k1/.openclaw/workspace/media/browser/8442b79f-c611-4fe1-9f9a-91b35e91d6e2.jpg', 'rb') as f:
    result = client.basicGeneral(f.read())

print("OCR识别结果：")
if 'words_result' in result:
    for text in result.get('words_result', []):
        print(text.get('words'))
else:
    print(result)
