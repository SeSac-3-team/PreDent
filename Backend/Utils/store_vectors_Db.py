from typing import override
import bs4
import os
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import WebBaseLoader
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from dotenv import load_dotenv, dotenv_values

# 환경 변수 로드
load_dotenv(dotenv_path="myapp/.env")

api_key = os.getenv("OPENAI_API_KEY")

# 치과 진료비 URL
dental_fee_url = os.getenv('dental_fee_url')  # 환경 변수가 없을 경우 기본값으로 빈 문자열을 설정
dental_fee_url = dental_fee_url.split(',') 

all_docs = []
for url in dental_fee_url:
    try:
        loader = WebBaseLoader(web_paths=(url,))  # 단일 URL을 튜플로 전달
        docs = loader.load()  # 웹 페이지의 모든 내용 로드
        if docs:
            all_docs.extend(docs)  # 문서 리스트에 추가
            print(f"✅ {url} 문서 로드 완료, 개수: {len(docs)}")
        else:
            print(f"⚠️ {url}에서 문서를 찾을 수 없음")
    except Exception as e:
        print(f"❌ {url} 로드 중 오류 발생: {e}")

# 문서 분할
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
splits = text_splitter.split_documents(docs)

# 벡터 변환 및 저장
embeddings = OpenAIEmbeddings(openai_api_key=api_key)  # `api_key`를 직접 전달

vectorstore = FAISS.from_documents(documents=splits, embedding=embeddings)

# 벡터스토어 저장
vectorstore.save_local("./faiss_index")

print("벡터 변환 및 저장 완료!")