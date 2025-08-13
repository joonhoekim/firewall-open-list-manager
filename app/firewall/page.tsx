import { FirewallAnalyzer } from "./firewall-analyzer"

export default function FirewallPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">방화벽 다이어그램 분석기</h1>
        <p className="text-muted-foreground mt-2">
          tldr 다이어그램에서 방화벽 규칙을 추출하여 CSV로 내보내는 도구입니다.
        </p>
      </div>
      
      <FirewallAnalyzer />
    </div>
  )
}
