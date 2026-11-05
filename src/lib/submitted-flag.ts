/**
 * 중복 제출을 가볍게 막기 위한 브라우저 플래그.
 * 학교에서는 여러 학생이 한 기기를 같이 쓰므로 막지 않고 "이미 참여했어요" 안내만 한다.
 * 저장소를 쓸 수 없는 환경(사생활 보호 모드 등)에서도 오류 없이 동작해야 한다.
 */
const KEY = "ethics-dilemma:submitted-at";

export function markSubmitted() {
  try {
    localStorage.setItem(KEY, new Date().toISOString());
  } catch {}
}

export function hasSubmitted(): boolean {
  try {
    return localStorage.getItem(KEY) !== null;
  } catch {
    return false;
  }
}
