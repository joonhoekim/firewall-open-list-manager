# Firewall Open List Manager

tldraw 다이어그램에서 방화벽 오픈 규칙을 분석하고, CSV 또는 Excel 파일로 내보내는 도구입니다.

## 주요 기능

- `.tldr` 파일 업로드 및 방화벽 규칙 자동 분석
- 분석 결과 테이블 표시
- **CSV 내보내기** (UTF-8 BOM 포함, 한글 지원)
- **Excel(.xlsx) 내보내기** (열 너비 자동 조정)

## 다이어그램 작성 규칙

### 지원 오브젝트

| 오브젝트 | tldraw 도형 | 설명 |
|----------|------------|------|
| `$$SYSTEM` | 사각형 (rectangle) | 시스템 정보 |
| `$$FIREWALL` | 화살표 (arrow) | 방화벽 규칙 |

### 필드 형식

**시스템 (사각형)**
- `NAME:[시스템명]` - 시스템 이름
- `ADDRESS:[IP주소]` - 시스템 주소 (쉼표로 복수 지정 가능)
- `DESC:[설명]` - 시스템 설명

**방화벽 규칙 (화살표)**
- `PORT:[포트번호]` - 방화벽 포트 (쉼표로 복수 지정 가능)
- `DIRECTION:[방향]` - 방화벽 방향
- `PURPOSE:[목적]` - 방화벽 오픈 목적

### 상태 색상 규칙

화살표 색상으로 처리 상태를 구분합니다.

| 색상 | 상태 |
|------|------|
| 초록 | 처리 |
| 빨강 | 미처리 |
| 파랑 | 처리예정 |
| 그 외 | 미확인 |

## 시작하기

```bash
pnpm install
pnpm dev
```

[http://localhost:3000/firewall](http://localhost:3000/firewall) 에서 사용할 수 있습니다.

## 기술 스택

- Next.js 16 (Turbopack)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- xlsx (SheetJS)
