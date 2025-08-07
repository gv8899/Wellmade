'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
// @ts-ignore
import EditorJS from '@editorjs/editorjs';
// @ts-ignore
import Header from '@editorjs/header';
// @ts-ignore
import List from '@editorjs/list';
// @ts-ignore
import Paragraph from '@editorjs/paragraph';
// @ts-ignore
import Quote from '@editorjs/quote';
// @ts-ignore
import ImageTool from '@editorjs/image';

// 簡化的 OutputData 類型定義
export interface OutputData {
  time?: number;
  blocks: Array<{
    id?: string;
    type: string;
    data: any;
  }>;
  version?: string;
}

import { Text } from '@/design-system';
import api from '@/services/api';
import '@/styles/editor.css';
import '@/styles/medium-editor.css';

export interface RichTextEditorRef {
  save: () => Promise<OutputData>;
  clear: () => void;
}

interface RichTextEditorProps {
  data?: OutputData;
  onChange?: (data: OutputData) => void;
  placeholder?: string;
  readOnly?: boolean;
}

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  ({ data, onChange, placeholder = "開始撰寫你的文章內容...", readOnly = false }, ref) => {
    const editorRef = useRef<EditorJS | null>(null);
    const holderRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      save: async () => {
        if (editorRef.current && editorRef.current.save) {
          try {
            return await editorRef.current.save();
          } catch (error) {
            console.error('Editor save error:', error);
            return { time: Date.now(), blocks: [], version: '2.22.2' };
          }
        }
        return { time: Date.now(), blocks: [], version: '2.22.2' };
      },
      clear: () => {
        if (editorRef.current && editorRef.current.blocks && editorRef.current.blocks.clear) {
          try {
            editorRef.current.blocks.clear();
          } catch (error) {
            console.warn('Editor clear error:', error);
          }
        }
      },
    }));

    useEffect(() => {
      if (!holderRef.current) return;

      // 清理之前的編輯器實例
      if (editorRef.current && editorRef.current.destroy) {
        try {
          editorRef.current.destroy();
        } catch (error) {
          console.warn('Error destroying previous editor instance:', error);
        }
      }

      const editor = new EditorJS({
        holder: holderRef.current,
        placeholder,
        readOnly,
        data: data || {
          time: Date.now(),
          blocks: [],
          version: '2.22.2'
        },
        tools: {
          header: {
            class: Header,
            config: {
              placeholder: '輸入標題...',
              levels: [2, 3, 4],
              defaultLevel: 2,
            },
          },
          paragraph: {
            class: Paragraph,
            inlineToolbar: true,
            config: {
              placeholder: placeholder,
            },
          },
          list: {
            class: List,
            inlineToolbar: true,
            config: {
              defaultStyle: 'unordered',
            },
          },
          quote: {
            class: Quote,
            inlineToolbar: true,
            config: {
              quotePlaceholder: '輸入引用文字...',
              captionPlaceholder: '引用來源（可選）',
            },
          },
          image: {
            class: ImageTool,
            config: {
              captionPlaceholder: '圖片說明...',
              buttonContent: '選擇圖片',
              uploader: {
                async uploadByFile(file: File) {
                  try {
                    const formData = new FormData();
                    formData.append('file', file); // 使用正確的欄位名 'file'
                    
                    // 使用已配置認證的 api 實例
                    const response = await api.post('/admin/upload/image', formData, {
                      headers: {
                        'Content-Type': 'multipart/form-data',
                      },
                      timeout: 30000, // 圖片上傳可能需要更長時間
                    });
                    
                    if (response.data.success) {
                      return {
                        success: 1,
                        file: {
                          url: response.data.imageUrl
                        }
                      };
                    } else {
                      throw new Error(response.data.message || '圖片上傳失敗');
                    }
                  } catch (error) {
                    console.error('圖片上傳錯誤:', error);
                    // 如果上傳失敗，回退到本地 base64
                    return new Promise((resolve) => {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        resolve({
                          success: 1,
                          file: {
                            url: e.target?.result as string
                          }
                        });
                      };
                      reader.readAsDataURL(file);
                    });
                  }
                },
                uploadByUrl(url: string) {
                  return Promise.resolve({
                    success: 1,
                    file: {
                      url: url
                    }
                  });
                }
              }
            }
          },
        },
        onChange: async () => {
          if (onChange && editorRef.current && editorRef.current.save) {
            try {
              const outputData = await editorRef.current.save();
              onChange(outputData);
            } catch (error) {
              console.error('Editor.js save error:', error);
            }
          }
        },
        onReady: () => {
          console.log('Editor.js is ready to work!');
        },
      });

      editorRef.current = editor;

      return () => {
        if (editorRef.current && editorRef.current.destroy) {
          try {
            editorRef.current.destroy();
          } catch (error) {
            console.warn('Error destroying editor on cleanup:', error);
          }
          editorRef.current = null;
        }
      };
    }, [placeholder, readOnly]);

    // 當有初始數據時，編輯器會在創建時自動載入
    // 不需要額外的數據更新邏輯，避免 render 方法不存在的問題

    return (
      <div className="rich-text-editor">
        <div
          ref={holderRef}
          className="min-h-[400px] overflow-visible focus-within:outline-none"
          style={{ minHeight: '400px' }}
        />
        {!readOnly && (
          <Text variant="caption1" className="text-gray-500 mt-2">
            使用 Enter 創建新段落，Tab 鍵縮排，/ 打開工具菜單，@ 插入圖片
          </Text>
        )}
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;