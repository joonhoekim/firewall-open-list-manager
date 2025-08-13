"use server"

import { unstable_noStore } from "next/cache"

// tldr 파일의 전체 구조 정의
interface TldrFile {
  records: any[]
}

// 파싱된 시스템 정보
interface SystemInfo {
  id: string
  name: string
  addresses: string[]
  description: string
}

// 파싱된 방화벽 정보
interface FirewallInfo {
  id: string
  ports: string[]
  direction: string
  purpose: string
  color?: string
  sourceSystemId?: string
  targetSystemId?: string
}

// CSV 결과 행
export interface FirewallCsvRow {
  sourceSystem: string
  sourceAddress: string
  targetSystem: string
  targetAddress: string
  port: string
  direction: string
  purpose: string
  description: string
  status: string
}

/**
 * richText에서 텍스트 추출 (사각형용)
 */
function extractTextFromRichText(richText: any): string {
  if (!richText || richText.type !== "doc" || !richText.content) return ""
  
  let text = ""
  for (const paragraph of richText.content) {
    if (paragraph.content) {
      for (const textNode of paragraph.content) {
        if (textNode.text) {
          text += textNode.text + "\n"
        }
      }
    }
  }
  
  return text.trim()
}

/**
 * 화살표 텍스트에서 정보 추출
 */
function extractTextFromArrowText(text: string): string {
  return text || ""
}

/**
 * 화살표 색상으로 상태 판단
 * - green: 처리
 * - red: 미처리
 * - blue: 처리예정
 * - 그 외: 미확인
 */
function determineStatusFromColor(color?: string): string {
  if (!color) return "미확인"
  if (color === "black") return "미확인"
  if (color === "green") return "처리"
  if (color === "red") return "미처리"
  if (color === "blue") return "처리예정"
  return "미확인"
}

/**
 * 텍스트에서 필드 값 추출 (예: NAME:[VDI] -> VDI)
 */
function extractFieldValue(text: string, fieldName: string): string[] {
  const regex = new RegExp(`${fieldName}:\\[([^\\]]*)\\]`, 'g')
  const matches = []
  let match
  
  while ((match = regex.exec(text)) !== null) {
    const value = match[1].trim()
    if (value) {
      // 쉼표로 구분된 값들을 분리
      matches.push(...value.split(',').map(v => v.trim()).filter(v => v))
    }
  }
  
  return matches
}

/**
 * 사각형(시스템) 정보 파싱
 */
function parseSystemInfo(record: any): SystemInfo | null {
  // 1. typeName이 "shape"인지 확인
  if (record.typeName !== "shape") return null
  
  // 2. type이 "geo"인지 확인
  if (record.type !== "geo") return null
  
  // 3. props.geo가 "rectangle"인지 확인
  if (!record.props || record.props.geo !== "rectangle") return null
  
  // 4. richText가 있고 type이 "doc"인지 확인
  if (!record.props.richText || record.props.richText.type !== "doc") return null
  
  // 5. content에서 $$로 시작하는 텍스트가 있는지 확인
  const text = extractTextFromRichText(record.props.richText)
  if (!text.includes("$$")) return null
  
  const names = extractFieldValue(text, "NAME")
  const addresses = extractFieldValue(text, "ADDRESS")
  const descriptions = extractFieldValue(text, "DESC")
  
  return {
    id: record.id,
    name: names[0] || "",
    addresses: addresses,
    description: descriptions[0] || ""
  }
}

/**
 * 화살표(방화벽) 정보 파싱
 */
function parseFirewallInfo(record: any): FirewallInfo | null {
  // 1. typeName이 "shape"인지 확인
  if (record.typeName !== "shape") return null
  
  // 2. type이 "arrow"인지 확인
  if (record.type !== "arrow") return null
  
  // 3. 텍스트 추출: tldraw의 화살표 라벨은 richText에 담김
  const textFromRich = extractTextFromRichText(record.props?.richText)
  const textFromLegacy = extractTextFromArrowText(record.props?.text || "")
  const text = (textFromRich || textFromLegacy || "").trim()
  if (!text.includes("$$")) return null
  
  const ports = extractFieldValue(text, "PORT")
  const directions = extractFieldValue(text, "DIRECTION")
  const purposes = extractFieldValue(text, "PURPOSE")
  
  return {
    id: record.id,
    ports: ports,
    direction: directions[0] || "",
    purpose: purposes[0] || "",
    color: record.props?.color
  }
}

/**
 * 바인딩 정보에서 화살표 연결 정보 찾기
 */
function findArrowConnections(records: any[]): Map<string, { sourceSystemId: string; targetSystemId: string }> {
  const connections = new Map<string, { sourceSystemId: string; targetSystemId: string }>()
  
  // typeName이 "binding"인 레코드들을 찾기
  const bindings = records.filter(record => record.typeName === "binding")
  
  console.log(`바인딩 레코드 수: ${bindings.length}`)
  
  // 화살표별로 바인딩 정보 수집
  const arrowBindings = new Map<string, { start?: string; end?: string }>()
  
  bindings.forEach(binding => {
    const arrowId = binding.fromId
    
    console.log(`바인딩 정보: ${arrowId} -> ${binding.toId} (terminal: ${binding.props?.terminal})`)
    
    if (!arrowBindings.has(arrowId)) {
      arrowBindings.set(arrowId, {})
    }
    
    const arrowBinding = arrowBindings.get(arrowId)!
    
    if (binding.props?.terminal === "start") {
      arrowBinding.start = binding.toId
    } else if (binding.props?.terminal === "end") {
      arrowBinding.end = binding.toId
    }
  })
  
  // 시작점과 끝점이 모두 있는 화살표만 연결 정보로 저장
  arrowBindings.forEach((binding, arrowId) => {
    if (binding.start && binding.end) {
      console.log(`화살표 연결: ${arrowId} - ${binding.start} -> ${binding.end}`)
      connections.set(arrowId, {
        sourceSystemId: binding.start,
        targetSystemId: binding.end
      })
    } else {
      console.log(`불완전한 바인딩: ${arrowId}`, binding)
    }
  })
  
  console.log(`완성된 연결 수: ${connections.size}`)
  
  return connections
}

