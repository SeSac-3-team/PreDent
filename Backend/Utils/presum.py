import os
from dotenv import load_dotenv  # python-dotenv 라이브러리 임포트
from langchain_community.chat_models import ChatOpenAI
from langchain.prompts.chat import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate
)
from langchain.chains import LLMChain

# .env 파일에 있는 환경 변수 로드
load_dotenv(dotenv_path="myapp/.env")

def get_presum(query: str) -> str:

    # 시스템 프롬프트: 모델에게 전달할 초기 지시사항
    system_prompt = SystemMessagePromptTemplate.from_template(
        """당신은 치과 진료의를 돕는 사전 진단 챗봇입니다. 환자가 제공한 증상 정보를 바탕으로 다음 형식으로 따뜻하고 친절한 말투로 응답하세요:
        예상 질환: (환자의 증상과 관련된 가능성이 높은 질환 3가지)
        질환 설명: (각 질환이 무엇인지, 어떤 증상이 나타날 수 있는지 쉽게 설명)
        초기 관리 및 생활 습관 추천: (불편함을 줄이고 치아 건강을 지키는 방법을 친절하게 안내)
        ⚠️ 이 진단은 참고용이며, 정확한 검사와 치료를 위해 치과 전문의의 상담이 꼭 필요합니다. 환자분의 치아 건강을 위해 언제든 도와드릴게요! 😊"""
    )
    
    # 사용자(휴먼) 프롬프트: 실제 사용자의 질문 및 답변 형식 지정
    human_prompt = HumanMessagePromptTemplate.from_template(
        "증상 정보: {query}\n답변:"
    )
    
    # 시스템 메시지와 사용자 메시지를 포함하는 ChatPromptTemplate 생성
    chat_prompt = ChatPromptTemplate.from_messages([system_prompt, human_prompt])
    
    # ChatOpenAI 모델 생성 (모델명 및 온도 설정 등 필요에 따라 조정)
    chat_model = ChatOpenAI(
        model_name="gpt-4o",
        temperature=0.7,
        openai_api_key=os.environ.get("OPENAI_API_KEY")
    )
    
    # LLMChain을 생성하여 프롬프트와 모델을 결합
    chain = LLMChain(llm=chat_model, prompt=chat_prompt)
    
    # 체인을 실행하여 답변 생성
    answer = chain.run(query=query)
    
    return answer