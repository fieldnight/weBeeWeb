"use client";

import { useEffect, useState } from "react";
import {
  DiagnosisHistory,
  Logout,
  MyProfile,
  MySaleList,
  StoreRecommendBee,
} from "@/features";
import Skeleton from "@/widgets/skeleton/ui/Skeleton";

export default function MyPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 컴포넌트가 마운트되면 로딩 완료
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <Skeleton />;
  }

  return (
    <>
      <div className="flex flex-col gap-8 mx-auto">
        <div className="w-[335px] mx-auto">
          {/* MyProfile */}
          <MyProfile />
          {/* MySaleList */}
          <MySaleList />
          {/* 추가 컴포넌트들 */}
          <StoreRecommendBee />
          <DiagnosisHistory />
          <Logout />
        </div>
      </div>
    </>
  );
}
