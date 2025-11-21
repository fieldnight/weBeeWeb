"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = () => {
    // 로컬스토리지 토큰/유저 정보 삭제
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userStorage");

    // 로그인 페이지로 이동
    router.push("/signIn");
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-main-700 hover:bg-main-800 hover:text-white rounded-lg py-2 px-3 mb-10 transition-all duration-300 cursor-pointer"
      >
        로그아웃
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg p-6 w-80 text-center">
            <p className="mb-4 font-semibold">정말 로그아웃하시겠습니까?</p>
            <div className="flex justify-around">
              <button
                onClick={handleLogout}
                className="bg-main-700 text-white px-4 py-2 rounded-lg hover:bg-main-800 transition"
              >
                로그아웃
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
