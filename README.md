# 🦷 PreDent Chatbot Service - 치과 사전 문진 챗봇 서비스

## ✨ 프로젝트 소개

PreDent Chatbot Service는 치과 진료 과정에서 환자의 증상을 체계적으로 분석하고, 사전 진단서를 자동 생성하며, 멀티턴 대화 기능을 지원하는 챗봇 서비스입니다.  
환자의 **VAS(Visual Analogue Scale) 통증 척도 시각화**와 **가능성 있는 질환을 포함한 사전 진단서 생성** 기능을 제공하여, 환자와 의료진 간의 효율적인 진료 프로세스 개선을 목표로 합니다.  
또한, Django와 React 기반으로 개발되어, 안정적이면서도 확장 가능한 서비스를 제공합니다.

[![Watch the video](https://img.youtube.com/vi/EZBex0batkg/0.jpg)](https://youtu.be/EZBex0batkg)

## 🛠️ 기술 스택

- **Frontend:** React, Axios
- **Backend:** Django (Python)
- **Database:** PostgreSQL
- **Cloud & Infra:** AWS (Ubuntu 24.04 LTS)
- **Agent & ML:** Langchain, LangGraph, STT (Speech-to-Text)

🚀 **SeSAC 3팀**

---

## 📋 프로젝트 주요 기능

- **STT 및 NLP 기술 활용:**  
  환자가 음성 또는 텍스트를 통해 챗봇과 자유롭게 대화할 수 있도록 지원.
- **환자 맞춤형 사전 문진:**  
  치과 내원 환자에게 증상 관련 정보를 빠르게 제공하여 불필요한 대기 시간을 줄이고, 진료 상담의 효율성을 높임.
- **멀티 에이전트 시스템:**
  - **SQL 에이전트:** 진료 기록 및 예약 관리 기능 지원.
  - **RAG 기반 에이전트:** 비용 및 기타 진료 관련 정보 제공.
- **의료진 관리 시스템:**  
  의사가 환자의 사전 문진 내역을 웹 기반 관리 페이지에서 조회할 수 있음.

---

## ⚙️ 요구 사항 및 전제 조건

### 환경

- **운영 체제:** Ubuntu 24.04 LTS
- **Python:** 3.12.3
- **Node.js:** 최신 LTS 버전
- **데이터베이스:** PostgreSQL

### 사전 설치

- Git 클라이언트
- Python 및 pip
- Node.js 및 npm
- PostgreSQL 서버
- Docker (선택 사항)

---

## 🚀 설치 및 실행 방법

### 단계별 설치 가이드

1. **클론 및 다운로드**

   ```bash
   git clone https://github.com/SeSac-3-team/PreDent.git
   cd PreDent
   ```

2. **의존성 설치**

- Backend(Python)

  ```bash
   cd Backend
   pip install -r requirements.txt
  ```

- Frontend(React)
  ```bash
   cd ../Frontend
   npm install
  ```

3. **설정 파일 구성**

- Backend/myapp/.env 파일을 .env_sample 파일을 참고하여 작성합니다.
- Frontend/.env 파일을 .env_sample 파일을 참고하여 작성합니다.

### 실행 방법

- Frontend 코드의 api 호출 부분의 http://3.39.70.32/api 부분을 127.0.0.1:8000으로 변환

- Backend 서버 실행

  ```bash
   cd Backend
   python manage.py runserver
  ```

- Frontend(React)
  ```bash
   cd ../Frontend
   npm run dev
  ```

---

## 📄 라이선스

### 이 프로젝트는 MIT License 하에 배포됩니다. 자세한 내용은 LICENSE 파일을 참고해 주세요.
