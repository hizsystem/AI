"use client";

export default function TokenGate({ clientName }: { clientName: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-6 h-6 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          접근 권한이 필요합니다
        </h2>
        <p className="text-sm text-gray-500">
          {clientName} 콘텐츠 캘린더에 접근하려면
          <br />
          담당자에게 전용 링크를 요청하세요.
        </p>
      </div>
    </div>
  );
}