/**
 * tldr 파일을 해석해서 CSV 데이터로 변환
 */
export async function parseTldrToCSV(file: File): Promise<{
  success: boolean
  data?: FirewallCsvRow[]
  error?: string
}> {
  unstable_noStore()
  
  try {
    // 파일 읽기
    const fileContent = await file.text()
    const tldrData: TldrFile = JSON.parse(fileContent)
    
    if (!tldrData.records || !Array.isArray(tldrData.records)) {
      return { success: false, error: "유효하지 않은 tldr 파일 형식입니다." }
    }
    
    console.log(`전체 레코드 수: ${tldrData.records.length}`)
    
    // 시스템 정보 파싱
    const systems = new Map<string, SystemInfo>()
    const firewalls: FirewallInfo[] = []
    
    tldrData.records.forEach(record => {
      // 시스템 정보 파싱
      const systemInfo = parseSystemInfo(record)
      if (systemInfo) {
        console.log(`시스템 파싱됨: ${systemInfo.id} - ${systemInfo.name}`)
        systems.set(record.id, systemInfo)
      }
      
      // 방화벽 정보 파싱
      const firewallInfo = parseFirewallInfo(record)
      if (firewallInfo) {
        console.log(`방화벽 파싱됨: ${firewallInfo.id} - 포트: ${firewallInfo.ports.join(',')} - 목적: ${firewallInfo.purpose}`)
        firewalls.push(firewallInfo)
      }
    })
    
    console.log(`파싱된 시스템 수: ${systems.size}`)
    console.log(`파싱된 방화벽 수: ${firewalls.length}`)
    
    // 화살표 연결 정보 찾기
    const connections = findArrowConnections(tldrData.records)
    
    // CSV 데이터 생성
    const csvRows: FirewallCsvRow[] = []
    
    firewalls.forEach(firewall => {
      const connection = connections.get(firewall.id)
      console.log(`방화벽 ${firewall.id}의 연결 정보:`, connection)
      
      const sourceSystem = connection?.sourceSystemId ? systems.get(connection.sourceSystemId) : null
      const targetSystem = connection?.targetSystemId ? systems.get(connection.targetSystemId) : null
      
      console.log(`소스 시스템: ${sourceSystem?.name || 'N/A'}`)
      console.log(`타겟 시스템: ${targetSystem?.name || 'N/A'}`)
      
      // 포트별로 행 생성
      const ports = firewall.ports.length > 0 ? firewall.ports : [""]
      
      ports.forEach(port => {
        // 주소별로 행 생성
        const sourceAddresses = sourceSystem?.addresses && sourceSystem.addresses.length > 0 
          ? sourceSystem.addresses 
          : [""]
        const targetAddresses = targetSystem?.addresses && targetSystem.addresses.length > 0 
          ? targetSystem.addresses 
          : [""]
        
        sourceAddresses.forEach(sourceAddr => {
          targetAddresses.forEach(targetAddr => {
            csvRows.push({
              sourceSystem: sourceSystem?.name || "",
              sourceAddress: sourceAddr,
              targetSystem: targetSystem?.name || "",
              targetAddress: targetAddr,
              port: port,
              direction: firewall.direction,
              purpose: firewall.purpose,
              description: `${sourceSystem?.description || ""} -> ${targetSystem?.description || ""}`.trim(),
              status: determineStatusFromColor(firewall.color)
            })
          })
        })
      })
    })
    
    console.log(`생성된 CSV 행 수: ${csvRows.length}`)
    
    return { success: true, data: csvRows }
    
  } catch (error) {
    console.error("tldr 파싱 오류:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "파일 파싱 중 오류가 발생했습니다." 
    }
  }
}

/**
 * CSV 데이터를 문자열로 변환하는 서버 액션
 */
export async function convertToCSVString(data: FirewallCsvRow[]): Promise<string> {
  unstable_noStore()
  
  if (data.length === 0) return ""
  
  // 헤더
  const headers = [
    "Source System",
    "Source Address", 
    "Target System",
    "Target Address",
    "Port",
    "Direction",
    "Purpose",
    "Description",
    "Status"
  ]
  
  // CSV 값 이스케이프 처리
  const escapeCSV = (value: string): string => {
    if (!value) return ""
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }
  
  // 헤더 행
  const csvContent = [headers.join(",")]
  
  // 데이터 행들
  data.forEach(row => {
    const csvRow = [
      escapeCSV(row.sourceSystem),
      escapeCSV(row.sourceAddress),
      escapeCSV(row.targetSystem),
      escapeCSV(row.targetAddress),
      escapeCSV(row.port),
      escapeCSV(row.direction),
      escapeCSV(row.purpose),
      escapeCSV(row.description),
      escapeCSV(row.status)
    ]
    csvContent.push(csvRow.join(","))
  })
  
  return csvContent.join("\n")
} 