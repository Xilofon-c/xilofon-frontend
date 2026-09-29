import { api } from './apiClient'

export type Report = {
  id: string
  shipment_ref: string
  issue_type: string
  description: string
  reporter_email: string | null
  status: string
  created_at: string
}

export type NewReport = Pick<Report, 'shipment_ref' | 'issue_type' | 'description'>

export async function createReport(report: NewReport) {
  const { data } = await api.post<Report>('/data/reports', report)
  return data
}

export async function listReports(limit = 10) {
  const { data } = await api.get<Report[]>('/data/reports', { params: { limit } })
  return data
}
