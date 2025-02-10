import numpy as np
import pickle
import re
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.models import load_model
from konlpy.tag import Okt
import json


def vas_cal(str) :
    okt = Okt()
    print("input: " , str)
    stopwords = ['의','가','이','은','들','는','좀','잘','걍','과','도','를','으로','자','에','와','한','하다']

    max_len = 30

    best_model_path = './best_model.h5'

    loaded_model = load_model(best_model_path)

    with open('tokenizer.pickle', 'rb') as handle:
        tokenizer = pickle.load(handle)


    new_sentence = str

    new_sentence = re.sub(r'[^ㄱ-ㅎㅏ-ㅣ가-힣 ]','', new_sentence)
    new_sentence = okt.morphs(new_sentence, stem=True) # 토큰화
    new_sentence = [word for word in new_sentence if not word in stopwords] # 불용어 제거
    encoded = tokenizer.texts_to_sequences([new_sentence]) # 정수 인코딩
    pad_new = pad_sequences(encoded, maxlen = max_len) # 패딩
    score = loaded_model.predict(pad_new) # 예측
    num = int(np.argmax(score))
    return num