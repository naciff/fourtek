import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import AccordionSection from '@/app/components/AccordionSection'

function Wrapper() {
  return (
    <AccordionSection storageKey={'test:section'} title={'Informações Pessoais'} defaultOpen icon={<span/>}>
      <input aria-label="Campo" defaultValue="ABC" />
    </AccordionSection>
  )
}

test('expande e recolhe com botão e aria-expanded', () => {
  render(<Wrapper />)
  const btn = screen.getByRole('button')
  expect(btn).toHaveAttribute('aria-expanded', 'true')
  fireEvent.click(btn)
  expect(btn).toHaveAttribute('aria-expanded', 'false')
  fireEvent.click(btn)
  expect(btn).toHaveAttribute('aria-expanded', 'true')
})

test('persiste estado no localStorage', () => {
  render(<Wrapper />)
  const btn = screen.getByRole('button')
  fireEvent.click(btn)
  expect(localStorage.getItem('test:section')).toBe('0')
  fireEvent.click(btn)
  expect(localStorage.getItem('test:section')).toBe('1')
})

test('acessibilidade: region tem aria-labelledby', () => {
  render(<Wrapper />)
  const region = screen.getByRole('region')
  expect(region).toHaveAttribute('aria-labelledby')
})

test('integridade dos dados: campo mantém valor após interações', () => {
  render(<Wrapper />)
  const input = screen.getByLabelText('Campo') as HTMLInputElement
  fireEvent.change(input, { target: { value: 'XYZ' } })
  const btn = screen.getByRole('button')
  fireEvent.click(btn)
  fireEvent.click(btn)
  expect(input.value).toBe('XYZ')
})

