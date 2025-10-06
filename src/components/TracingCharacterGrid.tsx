"use client";

import type { GridType } from "@/lib/types";
import { TianZiGe, MiZiGe, HuiGongGe } from "./GridPatterns";
import { cn } from "@/lib/utils";
import { PinyinGrid } from "./PinyinGrid";

interface TracingCharacterGridProps {
  strokes: string[];
  gridType: GridType;
  highlightStroke?: number;
  isTracing?: boolean;
  isExample?: boolean;
  showPinyin?: boolean;
  pinyin?: string;
  gridColor?: string;
  characterColor?: string;
  tracingColor?: string;  // 仅用于描红练习
  strokeColor?: string;  // 当前笔顺演示颜色
  completedStrokeColor?: string;  // 完成笔顺颜色
}

const GridComponents = {
  "tian-zi-ge": TianZiGe,
  "mi-zi-ge": MiZiGe,
  "hui-gong-ge": HuiGongGe,
};

export function TracingCharacterGrid({ 
  strokes, 
  gridType, 
  highlightStroke = -1, 
  isTracing = false, 
  isExample = false,
  showPinyin = false,
  pinyin = "",
  gridColor,
  characterColor = "#000000",
  tracingColor = "#fca5a5",  // 仅用于描红练习
  strokeColor = "#f97316",  // 当前笔顺演示默认颜色
  completedStrokeColor = "#10b981",  // 完成笔顺默认颜色
}: TracingCharacterGridProps) {
  const GridPattern = GridComponents[gridType];
  const viewBoxSize = 1024;
  const yOffset = -900;
  
  return (
    <div className={cn(
      "flex flex-col items-center", 
      isExample ? 'w-24 h-24 flex-shrink-0' : 'w-full'
    )}>
      {!isExample && (
         <div className="h-8 w-full relative mb-0.5">
           <PinyinGrid pinyin={pinyin} show={showPinyin} gridColor={gridColor} />
        </div>
      )}
      <div className={cn(
          "relative w-full aspect-square border border-muted-foreground/30 bg-background"
        )}>
        <GridPattern className="absolute inset-0 w-full h-full" gridColor={gridColor} />
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        >
          <g transform={`scale(1, -1) translate(0, ${yOffset})`}>
            {isTracing ? (
              // Mode 1: Render the full character for tracing (仅使用描字颜色)
              <path
                d={strokes.join(' ')}
                fill={tracingColor + "40"}  // 使用描字颜色加透明度
                className="tracing-char"
              />
            ) : isExample ? (
              // Mode 3: Render the full character for example
              <path
                d={strokes.join(' ')}
                fill={characterColor}  // 使用汉字颜色
              />
            ) : (
              // Mode 2: Render stroke-by-stroke animation
              <>
                {/* Base character in light tracing color */}
                {strokes.map((stroke, i) => (
                  <path
                    key={`base-${i}`}
                    d={stroke}
                    fill={tracingColor + "20"}  // 使用描字颜色的淡版本作为底线
                  />
                ))}
                {/* Completed strokes - 使用完成笔顺颜色 */}
                {strokes.slice(0, highlightStroke).map((stroke, i) => (
                  <path
                    key={`done-${i}`}
                    d={stroke}
                    fill={completedStrokeColor}  // 使用独立的完成笔顺颜色
                  />
                ))}
                {/* Current highlighted stroke - 使用当前笔顺颜色 */}
                {strokes[highlightStroke] && (
                  <path
                    d={strokes[highlightStroke]}
                    fill={strokeColor}  // 使用当前笔顺演示颜色
                  />
                )}
              </>
            )}
          </g>
        </svg>
      </div>
    </div>
  );
}