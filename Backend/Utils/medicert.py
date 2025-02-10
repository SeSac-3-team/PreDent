from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db import connection

@api_view(['POST'])
def save_medicert(request):
    try:
        # DRF는 request.data를 통해 파싱된 데이터를 제공합니다.
        data = request.data

        vas_scale = data.get('vas_scale')
        pre_diagnosis = data.get('pre_diagnosis')
        patid = data.get('patid')
        symptom_description = data.get('증상 내용')
        symptom_duration = data.get('증상 기간')
        symptom_area = data.get('증상 부위')
        tooth_mobility = data.get('치아 흔들림 여부')
        pain_type = data.get('통증 유형')
        gum_swelling = data.get('잇몸 부기 여부')
        print(  f"""test :
                \n{vas_scale}, 
                \n{pre_diagnosis},
                \n{patid},
                \n{symptom_description},
                \n{symptom_duration},
                \n{symptom_area},
                \n{tooth_mobility},
                \n{pain_type},
                \n{gum_swelling}""")

        query = """
            INSERT INTO medicert 
            (vas_scale, pre_diagnosis, patid, symptom_description, symptom_duration, symptom_area, tooth_mobility, pain_type, gum_swelling)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        with connection.cursor() as cursor:
            cursor.execute(query, [
                vas_scale, 
                pre_diagnosis,
                patid,
                symptom_description,
                symptom_duration,
                symptom_area,
                tooth_mobility,
                pain_type,
                gum_swelling,
            ])

        return Response({"message": "데이터 저장 성공"}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)