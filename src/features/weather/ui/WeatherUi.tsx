"use client";

import { useMemo, useCallback } from "react";
import { useWeatherData, useDetailWeather } from "../model/hooks";
import Image from "next/image";
import {
  getWeatherIcon,
  getWeatherKorean,
  formatDayShort,
  formatTime,
  getDailyForecast,
  // getBeeMessage,
} from "../model/utils";
import Skeleton from "@/widgets/skeleton/ui/Skeleton";

/**
 * 날씨 정보를 표시하는 메인 UI 컴포넌트
 * 현재 날씨, 6일 예보, 농업기상 정보를 포함합니다.
 */
export default function WeatherUI() {
  const {
    weatherData,
    forecastData,
    koreanAddress,
    loading,
    error,
    requestLocationData,
  } = useWeatherData();
  const {
    data: detailData,
    error: detailError,
    loading: detailLoading,
  } = useDetailWeather(koreanAddress);
  const dailyForecast = useMemo(
    () => getDailyForecast(forecastData),
    [forecastData]
  );

  const isValid = useCallback((v?: string) => {
    if (v === undefined || v === null) return false;
    const s = String(v).trim();
    if (s === "-" || s === "") return false;
    if (/^0(?:\.0+)?$/.test(s)) return false;
    return true;
  }, []);

  const detailItems = useMemo(
    () => [
      { key: "temp", label: "온도", value: detailData?.temp, unit: "" },
      { key: "hum", label: "습도", value: detailData?.hum, unit: "%" },
      { key: "widdir", label: "풍향", value: detailData?.widdir, unit: "" },
      { key: "wind", label: "풍속", value: detailData?.wind, unit: "" },
      {
        key: "max_wind",
        label: "최대풍속",
        value: detailData?.max_Wind,
        unit: "",
      },
      { key: "rain", label: "강수량", value: detailData?.rain, unit: "" },
      { key: "sun_Qy", label: "일사량", value: detailData?.sun_Qy, unit: "" },
      {
        key: "gr_Temp",
        label: "지상온도",
        value: detailData?.gr_Temp,
        unit: "",
      },

      {
        key: "soil_Temp",
        label: "지중온도",
        value: detailData?.soil_Temp,
        unit: "",
      },
    ],
    [detailData]
  );

  const visibleItems = detailItems.filter((it) => isValid(it.value));

  // 로딩 상태 UI
  if (loading) {
    return <Skeleton />;
  }

  // 에러 상태 UI
  if (error) {
    return (
      <aside className="flex justify-center items-center" role="alert">
        <div className="w-full max-w-6xl p-8 shadow-xl rounded-2xl bg-white/10 min-h-[24rem]">
          <div className="text-center text-white flex flex-col items-center justify-center h-full">
            <div className="bg-red-500/20 border border-red-400/50 text-red-200 px-6 py-4 rounded-lg mb-4">
              {error}
            </div>
            <button
              onClick={requestLocationData}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </aside>
    );
  }

  // 날씨 데이터가 없는 경우
  if (!weatherData) {
    return (
      <aside className="flex justify-center items-center" role="alert">
        <div className="w-full max-w-6xl p-8 shadow-xl rounded-2xl bg-white/10 min-h-[24rem]">
          <p className="text-center text-gray-600 text-lg flex items-center justify-center h-full">
            날씨 데이터를 불러올 수 없습니다.
          </p>
        </div>
      </aside>
    );
  }

  return (
    <main className="flex flex-col items-center gap-4 pb-2 w-full">
      {/* 메인 날씨 정보 */}
      <section
        className="flex flex-col gap-1 items-center"
        aria-label="현재 날씨"
      >
        <span className="flex flex-row justify-center items-center  text-gray-900 text-xl font-bold gap-2">
          {koreanAddress || weatherData.name} 
          <span className="text-sub-800">
            {Math.round(weatherData.main.temp)}°C •
            {getWeatherKorean(weatherData.weather[0].main)}
          </span>
          <Image
            src={getWeatherIcon(weatherData.weather[0].main)}
            alt={weatherData.weather[0].main}
            width={25}
            height={25}
            className="object-contain"
            priority
          />
        </span>
        <p className="text-gray-800 text-sm font-medium">
          <span>
            일출 {formatTime(weatherData.sys.sunrise)} • 일몰{" "}
            {formatTime(weatherData.sys.sunset)}
          </span>
        </p>
      </section>

      {/* 벌 관련 메시지 보류  */}
      {/* <aside
        className="rounded-xl text-center w-[335px] bg-[#FFE482] flex items-center justify-center py-3"
        aria-label="꿀벌 활동 정보"
      >
        <p className="text-main-900 font-semibold text-md tracking-tight whitespace-pre-line">
          {getBeeMessage(weatherData)}
        </p>
      </aside> */}

      {/* 6일 예보 */}
      {forecastData && (
        <section
          className="w-full shadow-[0_4px_10px_0px_rgba(0,0,0,0.04)] border border-gray-300 bg-white rounded-xl px-4 py-3"
          aria-label="주간 날씨 예보"
        >
          <ul className="grid grid-cols-5 gap-2">
            {dailyForecast.map((day, index) => {
              return (
                <li
                  key={index}
                  className="bg-gray-200 rounded-lg text-center py-0.75"
                >
                  <time className="text-sm font-medium text-gray-900 block">
                    {formatDayShort(day.dt)}
                  </time>
                  <div className="flex justify-center items-center">
                    <Image
                      src={getWeatherIcon(day.weather.main)}
                      alt={day.weather.main}
                      height={30}
                      width={30}
                      className="object-contain"
                      priority
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* 농업기상 정보 사이드바 */}
      <section className="w-[335px] shadow-[0_4px_10px_0px_rgba(0,0,0,0.04)] border-1 border-gray-300 bg-white rounded-xl px-4 py-3 text-center">
        {detailError && (
          <p className="text-red text-sm font-regular py-2 text-center">
            {detailError}
          </p>
        )}
        {detailData ? (
          <>
            {visibleItems.length > 0 ? (
              <div className="flex flex-row">
                {visibleItems.map((it) => (
                  <article key={it.key} className="rounded-lg p-3 bg-gray-200">
                    <h4 className="text-gray-700 text-sm font-medium">
                      {it.label}
                    </h4>
                    <data
                      value={it.value}
                      className="text-lg font-semibold text-sub-800"
                    >
                      {it.value}
                      {it.unit}
                    </data>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                표시할 관측 데이터가 없습니다.
              </p>
            )}
          </>
        ) : (
          detailLoading && (
            <p className="text-white/70 text-sm text-center py-4">
              불러오는 중...
            </p>
          )
        )}

        {/* 위치 확인 안내 메시지 */}
        <aside
          className="flex flex-col justify-center items-center"
          role="note"
        >
          <p className="text-gray-800 text-[12px] text-center font-medium tracking-[-0.025em]">
            날씨정보를 보려면{" "}
            <span className="underline underline-offset-4">내 위치 확인</span>을
            허용해 주세요.
          </p>
        </aside>
      </section>
    </main>
  );
}
