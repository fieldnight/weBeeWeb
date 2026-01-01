import { useEffect, useState } from "react";
import { weatherApi } from "../api/api";
import { WeatherState, DetailWeatherState, DetailWeatherData } from "./types";

/**
 * 위치 기반 날씨 정보를 가져오는 커스텀 훅
 * OpenWeatherMap API와 Nominatim API를 사용하여 현재 날씨, 예보, 한글 주소를 가져옵니다.
 */
export const useWeatherData = () => {
  const [state, setState] = useState<WeatherState & { hasRequested: boolean }>({
    weatherData: null,
    forecastData: null,
    koreanAddress: "",
    loading: false,
    error: "",
    hasRequested: false,
  });

  const requestLocationData = async () => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "이 브라우저는 위치 정보를 지원하지 않습니다.",
        loading: false,
        hasRequested: true,
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, hasRequested: true }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // 병렬로 API 호출하여 성능 최적화
          const [weatherData, forecastData, koreanAddress] = await Promise.all([
            weatherApi.getCurrentWeather(latitude, longitude),
            weatherApi.getForecast(latitude, longitude),
            weatherApi.getKoreanAddress(latitude, longitude),
          ]);

          setState((prev) => ({
            ...prev,
            weatherData,
            forecastData,
            koreanAddress,
            loading: false,
            error: "",
          }));
        } catch (error) {
          setState((prev) => ({
            ...prev,
            error: "데이터를 가져오는 데 실패했습니다.",
            loading: false,
          }));
          console.error("데이터 오류:", error);
        }
      },
      () => {
        setState((prev) => ({
          ...prev,
          error: "위치 정보를 가져오는 데 실패했습니다.",
          loading: false,
        }));
      }
    );
  };

  useEffect(() => {
    requestLocationData();
  }, []);

  return { ...state, requestLocationData };
};

/**
 * 농업기상 상세 정보를 가져오는 커스텀 훅
 * 국립농업과학원 API를 사용하여 농업기상 데이터를 가져옵니다.
 */
export function useDetailWeather(koreanAddress: string): DetailWeatherState {
  const [data, setData] = useState<DetailWeatherData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const serviceKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

  useEffect(() => {
    if (!koreanAddress) return;

    const fetchDetailWeather = async () => {
      setLoading(true);
      setError("");

      try {
        const today = new Date().toISOString().split("T")[0];

        const url = `http://apis.data.go.kr/1390802/AgriWeather/WeatherObsrInfo/V3/GnrlWeather/getWeatherTenMinList3?serviceKey=${serviceKey}&Page_No=1&Page_Size=1&date=${today}&obsr_Spot_Nm=${koreanAddress}`;

        const response = await fetch(url);
        const xmlText = await response.text();

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        const items = xmlDoc.getElementsByTagName("item");
        console.log("전체 관측소 개수:", items.length);
        console.log("현재 한글 주소, 관측소:", koreanAddress, items);

        let matchedItem: Element | null = null;

        // 한글 주소와 매칭되는 관측소 찾기
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const name =
            item.getElementsByTagName("stn_Name")[0]?.textContent ?? "";
          if (name.includes(koreanAddress)) {
            console.log("매칭된 관측소 이름:", name);
            matchedItem = item;
            break;
          }
        }

        console.log("매칭된 관측소 상세 내용:", matchedItem);

        if (!matchedItem) {
          setError(`"${koreanAddress}"에 해당하는 관측소를 찾을 수 없습니다.`);
          return;
        }

        // XML에서 값 추출하는 헬퍼 함수
        const getVal = (tag: string) =>
          matchedItem!.getElementsByTagName(tag)?.[0]?.textContent ?? "-";

        const detailData: DetailWeatherData = {
          stn_Code: getVal("stn_Code"),
          stn_Name: getVal("stn_Name"),
          date: getVal("date"),
          temp: getVal("temp"),
          max_Temp: getVal("max_Temp"),
          min_Temp: getVal("min_Temp"),
          hum: getVal("hum"),
          widdir: getVal("widdir"),
          wind: getVal("wind"),
          max_Wind: getVal("max_Wind"),
          rain: getVal("rain"),
          sun_Time: getVal("sun_Time"),
          sun_Qy: getVal("sun_Qy"),
          condens_Time: getVal("condens_Time"),
          gr_Temp: getVal("gr_Temp"),
          soil_Temp: getVal("soil_Temp"),
          soil_Wt: getVal("soil_Wt"),
        };

        setData(detailData);
        console.log("농업기상 데이터:", detailData);
      } catch (err) {
        console.error("농업기상 API 호출 오류:", err);
        setError("데이터를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetailWeather();
  }, [koreanAddress, serviceKey]);

  return { data, error, loading };
}
