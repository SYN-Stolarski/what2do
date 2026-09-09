import type { TextQuestion } from '../../questionnaire/types'

interface Props {
  q: TextQuestion
  value: string | undefined
  onChange: (v: string) => void
  onSubmit?: () => void
}

export function TextInput({ q, value, onChange, onSubmit }: Props) {
  const v = value ?? ''
  if (q.multiline) {
    return (
      <div className="q__body">
        <textarea
          className="field field--area"
          placeholder={q.placeholder}
          maxLength={q.maxLength}
          value={v}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
        />
        {q.maxLength && (
          <div className="field__count mono">
            {v.length}/{q.maxLength}
          </div>
        )}
      </div>
    )
  }
  return (
    <div className="q__body">
      <input
        className="field"
        type="text"
        autoFocus
        autoComplete="nickname"
        enterKeyHint="next"
        placeholder={q.placeholder}
        maxLength={q.maxLength}
        value={v}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onSubmit) onSubmit()
        }}
      />
    </div>
  )
}
