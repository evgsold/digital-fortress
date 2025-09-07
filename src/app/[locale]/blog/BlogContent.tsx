"use client"

import type { ReactNode } from "react"

// Типы для контента
export interface ContentBlock {
  type: string
  [key: string]: any
}

interface BlogContentProps {
  content: ContentBlock[]
}

// Компонент параграфа
function Paragraph({ content, className = "" }: { content: string; className?: string }) {
  return <p className={`text-base leading-relaxed mb-4 ${className}`}>{content}</p>
}

// Компонент заголовка
function Heading({ level, content }: { level: number; content: string }) {
  const baseClasses = "font-bold mt-6 mb-3"

  switch (level) {
    case 2:
      return <h2 className={`text-2xl ${baseClasses}`}>{content}</h2>
    case 3:
      return <h3 className={`text-xl ${baseClasses}`}>{content}</h3>
    case 4:
      return <h4 className={`text-lg ${baseClasses}`}>{content}</h4>
    default:
      return <h2 className={`text-2xl ${baseClasses}`}>{content}</h2>
  }
}

// Компонент списка
function List({ items, ordered = false }: { items: string[]; ordered?: boolean }) {
  const ListTag = ordered ? "ol" : "ul"
  const listClass = ordered ? "list-decimal" : "list-disc"

  return (
    <ListTag className={`${listClass} list-inside mb-4 pl-4 space-y-2`}>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ListTag>
  )
}

// Компонент совета/подсказки
function Tip({ title, content }: { title: string; content: string; color?: string }) {
  return (
    <div className="border-l-4 border-black p-4 my-6 bg-gray-100">
      <h3 className="font-bold mb-2">{title}</h3>
      <p>{content}</p>
    </div>
  )
}

// Компонент информационного блока
function InfoBox({ title, items }: { title: string; items: string[]; color?: string }) {
  return (
    <div className="border-2 border-black p-4 my-6">
      <h3 className="font-bold mb-3">{title}</h3>
      <ul className="list-disc list-inside space-y-1">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

// Компонент рейтинга продукта
function ProductRating({ name, rating, description }: { name: string; rating: string; description: string; color?: string }) {
  return (
    <div className="border-2 border-black p-4 my-6">
      <h3 className="text-xl font-bold mb-2">{name}</h3>
      <p className="font-bold mb-2">⭐ {rating}</p>
      <p>{description}</p>
    </div>
  )
}

// Компонент разделителя
function Divider() {
  return <hr className="border-t-2 border-black my-6" />
}

// Компонент цитаты
function Quote({ content }: { content: string }) {
  return (
    <blockquote className="border-l-4 border-black pl-4 my-6 italic">
      <p className="text-lg">"{content}"</p>
    </blockquote>
  )
}

// Компонент шагов (для туториалов)
function Steps({ steps }: { steps: string[] }) {
  return (
    <ol className="list-decimal list-inside mb-4 pl-4 space-y-2">
      {steps.map((step, index) => (
        <li key={index}>{step}</li>
      ))}
    </ol>
  )
}

// Основной компонент для рендеринга контента
export default function BlogContent({ content }: BlogContentProps) {
  const renderBlock = (block: ContentBlock, index: number): ReactNode => {
    switch (block.type) {
      case "paragraph":
        return <Paragraph key={index} content={block.content} />
      case "heading":
        return <Heading key={index} level={block.level} content={block.content} />
      case "list":
        return <List key={index} items={block.items} />
      case "steps":
        return <Steps key={index} steps={block.steps} />
      case "tip":
        return <Tip key={index} title={block.title} content={block.content} />
      case "infoBox":
        return <InfoBox key={index} title={block.title} items={block.items} />
      case "productRating":
        return <ProductRating key={index} name={block.name} rating={block.rating} description={block.description} />
      default:
        return null
    }
  }

  return <div>{content.map((block, index) => renderBlock(block, index))}</div>
}
