"use client";

import { cn } from "@/lib/utils";

interface PinyinGridProps {
  pinyin: string;
  show?: boolean;
  gridColor?: string;
}

export function PinyinGrid({ pinyin, show = false, gridColor }: PinyinGridProps) {
  if (!show) {
    return <div className="h-8" />;
  }

  const lineColor = gridColor || "hsl(var(--muted-foreground) / 0.4)";
  const middleLineColor = gridColor ? gridColor : "hsl(var(--muted-foreground) / 0.6)";

  return (
    <div className="h-8 w-full relative">
      {/* 标准拼音四线格：上线、上中线、下中线、下线 - 三个格间距相等 */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{backgroundColor: lineColor}} />
      <div className="absolute left-0 right-0 h-px" style={{top: '33.33%', backgroundColor: middleLineColor}} />
      <div className="absolute left-0 right-0 h-px" style={{top: '66.66%', backgroundColor: middleLineColor}} />
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{backgroundColor: lineColor}} />
      
      {/* 拼音文字，放置在中间格子（33.33% - 66.66%区域） */}
      <div className="absolute flex items-center justify-center" 
           style={{
             top: '33.33%',
             left: '0',
             right: '0',
             height: '33.33%'
           }}>
        <span className="text-sm text-muted-foreground leading-none">{pinyin.toLowerCase()}</span>
      </div>
    </div>
  );
}
