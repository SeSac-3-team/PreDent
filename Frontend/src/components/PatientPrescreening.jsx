import React from "react";

// Card Component
export function Card({ children, className }) {
  return (
    <div className={`border rounded-lg shadow p-4 bg-white ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children }) {
  return <div className="border-b pb-2 text-lg font-bold">{children}</div>;
}

export function CardContent({ children }) {
  return <div className="mt-2">{children}</div>;
}

// Input Component
export function Input({ type = "text", placeholder, ...props }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className="border p-2 rounded w-full"
      {...props}
    />
  );
}

// Textarea Component
export function Textarea({ placeholder, ...props }) {
  return (
    <textarea
      placeholder={placeholder}
      className="border p-2 rounded w-full"
      {...props}
    />
  );
}

// Button Component
export function Button({ children, onClick, className }) {
  return (
    <button
      className={`bg-blue-500 text-white p-2 rounded ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// Progress Component
export function Progress({ value, className }) {
  return (
    <div className={`w-full bg-gray-200 rounded ${className}`}>
      <div
        className="bg-blue-500 h-2 rounded"
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
}

// Badge Component
export function Badge({ children, className }) {
  return (
    <span className={`px-2 py-1 text-sm bg-gray-200 rounded ${className}`}>
      {children}
    </span>
  );
}

export default function PatientPrescreening({ patientData }) {
  const {
    mecid,
    vas_scale,
    predicted_disease,
    created,
    patid,
    symptom_description,
    symptom_duration,
    symptom_area,
    tooth_mobility,
    pain_type,
    gum_swelling,
  } = patientData;

  return (
    <div className="p-6 space-y-6">
      <Card className="mb-4">
        <CardHeader>
          <h2 className="text-xl font-bold">환자 사전문진 정보</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p>
                <strong>환자 ID:</strong> {patid}
              </p>
              <p>
                <strong>문진 ID:</strong> {mecid}
              </p>
              <p>
                <strong>문진 일자:</strong> {new Date(created).toLocaleString()}
              </p>
            </div>
            <div>
              <p>
                <strong>VAS 통증 척도:</strong> {vas_scale} / 10
              </p>
              <Progress value={(vas_scale / 10) * 100} className="w-full" />
              <p>
                <strong>예측된 질병:</strong> <Badge>{predicted_disease}</Badge>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <h3 className="text-lg font-semibold">증상 요약</h3>
        </CardHeader>
        <CardContent>
          <p>
            <strong>주요 증상:</strong> {symptom_description}
          </p>
          <p>
            <strong>증상 부위:</strong> {symptom_area}
          </p>
          <p>
            <strong>증상 지속 기간:</strong> {symptom_duration}
          </p>
          <p>
            <strong>통증 유형:</strong> {pain_type}
          </p>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <h3 className="text-lg font-semibold">치주 상태</h3>
        </CardHeader>
        <CardContent>
          <p>
            <strong>치아 동요도:</strong> {tooth_mobility}
          </p>
          <p>
            <strong>잇몸 부기:</strong> {gum_swelling}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">진료 메모</h3>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="의사의 메모를 입력하세요..."
            className="w-full mb-4"
          />
          <Button>메모 저장</Button>
        </CardContent>
      </Card>
    </div>
  );
}
