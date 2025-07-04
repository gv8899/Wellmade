'use client';

import React, { useState } from 'react';
import { Text, Button, Input, FormField, Card } from '@/design-system';
import { colors, uberColors, themeConfig, spacing, shadows, ColorMode } from '@/design-system';

export default function DesignSystemTestPage() {
  const [colorMode, setColorMode] = useState<ColorMode>('light');
  const [inputValue, setInputValue] = useState('');

  const toggleColorMode = () => {
    setColorMode(colorMode === 'light' ? 'dark' : 'light');
  };

  const containerStyle = {
    backgroundColor: colorMode === 'light' ? colors.background.systemBackground.light : colors.background.systemBackground.dark,
    color: colorMode === 'light' ? colors.neutral.label.light : colors.neutral.label.dark,
    minHeight: '100vh',
    padding: '2rem',
    transition: 'all 0.3s ease',
  };

  const sectionStyle = {
    backgroundColor: colorMode === 'light' ? colors.background.secondarySystemBackground.light : colors.background.secondarySystemBackground.dark,
    padding: '2rem',
    borderRadius: '12px',
    marginBottom: '2rem',
  };

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <Text variant="largeTitle" colorMode={colorMode}>
              🚗 Uber 設計系統測試
            </Text>
            <Text variant="body" color={colors.neutral.secondaryLabel} colorMode={colorMode}>
              基於 Uber Base Web 的設計 tokens
            </Text>
          </div>
          <Button variant="secondary" colorMode={colorMode} onClick={toggleColorMode}>
            切換到 {colorMode === 'light' ? 'Dark' : 'Light'} 模式
          </Button>
        </div>

        {/* Typography Section */}
        <div style={sectionStyle}>
          <Text variant="title1" colorMode={colorMode} style={{ marginBottom: '1rem' }}>
            字體系統展示
          </Text>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Text variant="largeTitle" colorMode={colorMode}>Large Title - 34pt</Text>
            <Text variant="title1" colorMode={colorMode}>Title 1 - 28pt</Text>
            <Text variant="title2" colorMode={colorMode}>Title 2 - 22pt</Text>
            <Text variant="title3" colorMode={colorMode}>Title 3 - 20pt</Text>
            <Text variant="headline" colorMode={colorMode}>Headline - 17pt Semibold</Text>
            <Text variant="body" colorMode={colorMode}>Body - 17pt Regular</Text>
            <Text variant="callout" colorMode={colorMode}>Callout - 16pt</Text>
            <Text variant="subhead" colorMode={colorMode}>Subhead - 15pt</Text>
            <Text variant="footnote" colorMode={colorMode}>Footnote - 13pt</Text>
            <Text variant="caption1" colorMode={colorMode}>Caption 1 - 12pt</Text>
            <Text variant="caption2" colorMode={colorMode}>Caption 2 - 11pt</Text>
          </div>
        </div>

        {/* Color Section */}
        <div style={sectionStyle}>
          <Text variant="title1" colorMode={colorMode} style={{ marginBottom: '1rem' }}>
            顏色系統展示
          </Text>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <Text variant="headline" colorMode={colorMode}>語義化顏色</Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                <Text variant="body" color={colors.primary} colorMode={colorMode}>Primary - Uber 藍 (#276EF1)</Text>
                <Text variant="body" color={colors.secondary} colorMode={colorMode}>Secondary - 中性灰</Text>
                <Text variant="body" color={colors.success} colorMode={colorMode}>Success - Uber 綠 (#0E8345)</Text>
                <Text variant="body" color={colors.warning} colorMode={colorMode}>Warning - Uber 黃 (#F6BC2F)</Text>
                <Text variant="body" color={colors.danger} colorMode={colorMode}>Danger - Uber 紅 (#DE1135)</Text>
                <Text variant="body" color={colors.info} colorMode={colorMode}>Info - 資訊色</Text>
              </div>
            </div>

            <div>
              <Text variant="headline" colorMode={colorMode}>Uber 調色盤</Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                <Text variant="body" color={uberColors.accent} colorMode={colorMode}>Accent - 主要藍色</Text>
                <Text variant="body" color={uberColors.positive} colorMode={colorMode}>Positive - 成功綠色</Text>
                <Text variant="body" color={uberColors.warning} colorMode={colorMode}>Warning - 警告黃色</Text>
                <Text variant="body" color={uberColors.negative} colorMode={colorMode}>Negative - 錯誤紅色</Text>
                <Text variant="body" color={uberColors.mono600} colorMode={colorMode}>Mono600 - 中性灰</Text>
                <Text variant="body" color={uberColors.mono800} colorMode={colorMode}>Mono800 - 深灰</Text>
              </div>
            </div>
            
            <div>
              <Text variant="headline" colorMode={colorMode}>Label Colors</Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                <Text variant="body" color={colors.neutral.label} colorMode={colorMode}>Primary Label</Text>
                <Text variant="body" color={colors.neutral.secondaryLabel} colorMode={colorMode}>Secondary Label</Text>
                <Text variant="body" color={colors.neutral.tertiaryLabel} colorMode={colorMode}>Tertiary Label</Text>
                <Text variant="body" color={colors.neutral.placeholderText} colorMode={colorMode}>Placeholder Text</Text>
              </div>
            </div>
          </div>
        </div>

        {/* Button Section */}
        <div style={sectionStyle}>
          <Text variant="title1" colorMode={colorMode} style={{ marginBottom: '1rem' }}>
            按鈕系統展示
          </Text>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <Text variant="headline" colorMode={colorMode} style={{ marginBottom: '0.5rem' }}>
                按鈕變體
              </Text>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Button variant="primary" colorMode={colorMode}>Primary</Button>
                <Button variant="secondary" colorMode={colorMode}>Secondary</Button>
                <Button variant="success" colorMode={colorMode}>Success</Button>
                <Button variant="warning" colorMode={colorMode}>Warning</Button>
                <Button variant="danger" colorMode={colorMode}>Danger</Button>
                <Button variant="info" colorMode={colorMode}>Info</Button>
                <Button variant="primary" colorMode={colorMode} disabled>Disabled</Button>
              </div>
            </div>
            
            <div>
              <Text variant="headline" colorMode={colorMode} style={{ marginBottom: '0.5rem' }}>
                按鈕尺寸
              </Text>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <Button variant="primary" size="small" colorMode={colorMode}>Small</Button>
                <Button variant="primary" size="medium" colorMode={colorMode}>Medium</Button>
                <Button variant="primary" size="large" colorMode={colorMode}>Large</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div style={sectionStyle}>
          <Text variant="title1" colorMode={colorMode} style={{ marginBottom: '1rem' }}>
            輸入框系統展示
          </Text>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
            <div>
              <Text variant="headline" colorMode={colorMode} style={{ marginBottom: '0.5rem' }}>
                一般狀態
              </Text>
              <Input
                placeholder="請輸入文字..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                colorMode={colorMode}
              />
            </div>
            
            <div>
              <Text variant="headline" colorMode={colorMode} style={{ marginBottom: '0.5rem' }}>
                錯誤狀態
              </Text>
              <Input
                placeholder="這是錯誤狀態"
                colorMode={colorMode}
                error={true}
              />
            </div>
            
            <div>
              <Text variant="headline" colorMode={colorMode} style={{ marginBottom: '0.5rem' }}>
                禁用狀態
              </Text>
              <Input
                placeholder="禁用狀態"
                colorMode={colorMode}
                disabled={true}
              />
            </div>
          </div>
        </div>

        {/* Molecules Section */}
        <div style={sectionStyle}>
          <Text variant="title1" colorMode={colorMode} style={{ marginBottom: '1rem' }}>
            分子組件展示 (Molecules)
          </Text>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <Text variant="headline" colorMode={colorMode} style={{ marginBottom: '1rem' }}>
                FormField 表單欄位
              </Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
                <FormField
                  label="用戶名稱"
                  placeholder="請輸入用戶名稱"
                  required
                  helpText="用戶名稱將顯示在您的個人資料中"
                  colorMode={colorMode}
                />
                
                <FormField
                  label="電子郵件"
                  type="email"
                  placeholder="請輸入電子郵件"
                  required
                  colorMode={colorMode}
                />
                
                <FormField
                  label="密碼"
                  type="password"
                  placeholder="請輸入密碼"
                  required
                  errorMessage="密碼長度至少需要 8 個字元"
                  colorMode={colorMode}
                />
              </div>
            </div>

            <div>
              <Text variant="headline" colorMode={colorMode} style={{ marginBottom: '1rem' }}>
                Card 卡片組件
              </Text>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <Card
                  title="預設卡片"
                  subtitle="使用預設樣式的卡片"
                  colorMode={colorMode}
                >
                  <Text variant="body" colorMode={colorMode}>
                    這是卡片的內容區域，可以放置任何內容。
                  </Text>
                </Card>

                <Card
                  title="陰影卡片"
                  subtitle="帶有陰影效果的卡片"
                  variant="elevated"
                  colorMode={colorMode}
                >
                  <Text variant="body" colorMode={colorMode}>
                    這張卡片具有陰影效果，看起來更有層次感。
                  </Text>
                </Card>

                <Card
                  title="邊框卡片"
                  subtitle="帶有邊框的卡片"
                  variant="outlined"
                  colorMode={colorMode}
                >
                  <Text variant="body" colorMode={colorMode}>
                    這張卡片具有邊框，適合用在需要明確分隔的場景。
                  </Text>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Example */}
        <div style={sectionStyle}>
          <Text variant="title1" colorMode={colorMode} style={{ marginBottom: '1rem' }}>
            實際使用範例
          </Text>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px' }}>
            <Card
              title="商品購買表單"
              subtitle="使用原子設計系統構建的表單"
              variant="elevated"
              colorMode={colorMode}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <FormField
                  label="商品名稱"
                  placeholder="請輸入商品名稱"
                  required
                  colorMode={colorMode}
                />
                
                <FormField
                  label="購買數量"
                  type="number"
                  placeholder="1"
                  required
                  helpText="最少購買數量為 1 件"
                  colorMode={colorMode}
                />
                
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <Button variant="secondary" colorMode={colorMode}>
                    加入購物車
                  </Button>
                  <Button variant="primary" colorMode={colorMode}>
                    立即購買
                  </Button>
                </div>
              </div>
            </Card>
            
            <Text variant="footnote" color={colors.neutral.secondaryLabel} colorMode={colorMode}>
              * 此為設計系統測試範例，展示原子設計的層級結構
            </Text>
          </div>
        </div>

        {/* Theme Configuration Demo */}
        <div style={sectionStyle}>
          <Text variant="title1" colorMode={colorMode} style={{ marginBottom: '1rem' }}>
            🚗 Uber 設計系統特色
          </Text>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Text variant="body" colorMode={colorMode}>
              目前使用 <strong>Uber Base Web</strong> 設計系統，主色調為 Uber 品牌藍色 (#276EF1)
            </Text>
            
            <Text variant="callout" color={colors.neutral.secondaryLabel} colorMode={colorMode}>
              ✨ 包含完整的 Uber 字體系統 (UberMoveText)、顏色調色盤、間距系統和陰影效果
            </Text>
            
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Text variant="caption1" color={colors.primary} colorMode={colorMode}>● Uber 藍色主調</Text>
              <Text variant="caption1" color={colors.success} colorMode={colorMode}>● 成功綠色</Text>
              <Text variant="caption1" color={colors.warning} colorMode={colorMode}>● 警告黃色</Text>
              <Text variant="caption1" color={colors.danger} colorMode={colorMode}>● 危險紅色</Text>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
              gap: '1rem',
              marginTop: '1rem'
            }}>
              <div style={{ 
                padding: spacing.scale400, 
                backgroundColor: colors.primary.light,
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <Text variant="caption1" style={{ color: '#FFFFFF' }}>
                  Uber 間距系統
                </Text>
              </div>
              <div style={{ 
                padding: spacing.scale400, 
                backgroundColor: colors.success.light,
                borderRadius: '8px',
                textAlign: 'center',
                boxShadow: shadows.shadow400
              }}>
                <Text variant="caption1" style={{ color: '#FFFFFF' }}>
                  Uber 陰影效果
                </Text>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Button variant="secondary" colorMode={colorMode} onClick={() => window.history.back()}>
            回到上一頁
          </Button>
        </div>
      </div>
    </div>
  );
}