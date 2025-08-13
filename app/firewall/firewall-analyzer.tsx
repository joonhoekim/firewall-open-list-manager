"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, FileText, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { parseTldrToCSV, convertToCSVString, type FirewallCsvRow } from "./actions"

export function FirewallAnalyzer() {
  const [file, setFile] = useState<File | null>(null)
  const [data, setData] = useState<FirewallCsvRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // tldr 파일 확장자 확인
      if (!selectedFile.name.endsWith('.tldr')) {
        toast.error('tldr 파일만 업로드할 수 있습니다.')
        return
      }
      setFile(selectedFile)
      setData([]) // 이전 데이터 초기화
    }
  }

  const handleAnalyze = async () => {
    if (!file) {
      toast.error('먼저 tldr 파일을 선택해주세요.')
      return
    }

    setIsLoading(true)
    
    try {
      const result = await parseTldrToCSV(file)
      
      if (result.success && result.data) {
        setData(result.data)
        toast.success(`${result.data.length}개의 방화벽 규칙이 분석되었습니다.`)
      } else {
        toast.error(result.error || '파일 분석 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('분석 오류:', error)
      toast.error('파일 분석 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportCSV = async () => {
    if (data.length === 0) {
      toast.error('내보낼 데이터가 없습니다.')
      return
    }

    setIsExporting(true)
    
    try {
      const csvString = await convertToCSVString(data)
      
      // BOM 추가 (한글 인코딩을 위해)
      const csvWithBOM = "\uFEFF" + csvString
      const blob = new Blob([csvWithBOM], { type: "text/csv;charset=utf-8;" })
      
      const url = URL.createObjectURL(blob)
      const fileName = `firewall_rules_${new Date().toISOString().split('T')[0]}.csv`
      
      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success('CSV 파일이 다운로드되었습니다.')
    } catch (error) {
      console.error('CSV 내보내기 오류:', error)
      toast.error('CSV 내보내기 중 오류가 발생했습니다.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 파일 업로드 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle>방화벽 다이어그램 분석</CardTitle>
          <CardDescription>
            tldr 파일을 업로드하여 방화벽 규칙을 분석하고 CSV로 내보내세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tldr-file">tldr 파일 선택</Label>
            <div className="flex items-center gap-2">
              <Input
                id="tldr-file"
                type="file"
                accept=".tldr"
                onChange={handleFileChange}
                className="file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
              />
              <Button onClick={handleAnalyze} disabled={!file || isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    분석 중...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    분석
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {file && (
            <div className="text-sm text-muted-foreground">
              선택된 파일: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </div>
          )}
        </CardContent>
      </Card>

      {/* 결과 섹션 */}
      {data.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>분석 결과</CardTitle>
                <CardDescription>
                  {data.length}개의 방화벽 규칙이 분석되었습니다.
                </CardDescription>
              </div>
              <Button onClick={handleExportCSV} variant="outline" disabled={isExporting}>
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    내보내는 중...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    CSV 내보내기
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source System</TableHead>
                    <TableHead>Source Address</TableHead>
                    <TableHead>Target System</TableHead>
                    <TableHead>Target Address</TableHead>
                    <TableHead>Port</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{row.sourceSystem}</TableCell>
                      <TableCell>{row.sourceAddress}</TableCell>
                      <TableCell className="font-medium">{row.targetSystem}</TableCell>
                      <TableCell>{row.targetAddress}</TableCell>
                      <TableCell>{row.port}</TableCell>
                      <TableCell>{row.direction}</TableCell>
                      <TableCell className="max-w-xs truncate" title={row.purpose}>
                        {row.purpose}
                      </TableCell>
                      <TableCell className="max-w-xs truncate" title={row.description}>
                        {row.description}
                      </TableCell>
                <TableCell>
                  {row.status}
                </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 사용법 안내 */}
      <Card>
        <CardHeader>
          <CardTitle>사용법</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">지원하는 오브젝트</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• <strong>$$SYSTEM</strong>: 시스템 정보 (사각형)</li>
              <li>• <strong>$$FIREWALL</strong>: 방화벽 규칙 (화살표)</li>
              <li>• <strong>색상 규칙</strong>: 초록(처리), 빨강(미처리), 파랑(처리예정), 그 외(미처리)</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">필드 형식</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• <strong>NAME:[시스템명]</strong>: 시스템 이름</li>
              <li>• <strong>ADDRESS:[IP주소]</strong>: 시스템 주소</li>
              <li>• <strong>DESC:[설명]</strong>: 시스템 설명</li>
              <li>• <strong>PORT:[포트번호]</strong>: 방화벽 포트</li>
              <li>• <strong>DIRECTION:[방향]</strong>: 방화벽 방향</li>
              <li>• <strong>PURPOSE:[목적]</strong>: 방화벽 오픈 목적</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">예시</h4>
            <div className="bg-muted p-3 rounded-md text-sm font-mono">
              <div>$$SYSTEM</div>
              <div>NAME:[VDI서버]</div>
              <div>ADDRESS:[192.168.1.100]</div>
              <div>DESC:[가상 데스크톱 서버]</div>
              <div className="mt-2">$$FIREWALL</div>
              <div>PORT:[22,80,443]</div>
              <div>DIRECTION:[단방향]</div>
              <div>PURPOSE:[웹서비스접근]</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 