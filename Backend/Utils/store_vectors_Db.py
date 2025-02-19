import os
from langchain.document_loaders import CSVLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from dotenv import load_dotenv

# 환경 변수 로드 (.env 파일 경로에 맞게 수정)
load_dotenv(dotenv_path="myapp/.env")

# OpenAI API 키 확인
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY가 설정되어 있지 않습니다.")

# CSV 파일 경로 (리스트 형태로 지정)
csv_files = [
"/home/ubuntu/ake/PreDent/Backend/Utils/검사료.csv",
"/home/ubuntu/ake/PreDent/Backend/Utils/기본진료료(교육상담료).csv",
"/home/ubuntu/ake/PreDent/Backend/Utils/약제비.csv",
"/home/ubuntu/ake/PreDent/Backend/Utils/영상진단 및 방사선 치료료.csv",
"/home/ubuntu/ake/PreDent/Backend/Utils/자기공명영상진단료(MRI).csv",
"/home/ubuntu/ake/PreDent/Backend/Utils/제증명수수료.csv",
"/home/ubuntu/ake/PreDent/Backend/Utils/초음파 검사료.csv",
"/home/ubuntu/ake/PreDent/Backend/Utils/치과 교정 치료료.csv",
"/home/ubuntu/ake/PreDent/Backend/Utils/치과 처치 수술료.csv",
"/home/ubuntu/ake/PreDent/Backend/Utils/치과보철료.csv",
"/home/ubuntu/ake/PreDent/Backend/Utils/치료재료대.csv",
]
# 리스트 내 파일명에 불필요한 공백 제거
csv_files = [file.strip() for file in csv_files if file.strip()]

all_docs = []
for file in csv_files:
    try:
        # 파일 존재 여부 확인
        if not os.path.exists(file):
            print(f"⚠️ 파일이 존재하지 않습니다: {file}")
            continue

        loader = CSVLoader(file_path=file)
        docs = loader.load()  # CSV 파일의 모든 내용 로드
        if docs:
            all_docs.extend(docs)
            print(f"✅ {file} - CSV 파일 로드 완료. 로드된 문서 수: {len(docs)}")
        else:
            print(f"⚠️ {file} - CSV 파일에서 문서를 찾을 수 없음.")
    except Exception as e:
        print(f"❌ {file} 로드 중 오류 발생: {e}")

# CSV 파일에서 문서를 정상적으로 로드했는지 확인
if not all_docs:
    raise ValueError("CSV 파일에서 문서를 로드하지 못했습니다. 파일 경로와 파일 내용을 확인하세요.")

# 문서 분할 (CSV 파일 내용에 대해 분할)
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
splits = text_splitter.split_documents(all_docs)
print(f"문서 분할 후 생성된 청크 수: {len(splits)}")

# 빈 텍스트 청크가 있다면 필터링
splits = [doc for doc in splits if doc.page_content.strip()]
if not splits:
    raise ValueError("문서를 분할한 결과, 유효한 텍스트 청크가 없습니다. CSV 파일 내용을 확인하세요.")

# 벡터 변환 및 저장
embeddings = OpenAIEmbeddings(openai_api_key=api_key)
vectorstore = FAISS.from_documents(documents=splits, embedding=embeddings)

# 벡터스토어 저장 (로컬에 ./faiss_index 디렉토리로 저장)
vectorstore.save_local("./faiss_index")

print("벡터 변환 및 저장 완료!")
