/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  name?: string
  launchDate?: string
  siteUrl?: string
}

const Email = ({ name, launchDate = 'June 21, 2026', siteUrl = 'https://sdev.codes' }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>SDEV launches on {launchDate} — get ready.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>SDEV launches {launchDate}</Heading>
        <Text style={text}>{name ? `Hey ${name},` : 'Hey,'}</Text>
        <Text style={text}>
          A quick reminder — SDEV, the programming language where code becomes poetry, goes live on <strong>{launchDate}</strong>.
          Expressive syntax, built-in graphics, a full compiler, and you can write it in any human language.
        </Text>
        <Text style={text}>Mark your calendar. We'll send the link the moment it's live.</Text>
        <Button style={button} href={siteUrl}>Visit sdev.codes</Button>
        <Text style={footer}>You're receiving this because you signed up for SDEV launch updates.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: ({ launchDate }: Props) => `SDEV launches ${launchDate ?? 'soon'} — save the date`,
  displayName: 'Launch reminder',
  previewData: { name: 'Jane', launchDate: 'June 21, 2026', siteUrl: 'https://sdev.codes' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Space Grotesk', 'Inter', Arial, sans-serif" }
const container = { padding: '24px 28px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#0b1220', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#475569', lineHeight: '1.6', margin: '0 0 18px' }
const button = { backgroundColor: 'hsl(205, 90%, 48%)', color: '#ffffff', fontSize: '14px', borderRadius: '10px', fontWeight: 'bold' as const, padding: '12px 22px', textDecoration: 'none' }
const footer = { fontSize: '12px', color: '#94a3b8', margin: '32px 0 0' }
