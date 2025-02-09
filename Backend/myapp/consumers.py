import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # 클라이언트가 웹소켓에 연결할 때 호출
        await self.accept()
        await self.send(text_data=json.dumps({"message": "WebSocket connected!"}))

    async def disconnect(self, close_code):
        # 클라이언트가 웹소켓 연결을 끊을 때 호출
        pass

    async def receive(self, text_data):
        # 클라이언트로부터 메시지를 받을 때 호출
        data = json.loads(text_data)
        message = data.get("message", "No message received")

        # 클라이언트로 메시지 전송
        await self.send(text_data=json.dumps({"message": f"Server received: {message}"}))