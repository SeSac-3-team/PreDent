import bs4
import os
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import WebBaseLoader
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()

# OpenAI API 키 설정
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# 치과 진료비 URL
dental_fee_url = "https://bhdkr.modoo.at/?link=324g3j4p"

# 문서 로드 - 표 데이터만 추출
loader = WebBaseLoader(
    web_paths=(dental_fee_url,),
    bs_kwargs=dict(
        parse_only=bs4.SoupStrainer("table")
    ),
)
docs = loader.load()

# 문서 분할
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
splits = text_splitter.split_documents(docs)

# 벡터 변환 및 저장
vectorstore = FAISS.from_documents(documents=splits, embedding=OpenAIEmbeddings(api_key=OPENAI_API_KEY))

# 벡터스토어 저장
vectorstore.save_local("./faiss_index")

print("벡터 변환 및 저장 완료!")
