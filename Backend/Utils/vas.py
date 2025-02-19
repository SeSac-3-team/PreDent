import numpy as np
import pickle
import re
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.models import load_model
def vas_cal(str):
    print("input:", str)
    stopwords = ['의', '가', '이', '은', '들', '는', '좀', '잘', '걍', '과', '도', '를', '으로', '자', '에', '와', '한', '하다']
    max_len = 30
    best_model_path = './best_model.h5'
    # 모델 로드
    loaded_model = load_model(best_model_path)
    # 토크나이저 로드
    with open('tokenizer.pickle', 'rb') as handle:
        tokenizer = pickle.load(handle)
    # 전처리
    new_sentence = re.sub(r'[^ㄱ-ㅎㅏ-ㅣ가-힣 ]', '', str)  # 특수문자 제거
    new_sentence = new_sentence.split()
    new_sentence = [word for word in new_sentence if word not in stopwords]  # 불용어 제거
    # 인코딩 & 패딩
    encoded = tokenizer.texts_to_sequences([new_sentence])
    pad_new = pad_sequences(encoded, maxlen=max_len)
    # 예측
    score = loaded_model.predict(pad_new)
    num = int(np.argmax(score))
    return num