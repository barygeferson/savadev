/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: any) => string)
  displayName?: string
  previewData?: Record<string, any>
  to?: string
}

import { template as launchReminder } from './launch-reminder.tsx'
import { template as launchDay } from './launch-day.tsx'
import { template as postLaunchGuide } from './post-launch-guide.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'launch-reminder': launchReminder,
  'launch-day': launchDay,
  'post-launch-guide': postLaunchGuide,
}
