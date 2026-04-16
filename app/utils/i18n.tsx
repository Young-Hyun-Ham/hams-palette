"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Locale = "en" | "ko";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
};

const LOCALE_STORAGE_KEY = "hams-palette-locale";

const dictionary: Record<Locale, Record<string, string>> = {
  en: {},
  ko: {
    "language": "언어",
    "english": "영어",
    "korean": "한국어",
    "saved template list": "저장된 템플릿 목록",
    "the main screen reads templates from `data/dashboard.json`.": "메인 화면은 `data/dashboard.json`의 템플릿 데이터를 불러옵니다.",
    "create template": "템플릿 등록",
    "template": "템플릿",
    "blocks": "블록",
    "block": "블록",
    "no description": "설명 없음",
    "updated": "수정일",
    "open": "열기",
    "no saved templates yet. use create template to add one.": "저장된 템플릿이 없습니다. 템플릿 등록으로 추가하세요.",
    "new template": "새 템플릿",
    "failed to load the saved template.": "저장된 템플릿을 불러오지 못했습니다.",
    "there is no layout to save.": "저장할 레이아웃이 없습니다.",
    "failed to save the template.": "템플릿 저장에 실패했습니다.",
    "saved to data/dashboard.json": "data/dashboard.json에 저장했습니다.",
    "back to list": "목록으로 이동",
    "template builder": "템플릿 빌더",
    "block palette": "블록 팔레트",
    "drag": "드래그",
    "hero": "히어로",
    "intro": "인트로",
    "visual": "비주얼",
    "tabs": "탭",
    "notice": "공지",
    "program": "프로그램",
    "cta": "CTA",
    "footer": "푸터",
    "primary visual": "메인 비주얼",
    "text + image": "텍스트 + 이미지",
    "media slot": "미디어 슬롯",
    "tabbed content": "탭 콘텐츠",
    "markdown feed": "마크다운 피드",
    "card grid": "카드 그리드",
    "action area": "액션 영역",
    "contact / links": "연락처 / 링크",
    "layout workspace": "레이아웃 작업영역",
    "main template layout": "메인 템플릿 레이아웃",
    "reset layout": "레이아웃 초기화",
    "preview": "미리보기",
    "saving...": "저장 중...",
    "save": "저장",
    "template title": "템플릿 제목",
    "enter a template title": "템플릿 제목을 입력하세요",
    "description": "설명",
    "short description for the list screen": "목록 화면에 표시할 짧은 설명",
    "canvas width 1440px": "캔버스 폭 1440px",
    "grid 12 / full content view": "12 그리드 / 전체 콘텐츠 보기",
    "remove": "삭제",
    "content is disabled for this block.": "이 블록은 콘텐츠 표시가 비활성화되어 있습니다.",
    "drop zone": "드롭 영역",
    "drag a block here to append it to the layout.": "블록을 여기로 드래그하면 레이아웃 아래에 추가됩니다.",
    "selected block": "선택된 블록",
    "instance": "인스턴스",
    "tone": "톤",
    "attachments": "첨부파일",
    "background": "배경",
    "configured": "설정됨",
    "none": "없음",
    "frame properties": "프레임 속성",
    "frame settings": "프레임 설정",
    "columns": "컬럼",
    "content height": "콘텐츠 높이",
    "enable content": "콘텐츠 사용",
    "controls whether the block shows in preview.": "미리보기에서 블록 표시 여부를 제어합니다.",
    "enabled": "사용",
    "disabled": "미사용",
    "tab count": "탭 개수",
    "tab": "탭",
    "active": "활성",
    "open state": "열기",
    "tab title": "탭 제목",
    "tab content palette": "탭 콘텐츠 팔레트",
    "add": "추가",
    "active tab content": "활성 탭 콘텐츠",
    "no blocks in the active tab.": "활성 탭에 블록이 없습니다.",
    "content editor": "콘텐츠 편집기",
    "edit text, background image, and attachments.": "텍스트, 배경 이미지, 첨부파일을 편집합니다.",
    "open editor": "열기",
    "no blocks in this tab yet.": "이 탭에는 아직 블록이 없습니다.",
    "layout preview": "레이아웃 미리보기",
    "close": "닫기",
    "edit block": "블록 편집",
    "memo editor": "메모 편집기",
    "align left": "왼쪽 정렬",
    "align center": "가운데 정렬",
    "align right": "오른쪽 정렬",
    "undo": "실행 취소",
    "redo": "다시 실행",
    "bold": "굵게",
    "italic": "기울임",
    "strike": "취소선",
    "open emoji and text picker": "이모지 및 텍스트 선택 열기",
    "size": "크기",
    "font size": "글자 크기",
    "emoji": "이모지",
    "text": "텍스트",
    "write markdown or memo content.": "마크다운 또는 메모 내용을 입력하세요.",
    "uploaded files stay in binary array form until save.": "업로드 파일은 저장 전까지 바이너리 배열 형태로 유지됩니다.",
    "add file": "파일 추가",
    "bytes": "바이트",
    "insert image": "이미지 삽입",
    "insert tag": "태그 삽입",
    "no attachments yet.": "첨부파일이 없습니다.",
    "the selected image is kept in memory until save.": "선택한 이미지는 저장 전까지 메모리에 유지됩니다.",
    "select image": "이미지 선택",
    "open background color picker": "배경색 선택 열기",
    "background color picker": "배경색 선택기",
    "background color hex code": "배경색 코드",
    "no background image selected.": "선택된 배경 이미지가 없습니다.",
    "live preview": "실시간 미리보기",
    "cancel": "취소",
    "apply": "적용",
  },
};

const I18nContext = createContext<I18nContextValue | null>(null);

function normalizeKey(key: string) {
  return key.trim().toLowerCase();
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("ko");

  useEffect(() => {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
    if (stored === "en" || stored === "ko") {
      setLocale(stored);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key: string) => {
        const normalized = normalizeKey(key);
        return dictionary[locale][normalized] ?? key;
      },
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used within I18nProvider.");
  }

  return context;
}
