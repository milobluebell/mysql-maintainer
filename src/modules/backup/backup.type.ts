import type { BackupRecord } from './backup.entity';

export interface BackupRecordListResponse {
  data: BackupRecord[];
}

export interface BackupRecordDetailResponse {
  data: BackupRecord | null;
}

export interface BackupTriggerResponse {
  message: string;
}
