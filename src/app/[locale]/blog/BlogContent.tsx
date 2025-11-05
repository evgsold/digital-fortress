"use client"

import type { ReactNode } from "react"
import { Info, Star, Lightbulb } from "lucide-react"

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
  return <p className={`text-[#91B1C0] text-lg leading-relaxed mb-6 ${className}`}>{content}</p>
}

// Компонент заголовка
function Heading({ level, content }: { level: number; content: string }) {
  const baseClasses = "font-bold mt-8 mb-4 text-[#A1CCB0]"

  switch (level) {
    case 2:
      return <h2 className={`text-3xl ${baseClasses}`}>{content}</h2>
    case 3:
      return <h3 className={`text-2xl ${baseClasses}`}>{content}</h3>
    case 4:
      return <h4 className={`text-xl ${baseClasses}`}>{content}</h4>
    default:
      return <h2 className={`text-3xl ${baseClasses}`}>{content}</h2>
  }
}

// Компонент списка
function List({ items, ordered = false }: { items: string[]; ordered?: boolean }) {
  const ListTag = ordered ? "ol" : "ul"
  const listClass = ordered ? "list-decimal" : "list-disc"

  return (
    <ListTag className={`text-[#91B1C0] text-lg ${listClass} list-inside mb-6 pl-4 space-y-2`}>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ListTag>
  )
}

// Компонент совета/подсказки
function Tip({ title, content }: { title: string; content: string }) {
  return (
    <div className="border-l-4 border-[#A1CCB0] p-6 my-8 bg-[#91B1C0]/10 rounded-r-lg">
      <h3 className="font-bold mb-2 text-[#A1CCB0] flex items-center gap-2">
        <Lightbulb className="w-5 h-5" />
        {title}
      </h3>
      <p className="text-[#91B1C0]">{content}</p>
    </div>
  )
}

// Компонент информационного блока
function InfoBox({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="border-2 border-[#91B1C0]/30 p-6 my-8 bg-[#91B1C0]/10 rounded-xl">
      <h3 className="font-bold mb-3 text-[#A1CCB0] flex items-center gap-2">
        <Info className="w-5 h-5" />
        {title}
      </h3>
      <ul className="list-disc list-inside space-y-1 text-[#91B1C0]">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

// Компонент рейтинга продукта
function ProductRating({ name, rating, description }: { name: string; rating: string; description: string }) {
  return (
    <div className="border-2 border-[#91B1C0]/30 p-6 my-8 bg-[#91B1C0]/10 rounded-xl">
      <h3 className="text-xl font-bold mb-2 text-[#A1CCB0]">{name}</h3>
      <p className="font-bold mb-2 text-[#A1CCB0] flex items-center gap-1">
        <Star className="w-5 h-5 text-yellow-400" /> {rating}
      </p>
      <p className="text-[#91B1C0]">{description}</p>
    </div>
  )
}

// Компонент разделителя
function Divider() {
  return <hr className="border-t-2 border-[#91B1C0]/20 my-8" />
}

// Компонент цитаты
function Quote({ content }: { content: string }) {
  return (
    <blockquote className="border-l-4 border-[#A1CCB0] pl-6 my-8 italic">
      <p className="text-xl text-[#91B1C0]">"{content}"</p>
    </blockquote>
  )
}

// Компонент шагов (для туториалов)
function Steps({ steps }: { steps: string[] }) {
  return (
    <ol className="list-decimal list-inside mb-6 pl-4 space-y-3 text-[#91B1C0] text-lg">
      {steps.map((step, index) => (
        <li key={index} className="pl-2">{step}</li>
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
        return <List key={index} items={block.items} ordered={block.ordered} />
      case "steps":
        return <Steps key={index} steps={block.steps} />
      case "tip":
        return <Tip key={index} title={block.title} content={block.content} />
      case "infoBox":
        return <InfoBox key={index} title={block.title} items={block.items} />
      case "productRating":
        return <ProductRating key={index} name={block.name} rating={block.rating} description={block.description} />
      case "divider":
        return <Divider key={index} />
      case "quote":
        return <Quote key={index} content={block.content} />
      default:
        return null
    }
  }

  return <div className="font-mono">{content.map((block, index) => renderBlock(block, index))}</div>
}