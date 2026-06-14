/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  name?: string
  siteUrl?: string
}

const Email = ({ name, siteUrl = 'https://sdev.codes' }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>SDEV is live. Code becomes poetry — try it now.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>SDEV is live.</Heading>
        <Text style={text}>{name ? `${name}, the wait is over.` : 'The wait is over.'}</Text>
        <Text style={text}>
          SDEV is now public. Write code in any human language, render graphics in the browser,
          compile to bytecode, and explore a syntax that reads like prose. Forge, conjure, speak.
        </Text>
        <Button style={button} href={siteUrl}>Launch SDEV</Button>
        <Text style={text}>
          Open the playground, try the examples, share a gist. We built this for you — go make something strange.
        </Text>
        <Text style={footer}>You're receiving this because you signed up for SDEV launch updates.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'SDEV is live — code becomes poetry',
  displayName: 'Launch day',
  previewData: { name: 'Jane', siteUrl: 'https://sdev.codes' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Space Grotesk', 'Inter', Arial, sans-serif" }
const container = { padding: '24px 28px', maxWidth: '560px' }
const h1 = { fontSize: '28px', fontWeight: 'bold' as const, color: '#0b1220', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#475569', lineHeight: '1.6', margin: '0 0 18px' }
const button = { backgroundColor: 'hsl(205, 90%, 48%)', color: '#ffffff', fontSize: '15px', borderRadius: '10px', fontWeight: 'bold' as const, padding: '14px 26px', textDecoration: 'none' }
const footer = { fontSize: '12px', color: '#94a3b8', margin: '32px 0 0' }
