import os
from dotenv import load_dotenv  # python-dotenv 라이브러리 임포트
from langchain_community.chat_models import ChatOpenAI
from langchain.prompts.chat import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate
)
from langchain.chains import LLMChain
from langchain.output_parsers import StructuredOutputParser, ResponseSchema

# .env 파일에 있는 환경 변수 로드
load_dotenv(dotenv_path="myapp/.env")

def get_presum(query: str) -> dict:

    # 1. 응답 스키마 정의: key와 해당 설명을 명시합니다.
    response_schemas = [
        ResponseSchema(
            name="예상 질환",
            description="환자의 증상과 관련된 가능성이 높은 질환 3가지를 콤마(,)로 구분하여 작성합니다."
        ),
        ResponseSchema(
            name="질환 카테고리",
            description="환자의 예상 질환을 반영하여여 [충치 질환, 잇몸 질환, 신경 및 치근단 질환, 구강 점막 질환, 교합 및 턱 질환, 치아 손상, 기타] 중 어떤 카테고리에 속하는지 1개만 작성합니다. "
        ),
        ResponseSchema(
            name="질환 설명",
            description="각 질환에 대해 쉽게 이해할 수 있도록 설명합니다."
        ),
        ResponseSchema(
            name="초기 관리 및 생활 습관 추천",
            description="불편함을 줄이고 치아 건강을 유지하기 위한 초기 관리 방법과 생활 습관을 안내합니다."
        )
    ]
    
    # 2. OutputParser 생성 및 포맷 지시문 획득
    output_parser = StructuredOutputParser.from_response_schemas(response_schemas)
    format_instructions = 'The output should be a markdown code snippet formatted in the following schema, including the leading and trailing "```json" and "```"\n출력에는 다음과 같은 key값을 포함하세요. ["예상 질환", "질환 카테고리", "질환 설명", "초기 관리 및 생활 습관 추천"]'
    
    # 3. 시스템 프롬프트 생성 (포맷 지시문 포함)
    system_prompt_text = (
    "당신은 치과 진료의를 돕는 사전 진단 챗봇입니다. 환자가 제공한 증상 정보를 바탕으로 아래의 양식에 맞춰 따뜻하고 친절한 말투로 JSON 형식의 응답을 생성하세요.\n"
    + format_instructions +
    "\n이 중 '질환 카테고리'는 반드시 다음 옵션 중 하나여야 합니다: [충치 질환, 잇몸 질환, 신경 및 치근단 질환, 구강 점막 질환, 교합 및 턱 질환, 치아 손상, 기타]."
    )

    print("test1:", system_prompt_text)

    system_prompt = SystemMessagePromptTemplate.from_template(system_prompt_text)

    
    # 4. 사용자(휴먼) 프롬프트 생성
    human_prompt = HumanMessagePromptTemplate.from_template(
        "증상 정보: {query}\n답변:"
    )
    
    # 5. 시스템 메시지와 사용자 메시지를 포함하는 ChatPromptTemplate 생성
    chat_prompt = ChatPromptTemplate.from_messages([system_prompt, human_prompt])
    
    # 6. ChatOpenAI 모델 생성 (모델명 및 온도 설정 등)
    chat_model = ChatOpenAI(
        model_name="gpt-4o",
        temperature=0.7,
        openai_api_key=os.environ.get("OPENAI_API_KEY")
    )
    
    # 7. LLMChain 생성: 프롬프트와 모델을 결합
    chain = LLMChain(llm=chat_model, prompt=chat_prompt)
    
    # 8. 체인을 실행하여 원시 응답 생성
    raw_answer = chain.run(query=query)
    print("원시 응답:", raw_answer)
    
    # 9. OutputParser를 사용하여 JSON 형식의 파싱된 결과 획득
    parsed_output = output_parser.parse(raw_answer)
    print("파싱된 응답:", parsed_output)
    
    return parsed_output

