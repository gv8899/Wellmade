import React, { useId } from 'react';
import { Text } from '../atoms/Text';
import { Input, InputProps } from '../atoms/Input';
import { colors, ColorMode } from '../../tokens/colors';

export interface FormFieldProps extends Omit<InputProps, 'id'> {
  label?: string;
  id?: string;
  required?: boolean;
  helpText?: string;
  errorMessage?: string;
  colorMode?: ColorMode;
  isTextarea?: boolean;
  rows?: number;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  id,
  required = false,
  helpText,
  errorMessage,
  colorMode = 'light',
  error,
  isTextarea = false,
  rows = 3,
  ...inputProps
}) => {
  // 🎯 使用 React 18 的 useId hook 避免 hydration mismatch
  const generatedId = useId();
  const fieldId = id || generatedId;
  const hasError = error || !!errorMessage;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    width: '100%',
  };

  const labelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  };

  const requiredStyle: React.CSSProperties = {
    color: colorMode === 'light' 
      ? colors.danger.light 
      : colors.danger.dark,
  };

  return (
    <div style={containerStyle}>
      {label && (
        <label htmlFor={fieldId} style={labelStyle}>
          <Text 
            variant="subhead" 
            color={colors.neutral.label}
            colorMode={colorMode}
          >
            {label}
          </Text>
          {required && (
            <Text 
              variant="subhead" 
              colorMode={colorMode}
              style={requiredStyle}
            >
              *
            </Text>
          )}
        </label>
      )}
      
      {isTextarea ? (
        <textarea
          id={fieldId}
          rows={rows}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: `1px solid ${hasError ? colors.danger[colorMode] : colors.neutral.tertiaryLabel[colorMode]}`,
            borderRadius: '6px',
            fontSize: '1rem',
            fontFamily: 'inherit',
            resize: 'vertical',
            outline: 'none',
            transition: 'border-color 0.2s ease',
            backgroundColor: colorMode === 'light' ? colors.background.systemBackground.light : colors.background.systemBackground.dark,
            color: colors.neutral.label[colorMode],
          }}
          onFocus={(e) => {
            e.target.style.borderColor = colors.primary[colorMode];
          }}
          onBlur={(e) => {
            e.target.style.borderColor = hasError ? colors.danger[colorMode] : colors.neutral.tertiaryLabel[colorMode];
          }}
          {...(inputProps as any)}
        />
      ) : (
        <Input
          id={fieldId}
          colorMode={colorMode}
          error={hasError}
          {...inputProps}
        />
      )}
      
      {helpText && !hasError && (
        <Text 
          variant="caption1" 
          color={colors.neutral.secondaryLabel}
          colorMode={colorMode}
        >
          {helpText}
        </Text>
      )}
      
      {errorMessage && (
        <Text 
          variant="caption1" 
          color={colors.danger}
          colorMode={colorMode}
        >
          {errorMessage}
        </Text>
      )}
    </div>
  );
};