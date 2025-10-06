
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { getCharacterData } from "@/lib/actions";
import type { Settings, CharacterDetails, StrokeSistine } from "@/lib/types";
import { Printer, Loader2, Download } from "lucide-react";
import { TracingCharacterGrid } from "./TracingCharacterGrid";
import { CharacterInfo } from "./CharacterInfo";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";


type CharacterData = {
    details: CharacterDetails;
    strokesData: StrokeSistine;
}

export function WorksheetPreview({ settings }: { settings: Settings }) {
  const [characterDataMap, setCharacterDataMap] = useState(new Map<string, CharacterData>());
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const uniqueChars = useMemo(() => {
    const cleanedName = settings.name.replace(/\s+/g, '');
    return [...new Set(cleanedName.split(""))];
  }, [settings.name]);

  useEffect(() => {
    const fetchDetails = async () => {
      const newChars = uniqueChars.filter(char => !characterDataMap.has(char));
      
      if (newChars.length > 0) {
        setIsLoading(true);
        try {
          const results = await Promise.all(
            newChars.map(char => getCharacterData(char))
          );
          setCharacterDataMap(prevMap => {
            const newMap = new Map(prevMap);
            results.forEach((data, index) => {
              if (data) { // Ensure data is not null
                newMap.set(newChars[index], data);
              }
            });
            return newMap;
          });
        } catch (error) {
            console.error("Failed to fetch character data:", error);
        } finally {
            setIsLoading(false);
        }
      }
    };

    if (uniqueChars.length > 0) {
        fetchDetails();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniqueChars]);


  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    const element = document.getElementById('printable-area');
    if (!element) return;

    setIsDownloading(true);
    
    try {
        // 获取所有字符页面
        const characterPages = element.querySelectorAll('.character-page');
        
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'pt',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        for (let i = 0; i < characterPages.length; i++) {
            const page = characterPages[i] as HTMLElement;
            
            // 临时调整页面样式用于截图
            const originalStyle = page.style.cssText;
            page.style.width = '210mm';
            page.style.minHeight = '297mm';
            page.style.backgroundColor = '#ffffff';
            page.style.position = 'relative';
            page.style.padding = '20px';
            page.style.boxSizing = 'border-box';
            
            const canvas = await html2canvas(page, {
                scale: 2,
                useCORS: true,
                allowTaint: false,
                backgroundColor: '#ffffff',
                logging: false,
                width: page.scrollWidth,
                height: page.scrollHeight
            });

            // 恢复原始样式
            page.style.cssText = originalStyle;

            const imgData = canvas.toDataURL('image/png');
            
            if (i > 0) {
                pdf.addPage();
            }
            
            // 计算图片在PDF中的尺寸，保持宽高比
            const canvasAspectRatio = canvas.width / canvas.height;
            const pdfAspectRatio = pdfWidth / pdfHeight;
            
            let finalWidth, finalHeight;
            if (canvasAspectRatio > pdfAspectRatio) {
                finalWidth = pdfWidth;
                finalHeight = pdfWidth / canvasAspectRatio;
            } else {
                finalHeight = pdfHeight;
                finalWidth = pdfHeight * canvasAspectRatio;
            }

            const x = (pdfWidth - finalWidth) / 2;
            const y = (pdfHeight - finalHeight) / 2;
            
            pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
        }
        
        pdf.save('worksheet.pdf');

    } catch (error) {
        console.error("Error generating PDF:", error);
    } finally {
       setIsDownloading(false);
    }
  };

  // 计算所有汉字是否能在一页A4中显示
  const calculatePageLayout = () => {
    if (uniqueChars.length === 0) return { canFitInOnePage: false, pages: [] };
    
    const tracingRows = Math.max(1, settings.tracingRows);
    const charCount = uniqueChars.length;
    
    // 基于实际测试的分页规则
    let canFitInOnePage = false;
    
    if (charCount === 3) {
      // 三个汉字：描字行数 ≤ 2 时在一页显示
      canFitInOnePage = tracingRows <= 2;
    } else if (charCount === 2) {
      // 两个汉字：根据具体行数计算
      // 基于实际情况，2个汉字最多可以支持3-4行
      canFitInOnePage = tracingRows <= 4;
    } else if (charCount === 1) {
      // 单个汉字：根据具体行数计算
      // 单个汉字可以支持更多行数
      canFitInOnePage = tracingRows <= 8;
    } else if (charCount >= 4) {
      // 四个及以上汉字：建议总是分页以确保内容完整性
      canFitInOnePage = false;
    }
    
    // 额外检查：对于复杂汉字（笔画数多）进行保守处理
    if (canFitInOnePage) {
      let hasComplexCharacter = false;
      uniqueChars.forEach((char) => {
        const data = characterDataMap.get(char);
        if (data) {
          const { strokesData } = data;
          const strokes = strokesData?.strokes || [];
          const strokeCount = strokes.length;
          const gridsPerRow = settings.gridCount;
          
          // 如果汉字需要跨行（笔画数 > 每行格子数），则认为是复杂汉字
          if (strokeCount > gridsPerRow) {
            hasComplexCharacter = true;
          }
        }
      });
      
      // 如果有复杂汉字，进一步限制行数
      if (hasComplexCharacter) {
        if (charCount === 3 && tracingRows > 1) {
          canFitInOnePage = false;
        } else if (charCount === 2 && tracingRows > 3) {
          canFitInOnePage = false;
        } else if (charCount === 1 && tracingRows > 6) {
          canFitInOnePage = false;
        }
      }
    }
    
    if (canFitInOnePage) {
      // 所有汉字在一页显示
      return {
        canFitInOnePage: true,
        pages: [uniqueChars] // 单页包含所有汉字
      };
    } else {
      // 每个汉字独立一页
      return {
        canFitInOnePage: false,
        pages: uniqueChars.map(char => [char]) // 每页一个汉字
      };
    }
  };

  const allCharsLoaded = useMemo(() => {
    if (uniqueChars.length === 0) return true;
    return uniqueChars.every(char => characterDataMap.has(char) && characterDataMap.get(char)?.details);
  }, [uniqueChars, characterDataMap]);

  const pageLayout = useMemo(() => {
    if (uniqueChars.length === 0 || !allCharsLoaded) return { canFitInOnePage: false, pages: [] };
    return calculatePageLayout();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniqueChars, allCharsLoaded, settings.gridCount, settings.tracingRows]);

  const renderPracticeSheet = (char: string) => {
    const data = characterDataMap.get(char);
    if (!data) return null;

    const { details, strokesData } = data;
    const strokes = strokesData?.strokes || [];
    const strokeCount = strokes.length;
    const gridsPerRow = settings.gridCount;
    const tracingRows = Math.max(1, settings.tracingRows); // 至少重复一次

    // 创建一个完整的笔顺练习序列（笔顺描红 + 灰色描摸字填充）
    const createStrokePracticeSequence = () => {
      const sequence = [];
      
      // 添加笔顺描红部分
      for (let i = 0; i < strokeCount; i++) {
        sequence.push(
          <TracingCharacterGrid
            key={`stroke-${i}`}
            strokes={strokes}
            gridType={settings.gridType}
            highlightStroke={i}
            showPinyin={settings.showPinyin}
            pinyin={details.pinyin[0]}
            gridColor={settings.gridColor}
            characterColor={settings.characterColor}
            tracingColor={settings.tracingColor}
            strokeColor={settings.strokeColor}
            completedStrokeColor={settings.completedStrokeColor}
          />
        );
      }
      
      return sequence;
    };

    const allRows = [];
    
    if (strokeCount <= gridsPerRow) {
      // 情况 1: 笔画数 ≤ 每行格子数
      // 创建一个单行的练习序列
      const singleRowSequence = createStrokePracticeSequence();
      
      // 用灰色描摸字填充剩余位置
      const fillerCount = gridsPerRow - strokeCount;
      for (let i = 0; i < fillerCount; i++) {
        singleRowSequence.push(
          <TracingCharacterGrid
            key={`filler-${i}`}
            strokes={strokes}
            gridType={settings.gridType}
            isTracing={true}
            showPinyin={settings.showPinyin}
            pinyin={details.pinyin[0]}
            gridColor={settings.gridColor}
            characterColor={settings.characterColor}
            tracingColor={settings.tracingColor}
            strokeColor={settings.strokeColor}
            completedStrokeColor={settings.completedStrokeColor}
          />
        );
      }
      
      // 重复这个单行序列 N 次
      for (let row = 0; row < tracingRows; row++) {
        allRows.push(
          <div 
            key={`practice-row-${row}`} 
            className="grid w-full gap-1"
            style={{ gridTemplateColumns: `repeat(${gridsPerRow}, 1fr)` }}
          >
            {singleRowSequence.map((grid, index) => 
              React.cloneElement(grid as React.ReactElement, {
                key: `row-${row}-grid-${index}`
              })
            )}
          </div>
        );
      }
    } else {
      // 情况 2: 笔画数 > 每行格子数
      // 创建一个需要跨行的完整笔顺练习序列
      const fullSequence = createStrokePracticeSequence();
      
      // 计算需要多少行来完成一个完整的笔顺序列
      const rowsPerBlock = Math.ceil(strokeCount / gridsPerRow);
      const lastRowGridCount = strokeCount % gridsPerRow;
      
      // 在最后一行的末尾填充灰色描摸字
      if (lastRowGridCount > 0) {
        const fillerCount = gridsPerRow - lastRowGridCount;
        for (let i = 0; i < fillerCount; i++) {
          fullSequence.push(
            <TracingCharacterGrid
              key={`block-filler-${i}`}
              strokes={strokes}
              gridType={settings.gridType}
              isTracing={true}
              showPinyin={settings.showPinyin}
              pinyin={details.pinyin[0]}
              gridColor={settings.gridColor}
              characterColor={settings.characterColor}
              tracingColor={settings.tracingColor}
              strokeColor={settings.strokeColor}
              completedStrokeColor={settings.completedStrokeColor}
            />
          );
        }
      }
      
      // 重复这个完整的跨行“块” N 次
      for (let block = 0; block < tracingRows; block++) {
        // 将当前块的序列分解为多行
        for (let row = 0; row < rowsPerBlock; row++) {
          const startIndex = row * gridsPerRow;
          const endIndex = Math.min(startIndex + gridsPerRow, fullSequence.length);
          const rowGrids = fullSequence.slice(startIndex, endIndex);
          
          allRows.push(
            <div 
              key={`block-${block}-row-${row}`} 
              className="grid w-full gap-1"
              style={{ gridTemplateColumns: `repeat(${gridsPerRow}, 1fr)` }}
            >
              {rowGrids.map((grid, index) => 
                React.cloneElement(grid as React.ReactElement, {
                  key: `block-${block}-row-${row}-grid-${index}`
                })
              )}
            </div>
          );
        }
      }
    }

    return <div className="space-y-1">{allRows}</div>;
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4 no-print">
        <h2 className="text-xl font-bold font-headline">预览</h2>
        <div className="flex gap-2">
           <Button onClick={handlePrint} disabled={isLoading || isDownloading || uniqueChars.length === 0}>
            {isLoading ? <Loader2 className="animate-spin" /> : <Printer />}
            {isLoading ? "加载中..." : "打印"}
          </Button>
          <Button onClick={handleDownloadPdf} disabled={isLoading || isDownloading || uniqueChars.length === 0}>
            {isDownloading ? <Loader2 className="animate-spin" /> : <Download />}
            {isDownloading ? "下载中..." : "下载PDF"}
          </Button>
        </div>
      </div>

      <div id="printable-area" className="printable-area">
           {pageLayout.pages.length > 0 ? (
            <div className="character-pages">
              {pageLayout.pages.map((pageChars, pageIndex) => (
                <div key={`page-${pageIndex}`} className="character-page">
                  {/* 页眉 */}
                  <div className="page-header flex items-center justify-between p-2 border-b bg-background">
                    <div className="flex items-center space-x-3">
                      <img 
                        src="https://pic1.imgdb.cn/item/6817c79a58cb8da5c8dc723f.png" 
                        alt="字帖生成器 Logo"
                        className="h-12 w-36 rounded object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjY0IiB2aWV3Qm94PSIwIDAgMTkyIDY0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTkyIiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzM0ODNmYSIvPgo8dGV4dCB4PSI5NiIgeT0iNDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7lrZfluJY8L3RleHQ+Cjwvc3ZnPgo=';
                        }}
                      />
                    </div>
                    <div className="flex-1 text-center">
                      <h1 className="text-2xl font-bold text-foreground">姓名笔顺字帖</h1>
                    </div>
                    <div className="w-36 text-right text-sm text-muted-foreground">
                      {pageLayout.canFitInOnePage ? 
                        `全部/${uniqueChars.length}字` : 
                        `${pageIndex + 1}/${pageLayout.pages.length}`
                      }
                    </div>
                  </div>
                  
                  {/* 主内容 */}
                  <div className="page-content p-4 sm:p-6">
                    <div className={pageLayout.canFitInOnePage ? "space-y-6" : "space-y-2"}>
                      {pageChars.map((char) => {
                        const data = characterDataMap.get(char);
                        if (!data) return null;
                        
                        const { details, strokesData } = data;
                        const strokes = strokesData?.strokes || [];
                        const strokeCount = strokes.length;
                        
                        return (
                          <div key={`${pageIndex}-${char}`} className={pageLayout.canFitInOnePage ? "character-section border-b border-gray-100 pb-4 last:border-b-0" : "character-section"}>
                            <div className="flex gap-4 items-center mb-2">
                               <TracingCharacterGrid
                                    strokes={strokes}
                                    gridType={settings.gridType}
                                    isExample={true}
                                    gridColor={settings.gridColor}
                                    characterColor={settings.characterColor}
                                    tracingColor={settings.tracingColor}
                                    strokeColor={settings.strokeColor}
                                    completedStrokeColor={settings.completedStrokeColor}
                                />
                                <div className="flex-1">
                                    <CharacterInfo details={details} strokeCount={strokeCount} />
                                </div>
                            </div>
                            {renderPracticeSheet(char)}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* 页脚 */}
                  <div className="page-footer border-t p-2 bg-background mt-auto">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        英语全科启蒙网站导航: 
                        <span className="text-primary ml-1">
                          https://web.terry.dpdns.org/
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="character-page">
              <div className="flex items-center justify-center h-96 text-muted-foreground">
                  {uniqueChars.length === 0 ? 
                    "请在左侧输入姓名以生成字帖" : 
                    "正在加载汉字数据..."
                  }
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
