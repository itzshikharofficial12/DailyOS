'use client'

import { LinksPanel as LinksPanelComponent } from './LinksPanelRefactored'

export default function LinksPanel() {
  const links = [
    { label: 'GitHub', href: 'https://github.com' },
    { label: 'Figma', href: 'https://figma.com' },
    { label: 'Notion', href: 'https://notion.so' },
    { label: 'Vercel', href: 'https://vercel.com' },
  ]

  return <LinksPanelComponent links={links} />
}
